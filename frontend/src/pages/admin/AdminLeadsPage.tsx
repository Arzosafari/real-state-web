import { useCallback, useState, type ChangeEvent } from 'react'

import { IconSearch } from '@/components/icons'
import { EmptyState, ErrorNote, Pagination, Spinner, cx } from '@/components/ui/Primitives'
import { useApi, useDebounced } from '@/hooks/useApi'
import { ApiError, api, getToken } from '@/lib/api'
import { formatDate, formatDateTime, humanStatus } from '@/lib/format'
import type { ConsultationRequest, Inquiry, Page } from '@/lib/types'

const INQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'in_progress', 'converted', 'closed']
const CONSULTATION_STATUSES = ['pending_confirmation', 'confirmed', 'completed', 'cancelled']

type Tab = 'inquiries' | 'consultations'

export function AdminLeadsPage() {
  const [tab, setTab] = useState<Tab>('inquiries')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [openNotes, setOpenNotes] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [exporting, setExporting] = useState(false)

  const debounced = useDebounced(query, 350)

  const inquiries = useApi<Page<Inquiry>>('/admin/inquiries', {
    q: debounced || undefined,
    status: status || undefined,
    page,
    page_size: 20,
  })
  const consultations = useApi<Page<ConsultationRequest>>('/admin/consultations', {
    status: status || undefined,
    page,
    page_size: 20,
  })

  const reloadBoth = useCallback(() => {
    inquiries.reload()
    consultations.reload()
  }, [inquiries, consultations])

  async function setInquiryStatus(inquiry: Inquiry, next: string) {
    setNotice(null)
    setFailure(null)
    try {
      await api.patch(`/admin/inquiries/${inquiry.id}`, { status: next })
      setNotice(`${inquiry.name} marked as ${humanStatus(next).toLowerCase()}.`)
      inquiries.reload()
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : 'The status could not be updated.')
    }
  }

  async function saveNotes(inquiry: Inquiry) {
    setNotice(null)
    setFailure(null)
    try {
      await api.patch(`/admin/inquiries/${inquiry.id}`, { internal_notes: notes })
      setNotice(`Notes saved for ${inquiry.name}.`)
      setOpenNotes(null)
      inquiries.reload()
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : 'The notes could not be saved.')
    }
  }

  async function setConsultationStatus(item: ConsultationRequest, next: string) {
    setNotice(null)
    setFailure(null)
    try {
      await api.patch(`/admin/consultations/${item.id}`, { status: next })
      setNotice(`${item.name} marked as ${humanStatus(next).toLowerCase()}.`)
      consultations.reload()
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : 'The status could not be updated.')
    }
  }

  async function exportCsv() {
    setFailure(null)
    setExporting(true)
    try {
      const token = getToken()
      const response = await fetch('/api/admin/inquiries/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'urbanledge-leads.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setNotice('Export downloaded.')
    } catch {
      setFailure('The export could not be generated. Your session may have expired.')
    } finally {
      setExporting(false)
    }
  }

  const current = tab === 'inquiries' ? inquiries : consultations
  const statuses = tab === 'inquiries' ? INQUIRY_STATUSES : CONSULTATION_STATUSES

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl">Leads</h1>
          <p className="mt-2 max-w-prose text-sm text-ink/70">
            Enquiries and consultation requests submitted through the public site.
          </p>
        </div>
        {tab === 'inquiries' && (
          <button type="button" className="btn-outline-dark" onClick={exportCsv} disabled={exporting}>
            {exporting ? 'Preparing…' : 'Export CSV'}
          </button>
        )}
      </div>

      <div role="tablist" aria-label="Lead types" className="flex flex-wrap gap-2">
        {(
          [
            { id: 'inquiries', label: 'Enquiries' },
            { id: 'consultations', label: 'Consultations' },
          ] as { id: Tab; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id)
              setStatus('')
              setPage(1)
            }}
            className={cx(
              'border px-5 py-2 font-sans text-[0.66rem] uppercase tracking-label',
              tab === item.id ? 'border-gold bg-gold text-white' : 'border-hairline bg-white text-ink hover:border-gold',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {notice && (
        <p className="border border-gold/50 bg-white px-4 py-3 text-sm text-ink/80" role="status">
          {notice}
        </p>
      )}
      {failure && <ErrorNote message={failure} />}

      <div className="flex flex-wrap items-end gap-4 border border-hairline bg-white p-4">
        {tab === 'inquiries' && (
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search enquiries</span>
            <IconSearch className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-warmgray" />
            <input
              type="search"
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search by name, email or message"
              className="field-control pl-10"
            />
          </label>
        )}
        <label className="block">
          <span className="field-label">Status</span>
          <select
            className="field-control"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {humanStatus(item)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="link-arrow mb-3 text-gold-deep hover:text-ink" onClick={reloadBoth}>
          Refresh
        </button>
      </div>

      {current.loading && <Spinner label="Loading leads" />}
      {current.error && <ErrorNote message={current.error} onRetry={current.reload} />}

      {!current.loading && tab === 'inquiries' && inquiries.data && inquiries.data.items.length === 0 && (
        <EmptyState title="No enquiries match" copy="Try clearing the search or the status filter." />
      )}
      {!current.loading && tab === 'consultations' && consultations.data && consultations.data.items.length === 0 && (
        <EmptyState title="No consultation requests" copy="Requests booked from the public site appear here." />
      )}

      {tab === 'inquiries' && inquiries.data && inquiries.data.items.length > 0 && (
        <ul className="space-y-4">
          {inquiries.data.items.map((inquiry) => (
            <li key={inquiry.id} className="border border-hairline bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl">{inquiry.name}</p>
                  <p className="mt-1 text-xs text-warmgray">
                    {inquiry.email}
                    {inquiry.phone && ` · ${inquiry.phone}`}
                    {inquiry.company && ` · ${inquiry.company}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[0.62rem] uppercase tracking-label text-gold-deep">
                    {inquiry.inquiry_type}
                  </p>
                  <p className="mt-1 text-xs text-warmgray">{formatDateTime(inquiry.created_at)}</p>
                  <p className="mt-1 text-xs text-warmgray">Source: {inquiry.source}</p>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm text-ink/80">{inquiry.message}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-4">
                <label className="flex items-center gap-3 text-xs uppercase tracking-label text-warmgray">
                  Status
                  <select
                    className="field-control w-auto py-2"
                    value={inquiry.status}
                    onChange={(event) => setInquiryStatus(inquiry, event.target.value)}
                    aria-label={`Status for ${inquiry.name}`}
                  >
                    {INQUIRY_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {humanStatus(item)}
                      </option>
                    ))}
                  </select>
                </label>

                {inquiry.property_reference && (
                  <span className="text-xs text-warmgray">Ref {inquiry.property_reference}</span>
                )}
                {inquiry.project_title && <span className="text-xs text-warmgray">{inquiry.project_title}</span>}

                <button
                  type="button"
                  className="link-arrow ml-auto text-gold-deep hover:text-ink"
                  onClick={() => {
                    setOpenNotes(openNotes === inquiry.id ? null : inquiry.id)
                    setNotes(inquiry.internal_notes ?? '')
                  }}
                >
                  {openNotes === inquiry.id ? 'Close notes' : 'Internal notes'}
                </button>
              </div>

              {openNotes === inquiry.id && (
                <div className="mt-4">
                  <label className="field-label" htmlFor={`notes-${inquiry.id}`}>
                    Internal notes (never shown publicly)
                  </label>
                  <textarea
                    id={`notes-${inquiry.id}`}
                    rows={3}
                    className="field-control"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                  <button type="button" className="btn-gold mt-3" onClick={() => saveNotes(inquiry)}>
                    Save notes
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === 'consultations' && consultations.data && consultations.data.items.length > 0 && (
        <ul className="space-y-4">
          {consultations.data.items.map((item) => (
            <li key={item.id} className="border border-hairline bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl">{item.name}</p>
                  <p className="mt-1 text-xs text-warmgray">
                    {item.email}
                    {item.phone && ` · ${item.phone}`}
                    {item.company && ` · ${item.company}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[0.62rem] uppercase tracking-label text-gold-deep">
                    {item.inquiry_type}
                  </p>
                  <p className="mt-1 text-xs text-warmgray">{formatDateTime(item.created_at)}</p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">Preferred date</dt>
                  <dd className="mt-1">{item.preferred_date ? formatDate(item.preferred_date) : 'To be agreed'}</dd>
                </div>
                <div>
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">Preferred time</dt>
                  <dd className="mt-1">{item.preferred_time ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">Timezone</dt>
                  <dd className="mt-1">{item.timezone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">Location</dt>
                  <dd className="mt-1">{item.project_location ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">Budget</dt>
                  <dd className="mt-1">{item.budget ?? '—'}</dd>
                </div>
              </dl>

              {item.description && (
                <p className="mt-4 whitespace-pre-line text-sm text-ink/80">{item.description}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-hairline pt-4">
                <label className="flex items-center gap-3 text-xs uppercase tracking-label text-warmgray">
                  Status
                  <select
                    className="field-control w-auto py-2"
                    value={item.status}
                    onChange={(event) => setConsultationStatus(item, event.target.value)}
                    aria-label={`Status for ${item.name}`}
                  >
                    {CONSULTATION_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {humanStatus(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="text-xs text-warmgray">
                  Preferred times are requests — confirm the slot directly with the customer.
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {current.data && current.data.items.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            page={current.data.page}
            pages={current.data.pages}
            total={current.data.total}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
