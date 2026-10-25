import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { IconArrow, UrbanLedgeMark } from '@/components/icons'
import { cx } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { usePageMeta } from '@/hooks/usePageMeta'

const LINKS = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Properties', to: '/admin/properties' },
  { label: 'Projects', to: '/admin/projects' },
  { label: 'Leads', to: '/admin/leads' },
  { label: 'Content', to: '/admin/content' },
  { label: 'Settings', to: '/admin/settings' },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  usePageMeta({ title: 'Administration', noindex: true })

  return (
    <div className="min-h-screen bg-soft">
      <header className="border-b border-ivory/15 bg-evergreen text-ivory">
        <div className="shell flex flex-wrap items-center justify-between gap-6 py-5">
          <div className="flex items-center gap-3">
            <UrbanLedgeMark className="h-7 w-7 text-gold" />
            <span className="leading-tight">
              <span className="block font-sans text-sm font-medium uppercase tracking-label">
                Administration
              </span>
              <span className="block text-[0.58rem] uppercase tracking-label text-ivory/60">
                {user?.name} · {user?.role}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/" className="link-arrow text-ivory/80 hover:text-gold">
              View site <IconArrow className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="link-arrow text-ivory/80 hover:text-gold"
              onClick={() => {
                signOut()
                navigate('/')
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        <nav aria-label="Administration" className="shell">
          <ul className="flex flex-wrap gap-1 pb-3">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cx(
                      'inline-flex border px-4 py-2 font-sans text-[0.66rem] uppercase tracking-label transition-colors duration-base',
                      isActive
                        ? 'border-gold bg-gold text-white'
                        : 'border-ivory/25 text-ivory/80 hover:border-gold hover:text-gold',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="shell py-12">
        <Outlet />
      </main>
    </div>
  )
}
