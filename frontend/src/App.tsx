import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Layout } from '@/components/layout/Layout'
import { Spinner } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'

import { AboutPage } from '@/pages/AboutPage'
import { AccountPage } from '@/pages/AccountPage'
import { ApproachPage } from '@/pages/ApproachPage'
import { ArticlePage } from '@/pages/ArticlePage'
import { BookConsultationPage } from '@/pages/BookConsultationPage'
import { ContactPage } from '@/pages/ContactPage'
import { GalleryPage } from '@/pages/GalleryPage'
import { HomePage } from '@/pages/HomePage'
import { InsightsPage } from '@/pages/InsightsPage'
import { LegalPage } from '@/pages/LegalPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { PropertiesPage } from '@/pages/PropertiesPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ServiceDetailPage } from '@/pages/ServiceDetailPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { SitemapPage } from '@/pages/SitemapPage'
import { AdminContentPage } from '@/pages/admin/AdminContentPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminLeadsPage } from '@/pages/admin/AdminLeadsPage'
import { AdminPropertiesPage } from '@/pages/admin/AdminPropertiesPage'
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'

function RequireAuth({ children, staff = false }: { children: ReactNode; staff?: boolean }) {
  const { user, ready, isStaff } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="shell py-32">
        <Spinner label="Checking your session" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (staff && !isStaff) return <Navigate to="/account" replace />
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/approach" element={<ApproachPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/insights/:slug" element={<ArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/book-consultation" element={<BookConsultationPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth staff>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
