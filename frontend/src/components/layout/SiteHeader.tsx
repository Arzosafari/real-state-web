import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { IconArrow, IconClose, IconMenu, UrbanLedgeMark } from '@/components/icons'
import { cx } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { useSite } from '@/context/SiteContext'

const FALLBACK_NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'Approach', to: '/approach' },
  { label: 'Insights', to: '/insights' },
  { label: 'Contact', to: '/contact' },
]

export function SiteHeader() {
  const { settings } = useSite()
  const { user, isStaff } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const navigation = settings?.navigation?.length ? settings.navigation : FALLBACK_NAV
  const brandName = settings?.brand?.name ?? 'UrbanLedge'
  const tagline = settings?.brand?.tagline ?? 'People. Places. Possibility.'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
          scrolled || open ? 'bg-evergreen/95 backdrop-blur supports-[backdrop-filter]:bg-evergreen/85' : 'bg-transparent',
        )}
      >
        <div className="shell flex items-center justify-between gap-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-ivory" aria-label={`${brandName} — home`}>
            <UrbanLedgeMark className="h-8 w-8 text-gold" />
            <span className="leading-tight">
              <span className="block font-sans text-sm font-medium uppercase tracking-label">{brandName}</span>
              <span className="hidden text-[0.55rem] uppercase tracking-label text-ivory/60 sm:block">{tagline}</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'font-sans text-[0.68rem] uppercase tracking-label transition-colors duration-base',
                        isActive ? 'text-gold' : 'text-ivory/85 hover:text-gold',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={isStaff ? '/admin' : '/account'}
                className="hidden font-sans text-[0.68rem] uppercase tracking-label text-ivory/85 hover:text-gold sm:block"
              >
                {isStaff ? 'Admin' : 'My account'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden font-sans text-[0.68rem] uppercase tracking-label text-ivory/85 hover:text-gold sm:block"
              >
                Sign in
              </Link>
            )}
            <Link to="/book-consultation" className="btn-gold hidden text-[0.65rem] sm:inline-flex">
              Book a consultation <IconArrow className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center border border-ivory/40 text-ivory lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          hidden={!open}
          className="border-t border-ivory/15 bg-evergreen/98 lg:hidden"
        >
          <nav aria-label="Mobile" className="shell py-6">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'block border-b border-ivory/10 py-3 font-sans text-sm uppercase tracking-label',
                        isActive ? 'text-gold' : 'text-ivory/90',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink to="/properties" className="block border-b border-ivory/10 py-3 font-sans text-sm uppercase tracking-label text-ivory/90">
                  Properties
                </NavLink>
              </li>
              <li>
                <NavLink to="/gallery" className="block border-b border-ivory/10 py-3 font-sans text-sm uppercase tracking-label text-ivory/90">
                  Gallery
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={user ? (isStaff ? '/admin' : '/account') : '/login'}
                  className="block border-b border-ivory/10 py-3 font-sans text-sm uppercase tracking-label text-ivory/90"
                >
                  {user ? (isStaff ? 'Admin' : 'My account') : 'Sign in'}
                </NavLink>
              </li>
            </ul>
            <Link to="/book-consultation" className="btn-gold mt-6 w-full">
              Book a consultation <IconArrow className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
