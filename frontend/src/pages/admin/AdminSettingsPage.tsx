import { useEffect, useState, type FormEvent } from 'react'

import { ErrorNote, Spinner, SuccessNote } from '@/components/ui/Primitives'
import { useApi } from '@/hooks/useApi'
import { ApiError, api } from '@/lib/api'
import { formatDate } from '@/lib/format'
import type { User } from '@/lib/types'

const ROLES = ['admin', 'editor', 'customer']

export function AdminSettingsPage() {
  const settings = useApi<Record<string, unknown>>('/admin/settings')
  const users = useApi<User[]>('/admin/users')

  const [draft, setDraft] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [failure, setFailure] = useState<string | null>(null)
  const [purgeNotice, setPurgeNotice] = useState<string | null>(null)

  useEffect(() => {
    if (settings.data) setDraft(JSON.stringify(settings.data, null, 2))
  }, [settings.data])

  async function saveSettings(event: FormEvent) {
    event.preventDefault()
    setFailure(null)
    setParseError(null)
    setSaveState('saving')

    let parsed: unknown
    try {
      parsed = JSON.parse(draft)
    } catch {
      setParseError('This is not valid JSON. Fix the syntax and try again.')
      setSaveState('idle')
      return
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setParseError('The settings must be a JSON object.')
      setSaveState('idle')
      return
    }

    try {
      await api.put('/admin/settings', { data: parsed })
      setSaveState('saved')
      settings.reload()
    } catch (err) {
      setSaveState('idle')
      setFailure(
        err instanceof ApiError ? err.message : 'The settings could not be saved. Administrator rights are required.',
      )
    }
  }

  async function changeRole(user: User, role: string) {
    setFailure(null)
    try {
      await api.patch(`/admin/users/${user.id}/role`, undefined, { role })
      users.reload()
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : 'The role could not be changed.')
    }
  }

  async function purgeDemo() {
    if (
      !window.confirm(
        'Delete every record flagged as demonstration content? Properties, projects, articles, FAQs and gallery images will be removed.',
      )
    ) {
      return
    }
    setFailure(null)
    setPurgeNotice(null)
    try {
      const result = await api.post<{ removed: Record<string, number> }>('/admin/demo-content/purge')
      const total = Object.values(result.removed).reduce((sum, count) => sum + count, 0)
      setPurgeNotice(`${total} demonstration record${total === 1 ? '' : 's'} removed.`)
      settings.reload()
    } catch (err) {
      setFailure(
        err instanceof ApiError ? err.message : 'The purge could not be completed. Administrator rights are required.',
      )
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-3xl">Settings</h1>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          Site configuration, registered users and the demonstration dataset. Settings changes
          require an administrator account.
        </p>
      </div>

      {failure && <ErrorNote message={failure} />}

      <section>
        <h2 className="font-serif text-2xl">Site settings</h2>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          Brand, contact details, navigation, hero and section copy used across every public page.
          Edit the JSON and save — the public site reads it immediately.
        </p>

        {settings.loading && <Spinner label="Loading settings" />}
        {settings.error && <ErrorNote message={settings.error} onRetry={settings.reload} />}

        {settings.data && (
          <form onSubmit={saveSettings} className="mt-6 space-y-4">
            {saveState === 'saved' && <SuccessNote title="Settings saved" copy="The public pages will pick up the change on their next load." />}
            {parseError && <ErrorNote message={parseError} />}
            <label className="field-label" htmlFor="settings-json">
              Settings JSON
            </label>
            <textarea
              id="settings-json"
              rows={24}
              spellCheck={false}
              className="w-full border border-hairline bg-white p-4 font-mono text-xs leading-relaxed"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-gold" disabled={saveState === 'saving'}>
                {saveState === 'saving' ? 'Saving…' : 'Save settings'}
              </button>
              <button
                type="button"
                className="btn-outline-dark"
                onClick={() => setDraft(JSON.stringify(settings.data, null, 2))}
              >
                Discard changes
              </button>
            </div>
          </form>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl">Users</h2>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          Registered accounts. Editors can manage content and leads; administrators can also change
          settings and roles.
        </p>

        {users.loading && <Spinner label="Loading users" />}
        {users.error && <ErrorNote message={users.error} onRetry={users.reload} />}

        {users.data && users.data.length > 0 && (
          <div className="mt-6 overflow-x-auto border border-hairline bg-white">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  {['Name', 'Email', 'Registered', 'Role'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 font-sans text-[0.62rem] uppercase tracking-label text-warmgray"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.data.map((user) => (
                  <tr key={user.id} className="border-b border-hairline/60 last:border-b-0">
                    <td className="px-4 py-3 text-ink/85">{user.name}</td>
                    <td className="px-4 py-3 text-ink/70">{user.email}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        className="field-control w-auto py-2"
                        value={user.role}
                        onChange={(event) => changeRole(user, event.target.value)}
                        aria-label={`Role for ${user.name}`}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border border-hairline bg-white p-6">
        <h2 className="font-serif text-2xl">Demonstration content</h2>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          Everything seeded for the layout demonstration is flagged as demo content. Purging removes
          those records in one action so the site can be filled with real material. Accounts are not
          deleted.
        </p>
        {purgeNotice && <div className="mt-4"><SuccessNote title="Demo content purged" copy={purgeNotice} /></div>}
        <button type="button" className="btn-outline-dark mt-5" onClick={purgeDemo}>
          Purge demonstration content
        </button>
      </section>
    </div>
  )
}
