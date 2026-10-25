import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { TextField } from '@/components/ui/Field'
import { EmptyState, ErrorNote, SuccessNote } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { useApi } from '@/hooks/useApi'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ApiError, api } from '@/lib/api'
import { formatDate, formatDateTime, formatPrice, humanStatus } from '@/lib/format'
import type { ConsultationRequest, Inquiry, Property } from '@/lib/types'

export function AccountPage() {
  const { user, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({ name: '', phone: '', company: '' })
  const [profileState, setProfileState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [profileError, setProfileError] = useState<string | null>(null)

  const [passwords, setPasswords] = useState({ current: '', next: '' })
  const [passwordState, setPasswordState] = useState<'idle' | 'saving'>('idle')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null)

  const inquiries = useApi<Inquiry[]>('/me/inquiries')
  const consultations = useApi<ConsultationRequest[]>('/me/consultations')
  const shortlist = useApi<{ properties: Property[] }>('/me/saved')

  usePageMeta({ title: 'My account', noindex: true })

  useEffect(() => {
    if (!user) return
    setProfile({ name: user.name, phone: user.phone ?? '', company: user.company ?? '' })
  }, [user])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setProfileState('saving')
    setProfileError(null)
    try {
      await updateProfile({
        name: profile.name,
        phone: profile.phone,
        company: profile.company,
      })
      setProfileState('saved')
    } catch (err) {
      setProfileState('idle')
      setProfileError(err instanceof ApiError ? err.message : 'We could not save your details.')
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordState('saving')
    setPasswordError(null)
    setPasswordNotice(null)
    try {
      const result = await api.post<{ message: string }>('/auth/password', undefined, {
        current: passwords.current,
        new: passwords.next,
      })
      setPasswordNotice(result.message)
      setPasswords({ current: '', next: '' })
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'We could not update your password.')
    } finally {
      setPasswordState('idle')
    }
  }

  async function removeSaved(property: Property) {
    try {
      await api.del(`/me/saved/properties/${property.id}`)
      shortlist.reload()
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Your shortlist could not be updated.')
    }
  }

  if (!user) return null

  return (
    <>
      <section className="bg-evergreen pt-32 text-ivory lg:pt-36">
        <div className="shell flex flex-wrap items-end justify-between gap-8 pb-14">
          <div>
            <p className="eyebrow text-gold">My account</p>
            <span className="rule mt-4 bg-gold/70" />
            <h1 className="mt-5 text-ivory">{user.name}</h1>
            <p className="mt-4 text-sm text-ivory/70">
              {user.email} · member since {formatDate(user.created_at)}
            </p>
          </div>
          <button
            type="button"
            className="btn-outline-light"
            onClick={() => {
              signOut()
              navigate('/')
            }}
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="bg-soft py-16 lg:py-24">
        <div className="shell space-y-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">Your details</p>
              <span className="rule mt-4" />
              <form onSubmit={saveProfile} className="mt-8 space-y-5" noValidate>
                {profileError && <ErrorNote message={profileError} />}
                {profileState === 'saved' && (
                  <SuccessNote title="Details updated" copy="Your contact information has been saved." />
                )}
                <TextField
                  label="Full name"
                  name="name"
                  required
                  value={profile.name}
                  onChange={(value) => setProfile((prev) => ({ ...prev, name: value }))}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(value) => setProfile((prev) => ({ ...prev, phone: value }))}
                  />
                  <TextField
                    label="Company"
                    name="company"
                    value={profile.company}
                    onChange={(value) => setProfile((prev) => ({ ...prev, company: value }))}
                  />
                </div>
                <button type="submit" className="btn-gold" disabled={profileState === 'saving'}>
                  {profileState === 'saving' ? 'Saving…' : 'Save details'}
                </button>
              </form>
            </div>

            <div>
              <p className="eyebrow">Password</p>
              <span className="rule mt-4" />
              <form onSubmit={savePassword} className="mt-8 space-y-5" noValidate>
                {passwordError && <ErrorNote message={passwordError} />}
                {passwordNotice && <SuccessNote title="Password updated" copy={passwordNotice} />}
                <TextField
                  label="Current password"
                  name="current"
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(value) => setPasswords((prev) => ({ ...prev, current: value }))}
                />
                <TextField
                  label="New password"
                  name="next"
                  type="password"
                  required
                  hint="At least 8 characters."
                  value={passwords.next}
                  onChange={(value) => setPasswords((prev) => ({ ...prev, next: value }))}
                />
                <button type="submit" className="btn-outline-dark" disabled={passwordState === 'saving'}>
                  {passwordState === 'saving' ? 'Updating…' : 'Change password'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Shortlist</p>
                <span className="rule mt-4" />
                <h2 className="mt-5">Saved Properties.</h2>
              </div>
              <Link to="/properties" className="link-arrow text-gold-deep hover:text-ink">
                Browse listings
              </Link>
            </div>

            <div className="mt-8">
              {shortlist.loading && <p className="text-sm text-warmgray">Loading your shortlist…</p>}
              {shortlist.error && <ErrorNote message={shortlist.error} onRetry={shortlist.reload} />}
              {shortlist.data && shortlist.data.properties.length === 0 && (
                <EmptyState
                  title="Nothing saved yet"
                  copy="Tap the star on any listing to keep it here."
                  action={
                    <Link to="/properties" className="btn-outline-dark">
                      Browse properties
                    </Link>
                  }
                />
              )}
              {shortlist.data && shortlist.data.properties.length > 0 && (
                <ul className="divide-y divide-hairline border-y border-hairline">
                  {shortlist.data.properties.map((property) => (
                    <li key={property.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                      <div>
                        <Link
                          to={`/properties/${property.slug}`}
                          className="font-serif text-xl hover:text-gold-deep"
                        >
                          {property.title}
                        </Link>
                        <p className="mt-1 text-sm text-ink/65">
                          {property.location} · {formatPrice(property.price, property.currency, property.price_period)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="link-arrow text-warmgray hover:text-ink"
                        onClick={() => removeSaved(property)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">Your enquiries</p>
              <span className="rule mt-4" />
              <div className="mt-8">
                {inquiries.loading && <p className="text-sm text-warmgray">Loading your enquiries…</p>}
                {inquiries.error && <ErrorNote message={inquiries.error} onRetry={inquiries.reload} />}
                {inquiries.data && inquiries.data.length === 0 && (
                  <EmptyState title="No enquiries yet" copy="Messages you send will appear here." />
                )}
                {inquiries.data && inquiries.data.length > 0 && (
                  <ul className="space-y-4">
                    {inquiries.data.map((inquiry) => (
                      <li key={inquiry.id} className="border border-hairline bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-sans text-[0.64rem] uppercase tracking-label text-gold-deep">
                            {inquiry.inquiry_type}
                          </p>
                          <span className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
                            {humanStatus(inquiry.status)}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm text-ink/75">{inquiry.message}</p>
                        <p className="mt-4 text-xs text-warmgray">
                          {formatDateTime(inquiry.created_at)}
                          {inquiry.property_reference && ` · Ref ${inquiry.property_reference}`}
                          {inquiry.project_title && ` · ${inquiry.project_title}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <p className="eyebrow">Consultations</p>
              <span className="rule mt-4" />
              <div className="mt-8">
                {consultations.loading && <p className="text-sm text-warmgray">Loading your requests…</p>}
                {consultations.error && (
                  <ErrorNote message={consultations.error} onRetry={consultations.reload} />
                )}
                {consultations.data && consultations.data.length === 0 && (
                  <EmptyState
                    title="No consultations requested"
                    copy="Book a call with the team and it will appear here."
                    action={
                      <Link to="/book-consultation" className="btn-outline-dark">
                        Book a consultation
                      </Link>
                    }
                  />
                )}
                {consultations.data && consultations.data.length > 0 && (
                  <ul className="space-y-4">
                    {consultations.data.map((item) => (
                      <li key={item.id} className="border border-hairline bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-sans text-[0.64rem] uppercase tracking-label text-gold-deep">
                            {item.inquiry_type}
                          </p>
                          <span className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">
                            {humanStatus(item.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-ink/75">
                          Requested {item.preferred_date ? formatDate(item.preferred_date) : 'a date to be agreed'}
                          {item.preferred_time ? `, ${item.preferred_time}` : ''}
                        </p>
                        <p className="mt-2 text-xs text-warmgray">{formatDateTime(item.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
