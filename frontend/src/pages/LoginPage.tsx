import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { TextField } from '@/components/ui/Field'
import { ErrorNote } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const { signIn, user, ready, isStaff } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  usePageMeta({ title: 'Sign in', noindex: true })

  useEffect(() => {
    if (ready && user) {
      const target = location.state?.from ?? (isStaff ? '/admin' : '/account')
      navigate(target, { replace: true })
    }
  }, [ready, user, isStaff, navigate, location.state])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not sign you in. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="bg-evergreen text-ivory">
      <div className="shell grid min-h-screen gap-14 py-32 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow text-gold">Account</p>
          <span className="rule mt-4 bg-gold/70" />
          <h1 className="mt-5 text-ivory">Welcome Back.</h1>
          <p className="mt-6 max-w-prose text-[1.02rem] text-ivory/75">
            Sign in to keep a shortlist of listings, follow your enquiries and manage your
            consultation requests.
          </p>
          <ul className="mt-10 space-y-4 border-t border-ivory/20 pt-8 text-sm text-ivory/70">
            <li>Saved properties and projects in one place.</li>
            <li>A record of every enquiry you have sent.</li>
            <li>Your preferred consultation times and status.</li>
          </ul>
        </div>

        <div className="border border-ivory/20 bg-evergreen/60 p-6 sm:p-10">
          <h2 className="font-serif text-2xl text-ivory">Sign in</h2>
          <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
            {error && <ErrorNote message={error} />}
            <div className="[&_.field-label]:text-ivory/70">
              <TextField
                label="Email"
                name="email"
                type="email"
                required
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />
              <div className="mt-5">
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={setPassword}
                  placeholder="Your password"
                />
              </div>
            </div>
            <button type="submit" className="btn-gold w-full" disabled={sending}>
              {sending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ivory/70">
            No account yet?{' '}
            <Link to="/register" className="text-gold underline">
              Create one
            </Link>
            .
          </p>
          <p className="mt-4 text-xs text-ivory/45">
            Demonstration deployment: sign-in is required to reach the administration area.
          </p>
        </div>
      </div>
    </section>
  )
}
