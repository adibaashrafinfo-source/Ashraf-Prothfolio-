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
import { TestimonialsAdmin } from '@/pages/admin/TestimonialsAdmin'
import { MessagesPage } from '@/pages/admin/MessagesPage'

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
          <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
          <Route path="/admin/messages" element={<MessagesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
