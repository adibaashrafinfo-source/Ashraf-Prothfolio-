import * as React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard, Loader2, LogIn, Mail, MessageCircle } from 'lucide-react'

import { AuthShell, glassInput } from '@/components/auth/AuthShell'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useClientAuth } from '@/hooks/use-client-auth'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { cn } from '@/lib/utils'

export function ClientLogin() {
  const { isAuthenticated, signIn } = useClientAuth()
  const { settings: site } = useSiteSettings()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)

  if (isAuthenticated) return <Navigate to="/client" replace />

  const whatsapp = site.phone ? `https://wa.me/${site.phone.replace(/\D/g, '').replace(/^0/, '880')}` : null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/client')
  }

  return (
    <AuthShell
      logo={
        <Link to="/">
          <Logo text={site.logo_text} imageUrl={site.logo_image_url} />
        </Link>
      }
      badge="Client Portal"
      badgeIcon={LayoutDashboard}
      title="Track your project"
      subtitle="Sign in to see live progress, project stages and payments."
      footer={
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white">
          <ArrowLeft className="size-4" /> Back to website
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="client-email" className="text-white/80">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
            <Input
              id="client-email"
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(glassInput, 'pl-10')}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="client-password" className="text-white/80">
              Password
            </Label>
            <button
              type="button"
              onClick={() => setHelpOpen((v) => !v)}
              className="text-primary text-xs font-medium hover:underline"
              aria-expanded={helpOpen}
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="client-password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={glassInput}
          />
        </div>

        <AnimatePresence initial={false}>
          {helpOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/65">
                Message us and we'll set a new password for your dashboard right away.
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center gap-1.5 font-semibold text-emerald-400 hover:underline"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp {site.phone}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
              exit={{ opacity: 0 }}
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-2 h-12 gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_10px_30px_-8px] shadow-orange-500/60 hover:opacity-95"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-center text-xs text-white/40">
          Don't have a login yet? Ask us and we'll set up your dashboard.
        </p>
      </form>
    </AuthShell>
  )
}
