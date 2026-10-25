import { useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { IconClose, IconPlus, IconSearch } from '@/components/icons'
import { EmptyState, ErrorNote, Spinner, cx } from '@/components/ui/Primitives'
import { useApi, useDebounced } from '@/hooks/useApi'
import { ApiError, api } from '@/lib/api'

type Row = Record<string, unknown>

export type CrudFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'list'
  | 'pairs'
  | 'json'

export interface CrudField {
  name: string
  label: string
  type: CrudFieldType
  required?: boolean
  hint?: string
  options?: string[]
  rows?: number
  wide?: boolean
}

export interface CrudColumn {
  name: string
  label: string
  render?: (row: Row) => ReactNode
}

interface CrudManagerProps {
  resource: string
  singular: string
  plural: string
  description: string
  columns: CrudColumn[]
  fields: CrudField[]
  defaults: Row
  canDelete?: boolean
}

function toFormValue(field: CrudField, raw: unknown): string | boolean {
  if (field.type === 'checkbox') return Boolean(raw)
  if (field.type === 'list') return Array.isArray(raw) ? raw.join('\n') : ''
  if (field.type === 'pairs') {
    return Array.isArray(raw)
      ? raw
          .map((item) => {
            const pair = item as { label?: string; url?: string; value?: string }
            return `${pair.label ?? ''}: ${pair.url ?? pair.value ?? ''}`
          })
          .join('\n')
      : ''
  }
  if (field.type === 'json') return raw === null || raw === undefined ? '[]' : JSON.stringify(raw, null, 2)
  if (raw === null || raw === undefined) return ''
  return String(raw)
}

function toPayloadValue(field: CrudField, value: string | boolean): { value: unknown; error?: string } {
  const text = typeof value === 'string' ? value : ''
  switch (field.type) {
    case 'checkbox':
      return { value: Boolean(value) }
    case 'number':
      if (text.trim() === '') return { value: null }
      return Number.isNaN(Number(text)) ? { value: null, error: 'Enter a number.' } : { value: Number(text) }
    case 'date':
      return { value: text.trim() === '' ? null : text }
    case 'list':
      return { value: text.split('\n').map((item) => item.trim()).filter(Boolean) }
    case 'pairs':
      return {
        value: text
          .split('\n')
          .map((line) => {
            const index = line.indexOf(':')
            const label = (index === -1 ? line : line.slice(0, index)).trim()
            const rest = (index === -1 ? '' : line.slice(index + 1)).trim()
            return { label, url: rest, value: rest }
          })
          .filter((pair) => pair.label !== ''),
      }
    case 'json':
      if (text.trim() === '') return { value: [] }
      try {
        return { value: JSON.parse(text) }
      } catch {
        return { value: [], error: 'This is not valid JSON.' }
      }
    default:
      return { value: text }
  }
}

function cellValue(row: Row, column: CrudColumn): ReactNode {
  if (column.render) return column.render(row)
  const value = row[column.name]
  if (value === null || value === undefined || value === '') return <span className="text-warmgray">—</span>
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  const text = String(value)
  return text.length > 70 ? `${text.slice(0, 70)}…` : text
}

interface EditorProps {
  resource: string
  singular: string
  fields: CrudField[]
  record: Row | null
  defaults: Row
  onCancel: () => void
  onSaved: (message: string) => void
}

function EditorForm({ resource, singular, fields, record, defaults, onCancel, onSaved }: EditorProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {}
    fields.forEach((field) => {
      initial[field.name] = toFormValue(field, record ? record[field.name] : defaults[field.name])
    })
    return initial
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update(name: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFailure(null)
    const payload: Row = {}
    const localErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const converted = toPayloadValue(field, values[field.name])
      if (converted.error) localErrors[field.name] = converted.error
      payload[field.name] = converted.value
    })

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors)
      return
    }

    setErrors({})
    setSaving(true)
    try {
      if (record) {
        await api.patch(`/admin/${resource}/${record.id}`, payload)
        onSaved(`${singular} updated.`)
      } else {
        await api.post(`/admin/${resource}`, payload)
        onSaved(`${singular} created.`)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFailure(error.message)
        setErrors(
          Object.fromEntries(
            error.fields.map((item) => [item.field.split('.').pop() ?? item.field, item.message]),
          ),
        )
      } else {
        setFailure('The record could not be saved.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-hairline bg-white p-6 sm:p-8" noValidate>
      <div className="flex items-start justify-between gap-6">
        <h3 className="font-serif text-2xl">
          {record ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center border border-hairline text-ink hover:border-ink"
          aria-label="Close the editor"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>

      {failure && <div className="mt-6"><ErrorNote message={failure} /></div>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name]
          const common = {
            id: `admin-${field.name}`,
            name: field.name,
            'aria-invalid': Boolean(error),
            className: cx('field-control', error && 'border-red-600/70'),
          }
          return (
            <div key={field.name} className={cx(field.wide && 'sm:col-span-2')}>
              <label htmlFor={`admin-${field.name}`} className="field-label">
                {field.label}
                {field.required && <span className="text-gold-deep"> *</span>}
              </label>

              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 border border-hairline px-4 py-3 text-sm">
                  <input
                    id={common.id}
                    name={field.name}
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(event) => update(field.name, event.target.checked)}
                    className="h-4 w-4 accent-gold"
                  />
                  <span className="text-ink/75">{field.hint ?? field.label}</span>
                </label>
              ) : field.type === 'textarea' || field.type === 'json' ? (
                <textarea
                  {...common}
                  rows={field.rows ?? (field.type === 'json' ? 8 : 4)}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => update(field.name, event.target.value)}
                  className={cx(common.className, 'font-mono text-xs')}
                />
              ) : field.type === 'select' ? (
                <select
                  {...common}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => update(field.name, event.target.value)}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'list' || field.type === 'pairs' ? (
                <textarea
                  {...common}
                  rows={field.rows ?? 4}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => update(field.name, event.target.value)}
                />
              ) : (
                <input
                  {...common}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={String(values[field.name] ?? '')}
                  onChange={(event) => update(field.name, event.target.value)}
                />
              )}

              {field.hint && !error && (
                <p className="mt-2 whitespace-pre-line text-xs text-warmgray">{field.hint}</p>
              )}
              {error && (
                <p className="mt-2 text-xs text-red-700" role="alert">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="submit" className="btn-gold" disabled={saving}>
          {saving ? 'Saving…' : record ? 'Save changes' : `Create ${singular.toLowerCase()}`}
        </button>
        <button type="button" className="btn-outline-dark" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

/** List + editor for one admin resource, shared by every content type. */
export function CrudManager({
  resource,
  singular,
  plural,
  description,
  columns,
  fields,
  defaults,
  canDelete = true,
}: CrudManagerProps) {
  const [query, setQuery] = useState('')
  const debounced = useDebounced(query, 350)
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const params = useMemo(() => ({ q: debounced || undefined }), [debounced])
  const { data, loading, error, reload } = useApi<Row[]>(`/admin/${resource}`, params)

  async function remove(row: Row) {
    const label = String(row.title ?? row.question ?? row.name ?? row.id)
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return
    setFailure(null)
    try {
      await api.del(`/admin/${resource}/${row.id}`)
      setNotice(`Deleted “${label}”.`)
      reload()
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : 'The record could not be deleted.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-3xl">{plural}</h2>
          <p className="mt-2 max-w-prose text-sm text-ink/70">{description}</p>
        </div>
        <button
          type="button"
          className="btn-gold"
          onClick={() => {
            setNotice(null)
            setFailure(null)
            setEditing('new')
          }}
        >
          <IconPlus className="h-4 w-4" /> New {singular.toLowerCase()}
        </button>
      </div>

      {notice && (
        <p className="border border-gold/50 bg-white px-4 py-3 text-sm text-ink/80" role="status">
          {notice}
        </p>
      )}
      {failure && <ErrorNote message={failure} />}

      {editing !== null && (
        <EditorForm
          key={editing === 'new' ? 'new' : String(editing.id)}
          resource={resource}
          singular={singular}
          fields={fields}
          record={editing === 'new' ? null : editing}
          defaults={defaults}
          onCancel={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null)
            setNotice(message)
            reload()
          }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border border-hairline bg-white px-4 py-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Search {plural.toLowerCase()}</span>
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warmgray" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${plural.toLowerCase()}`}
            className="field-control pl-10"
          />
        </label>
        <p className="font-sans text-[0.66rem] uppercase tracking-label text-warmgray">
          {data ? `${data.length} record${data.length === 1 ? '' : 's'}` : 'Loading…'}
        </p>
      </div>

      {loading && <Spinner label={`Loading ${plural.toLowerCase()}`} />}
      {error && <ErrorNote message={error} onRetry={reload} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title={`No ${plural.toLowerCase()} yet`}
          copy={`Create the first record to see it here.`}
        />
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto border border-hairline bg-white">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">{plural} administration table</caption>
            <thead>
              <tr className="border-b border-hairline text-left">
                {columns.map((column) => (
                  <th
                    key={column.name}
                    scope="col"
                    className="px-4 py-3 font-sans text-[0.62rem] uppercase tracking-label text-warmgray"
                  >
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={String(row.id)} className="border-b border-hairline/60 last:border-b-0">
                  {columns.map((column) => (
                    <td key={column.name} className="px-4 py-3 align-top text-ink/80">
                      {cellValue(row, column)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      className="link-arrow text-gold-deep hover:text-ink"
                      onClick={() => {
                        setNotice(null)
                        setFailure(null)
                        setEditing(row)
                      }}
                    >
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        className="link-arrow ml-4 text-warmgray hover:text-ink"
                        onClick={() => remove(row)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
