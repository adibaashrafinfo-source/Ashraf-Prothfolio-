import * as React from 'react'
import { Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { RequireAuth } from '@/components/admin/RequireAuth'
import { Home } from '@/pages/Home'
import { ProjectDetail } from '@/pages/ProjectDetail'

/** Admin + client-portal pages load on demand so public visitors never download them. */
// oxlint-disable-next-line no-explicit-any -- any page props are allowed; the lazy component keeps M[K]'s real type
function lazyPage<M extends Record<K, React.ComponentType<any>>, K extends keyof M & string>(
  load: () => Promise<M>,
  name: K,
): React.LazyExoticComponent<M[K]> {
  return React.lazy(() => load().then((m) => ({ default: m[name] })))
}

const Login = lazyPage(() => import('@/pages/admin/Login'), 'Login')
const AdminLayout = lazyPage(() => import('@/pages/admin/AdminLayout'), 'AdminLayout')
const Dashboard = lazyPage(() => import('@/pages/admin/Dashboard'), 'Dashboard')
const SettingsPage = lazyPage(() => import('@/pages/admin/SettingsPage'), 'SettingsPage')
const SocialLinksPage = lazyPage(() => import('@/pages/admin/SocialLinksPage'), 'SocialLinksPage')
const PortfolioAdmin = lazyPage(() => import('@/pages/admin/PortfolioAdmin'), 'PortfolioAdmin')
const ClientLogosPage = lazyPage(() => import('@/pages/admin/ClientLogosPage'), 'ClientLogosPage')
const TestimonialsAdmin = lazyPage(
  () => import('@/pages/admin/TestimonialsAdmin'),
  'TestimonialsAdmin',
)
const LeadsPage = lazyPage(() => import('@/pages/admin/LeadsPage'), 'LeadsPage')
const DocumentsListPage = lazyPage(
  () => import('@/pages/admin/DocumentsListPage'),
  'DocumentsListPage',
)
const DocumentEditPage = lazyPage(
  () => import('@/pages/admin/DocumentEditPage'),
  'DocumentEditPage',
)
const ClientsPage = lazyPage(() => import('@/pages/admin/crm/ClientsPage'), 'ClientsPage')
const ClientDetailPage = lazyPage(
  () => import('@/pages/admin/crm/ClientDetailPage'),
  'ClientDetailPage',
)
const ProjectsPage = lazyPage(() => import('@/pages/admin/crm/ProjectsPage'), 'ProjectsPage')
const ProjectDetailPage = lazyPage(
  () => import('@/pages/admin/crm/ProjectDetailPage'),
  'ProjectDetailPage',
)
const PaymentsPage = lazyPage(() => import('@/pages/admin/crm/PaymentsPage'), 'PaymentsPage')
const ReportsPage = lazyPage(() => import('@/pages/admin/crm/ReportsPage'), 'ReportsPage')
const ClientLogin = lazyPage(() => import('@/pages/client/ClientLogin'), 'ClientLogin')
const ClientPortal = lazyPage(() => import('@/pages/client/ClientPortal'), 'ClientPortal')

function PageFallback() {
  return (
    <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
      Loading…
    </div>
  )
}

function App() {
  return (
    <React.Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio/:id" element={<ProjectDetail />} />
        </Route>

        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client" element={<ClientPortal />} />

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
            <Route
              path="/admin/quotations/new"
              element={<DocumentEditPage newKind="quotation" />}
            />
            <Route path="/admin/invoices" element={<DocumentsListPage kind="invoice" />} />
            <Route path="/admin/invoices/new" element={<DocumentEditPage newKind="invoice" />} />
            <Route path="/admin/documents/:id" element={<DocumentEditPage />} />
            <Route path="/admin/crm/clients" element={<ClientsPage />} />
            <Route path="/admin/crm/clients/:id" element={<ClientDetailPage />} />
            <Route path="/admin/crm/projects" element={<ProjectsPage />} />
            <Route path="/admin/crm/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/admin/crm/payments" element={<PaymentsPage />} />
            <Route path="/admin/crm/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </React.Suspense>
  )
}

export default App
