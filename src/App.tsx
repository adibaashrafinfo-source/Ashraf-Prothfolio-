import { Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { RequireAuth } from '@/components/admin/RequireAuth'
import { Home } from '@/pages/Home'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Login } from '@/pages/admin/Login'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { Dashboard } from '@/pages/admin/Dashboard'
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { SocialLinksPage } from '@/pages/admin/SocialLinksPage'
import { PortfolioAdmin } from '@/pages/admin/PortfolioAdmin'
import { ClientLogosPage } from '@/pages/admin/ClientLogosPage'
import { TestimonialsAdmin } from '@/pages/admin/TestimonialsAdmin'
import { LeadsPage } from '@/pages/admin/LeadsPage'
import { DocumentsListPage } from '@/pages/admin/DocumentsListPage'
import { DocumentEditPage } from '@/pages/admin/DocumentEditPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio/:id" element={<ProjectDetail />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/social" element={<SocialLinksPage />} />
          <Route path="/admin/portfolio" element={<PortfolioAdmin />} />
          <Route path="/admin/clients" element={<ClientLogosPage />} />
          <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
          <Route path="/admin/leads" element={<LeadsPage />} />
          <Route path="/admin/quotations" element={<DocumentsListPage kind="quotation" />} />
          <Route path="/admin/quotations/new" element={<DocumentEditPage newKind="quotation" />} />
          <Route path="/admin/invoices" element={<DocumentsListPage kind="invoice" />} />
          <Route path="/admin/invoices/new" element={<DocumentEditPage newKind="invoice" />} />
          <Route path="/admin/documents/:id" element={<DocumentEditPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
