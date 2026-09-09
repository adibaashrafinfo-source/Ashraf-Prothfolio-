import * as React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Site Settings', to: '/admin/settings' },
  { label: 'Social Links', to: '/admin/social' },
  { label: 'Portfolio', to: '/admin/portfolio' },
  { label: 'Testimonials', to: '/admin/testimonials' },
  { label: 'Messages', to: '/admin/messages' },
]

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <header className="border-border bg-background border-b">
        <div className="container-px mx-auto flex h-16 max-w-6xl items-center justify-between">
          <span className="font-display text-lg font-bold">
            Admin<span className="text-primary">.</span>
          </span>

          <nav className="hidden items-center gap-1 md:flex">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="/" target="_blank" rel="noreferrer">
                View site
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 sm:inline-flex"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {open && (
          <nav className="border-border container-px mx-auto flex max-w-6xl flex-col gap-1 border-t py-3 md:hidden">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              View site
            </a>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-secondary"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </nav>
        )}
      </header>

      <main className="container-px mx-auto max-w-6xl py-10">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
