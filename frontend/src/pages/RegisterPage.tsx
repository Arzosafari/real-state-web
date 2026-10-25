import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ConsentField, TextField } from '@/components/ui/Field'
import { ErrorNote } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ApiError } from '@/lib/api'

export function RegisterPage() {
  const { register, user, ready } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  usePageMeta({ title: 'Create an account', noindex: true })

  useEffect(() => {
    if (ready && user) navigate('/account', { replace: true })
  }, [ready, user, navigate])

  function update(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFailure(null)
    setErrors({})

    if (!consent) {
      setErrors({ consent: 'Please accept the privacy policy to continue.' })
      return
    }

    setSending(true)
    try {
      await register({
        ...values,
        phone: values.phone || undefined,
        company: values.company || undefined,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setFailure(error.message)
        setErrors(
          Object.fromEntries(error.fields.map((item) => [item.field.split('.').pop() ?? item.field, item.message])),
        )
      } else {
        setFailure('We could not create your account. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="bg-soft py-32">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Create an account</p>
          <span className="rule mt-4" />
          <h1 className="mt-5">Keep Track Of What You Like.</h1>
          <p className="mt-6 max-w-prose text-[1.02rem] text-ink/75">
            An account lets you save listings and projects, and keeps a record of your enquiries and
            consultation requests.
          </p>
          <dl className="mt-10 space-y-6 border-t border-hairline pt-8 text-sm">
            <div>
              <dt className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Your shortlist</dt>
              <dd className="mt-2 text-ink/75">Save properties and projects and return to them later.</dd>
            </div>
            <div>
              <dt className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Your enquiries</dt>
              <dd className="mt-2 text-ink/75">See every message you have sent and its current status.</dd>
            </div>
            <div>
              <dt className="font-sans text-[0.62rem] uppercase tracking-label text-warmgray">Your details</dt>
              <dd className="mt-2 text-ink/75">
                Update your contact information so enquiries arrive pre-filled.
              </dd>
            </div>
          </dl>
        </div>

        <div className="border border-hairline bg-white p-6 sm:p-10">
          <h2 className="font-serif text-2xl">Create your account</h2>
          <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
            {failure && <ErrorNote message={failure} />}

            <TextField
              label="Full name"
              name="name"
              required
              value={values.name}
              error={errors.name}
              onChange={(value) => update('name', value)}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              value={values.email}
              error={errors.email}
              onChange={(value) => update('email', value)}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              value={values.password}
              error={errors.password}
              hint="At least 8 characters."
              onChange={(value) => update('password', value)}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={values.phone}
                error={errors.phone}
                onChange={(value) => update('phone', value)}
              />
              <TextField
                label="Company"
                name="company"
                value={values.company}
                error={errors.company}
                onChange={(value) => update('company', value)}
              />
            </div>

            <ConsentField name="consent" checked={consent} error={errors.consent} onChange={setConsent}>
              I agree to the{' '}
              <Link to="/privacy" className="text-gold-deep underline">
                privacy policy
              </Link>{' '}
              and understand this is a demonstration deployment.
            </ConsentField>

            <button type="submit" className="btn-gold w-full" disabled={sending}>
              {sending ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink/70">
            Already registered?{' '}
            <Link to="/login" className="text-gold-deep underline">
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
