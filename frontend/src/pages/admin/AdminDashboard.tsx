import { Link } from 'react-router-dom'

import { IconArrow } from '@/components/icons'
import { ErrorNote, Spinner } from '@/components/ui/Primitives'
import { useApi } from '@/hooks/useApi'
import { formatDateTime, humanStatus } from '@/lib/format'
import type { AdminOverview, AdminStats } from '@/lib/types'

function StatCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="border border-hairline bg-white p-5">
      <p className="font-sans text-[0.6rem] uppercase tracking-label text-warmgray">{label}</p>
      <p className="mt-3 font-serif text-3xl text-ink">{value}</p>
      {note && <p className="mt-2 text-xs text-warmgray">{note}</p>}
    </div>
  )
}

export function AdminDashboard() {
  const stats = useApi<AdminStats>('/admin/stats')
  const overview = useApi<AdminOverview>('/admin/overview')

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          Live counts from this deployment&rsquo;s own database. Nothing here is estimated or
          inferred.
        </p>
      </div>

      {stats.loading && <Spinner label="Loading figures" />}
      {stats.error && <ErrorNote message={stats.error} onRetry={stats.reload} />}

      {stats.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Listings" value={stats.data.properties_total} note={`${stats.data.properties_available} available`} />
            <StatCard label="Projects" value={stats.data.projects_total} note={`${stats.data.projects_published} published`} />
            <StatCard label="Enquiries" value={stats.data.inquiries_total} note={`${stats.data.inquiries_new} new`} />
            <StatCard
              label="Consultations pending"
              value={stats.data.consultations_pending}
              note={`${stats.data.registered_users} registered users`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Listings sold or rented" value={stats.data.properties_sold_or_rented} />
            <StatCard label="Articles published" value={stats.data.articles_published} />
            <StatCard label="Articles in draft" value={stats.data.articles_draft} />
            <StatCard label="New enquiries" value={stats.data.inquiries_new} />
          </div>
        </>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-2xl">Recent enquiries</h2>
            <Link to="/admin/leads" className="link-arrow text-gold-deep hover:text-ink">
              All leads <IconArrow className="h-4 w-4" />
            </Link>
          </div>

          {overview.loading && <Spinner label="Loading leads" />}
          {overview.error && <ErrorNote message={overview.error} onRetry={overview.reload} />}

          {overview.data && overview.data.recent_inquiries.length === 0 && (
            <p className="mt-6 border border-hairline bg-white px-4 py-6 text-sm text-ink/70">
              No enquiries yet. Submissions from the public forms appear here.
            </p>
          )}

          {overview.data && overview.data.recent_inquiries.length > 0 && (
            <div className="mt-6 overflow-x-auto border border-hairline bg-white">
              <table className="w-full min-w-[38rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    {['Name', 'Type', 'Status', 'Received'].map((heading) => (
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
                  {overview.data.recent_inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="border-b border-hairline/60 last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="block text-ink">{inquiry.name}</span>
                        <span className="text-xs text-warmgray">{inquiry.email}</span>
                      </td>
                      <td className="px-4 py-3 text-ink/75">{inquiry.inquiry_type}</td>
                      <td className="px-4 py-3 text-ink/75">{humanStatus(inquiry.status)}</td>
                      <td className="px-4 py-3 text-ink/60">{formatDateTime(inquiry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="border border-hairline bg-white p-5">
            <h2 className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
              Listing status
            </h2>
            <ul className="mt-4 space-y-3">
              {(overview.data?.listing_status_summary ?? []).map((item) => (
                <li key={item.status} className="flex items-center justify-between text-sm">
                  <span className="text-ink/75">{humanStatus(item.status)}</span>
                  <span className="font-serif text-lg">{item.count}</span>
                </li>
              ))}
              {overview.data && overview.data.listing_status_summary.length === 0 && (
                <li className="text-sm text-warmgray">No listings recorded.</li>
              )}
            </ul>
          </div>

          <div className="border border-hairline bg-white p-5">
            <h2 className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
              Recently updated listings
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(overview.data?.recent_properties ?? []).map((item) => (
                <li key={item.id}>
                  <Link to={`/properties/${item.slug}`} className="text-ink hover:text-gold-deep">
                    {item.title}
                  </Link>
                  <span className="mt-1 block text-xs text-warmgray">
                    {humanStatus(item.status)} · {formatDateTime(item.updated_at)}
                  </span>
                </li>
              ))}
              {overview.data && overview.data.recent_properties.length === 0 && (
                <li className="text-warmgray">No listings recorded.</li>
              )}
            </ul>
          </div>

          <div className="border border-hairline bg-white p-5">
            <h2 className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
              Demonstration content
            </h2>
            <p className="mt-4 text-sm text-ink/70">
              Every seeded record is flagged, so you can see exactly what to replace. Purging is
              available on the settings page.
            </p>
            <Link to="/admin/settings" className="link-arrow mt-4 inline-flex text-gold-deep hover:text-ink">
              Open settings <IconArrow className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
