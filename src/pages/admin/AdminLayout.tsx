import * as React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  FolderKanban,
  LayoutDashboard,
  KeyRound,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Receipt,
  Settings,
  Share2,
  Users,
  Wallet,
  X,
} from 'lucide-react'

import { ChangePasswordModal } from '@/components/admin/ChangePasswordModal'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'
import { apiPut } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: null,
    links: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'CRM',
    links: [
      { label: 'Clients', to: '/admin/crm/clients', icon: Users },
      { label: 'Projects', to: '/admin/crm/projects', icon: FolderKanban },
      { label: 'Payments', to: '/admin/crm/payments', icon: Wallet },
      { label: 'Daily Report', to: '/admin/crm/reports', icon: CalendarDays },
    ],
  },
  {
    label: 'Sales',
    links: [
      { label: 'Leads', to: '/admin/leads', icon: Mail },
      { label: 'Quotations', to: '/admin/quotations', icon: FileText },
      { label: 'Invoices', to: '/admin/invoices', icon: Receipt },
    ],
  },
  {
    label: 'Website',
    links: [
      { label: 'Portfolio', to: '/admin/portfolio', icon: Briefcase },
      { label: 'Client Logos', to: '/admin/clients', icon: Building2 },
      { label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquareQuote },
      { label: 'Social Links', to: '/admin/social', icon: Share2 },
      { label: 'Site Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

function SidebarNav({
  onNavigate,
  onSignOut,
  onChangePassword,
}: {
  onNavigate?: () => void
  onSignOut: () => void
  onChangePassword: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label ?? 'main'} className="flex flex-col gap-0.5">
            {group.label && (
              <p className="text-muted-foreground px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                {group.label}
              </p>
            )}
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin' || link.to === '/admin/clients'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )
                }
              >
                <link.icon className="size-4 shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-border flex flex-col gap-0.5 border-t p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <ExternalLink className="size-4" /> View site
        </a>
        <button
          onClick={onChangePassword}
          className="text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          <KeyRound className="size-4" /> Change password
        </button>
        <button
          onClick={onSignOut}
          className="text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [pwOpen, setPwOpen] = React.useState(false)
  const openPassword = () => {
    setOpen(false)
    setPwOpen(true)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const brand = (
    <span className="font-display text-lg font-bold">
      Admin<span className="text-primary">.</span>
    </span>
  )

  return (
    <div className="bg-secondary/30 min-h-screen">
      <aside className="border-border bg-background fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r lg:flex print:hidden">
        <div className="border-border flex h-16 shrink-0 items-center border-b px-6">{brand}</div>
        <SidebarNav onSignOut={handleSignOut} onChangePassword={openPassword} />
      </aside>

      <header className="border-border bg-background sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 lg:hidden print:hidden">
        {brand}
        <Button variant="ghost" size="icon" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu />
        </Button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="bg-background absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl">
            <div className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4">
              {brand}
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} onSignOut={handleSignOut} onChangePassword={openPassword} />
          </aside>
        </div>
      )}

      <main className="lg:pl-60 print:pl-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10 print:max-w-none print:p-0">
          <Outlet />
        </div>
      </main>
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} save={(body) => apiPut('/auth/password', body)} />
      <Toaster />
    </div>
  )
}
