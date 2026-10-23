import * as React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Mail, ShieldCheck } from 'lucide-react'

import { AuthShell, glassInput } from '@/components/auth/AuthShell'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/hooks/use-auth'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { apiUrl, isApiConfigured } from '@/lib/apiClient'
import { cn } from '@/lib/utils'

export function Login() {
  const { isAuthenticated, signIn } = useAuth()
  const { settings: site } = useSiteSettings()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

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
    navigate('/admin')
  }

  return (
    <AuthShell
      logo={<Logo text={site.logo_text} imageUrl={site.logo_image_url} />}
      badge="Admin Console"
      badgeIcon={ShieldCheck}
      title="Welcome back"
      subtitle="Sign in to manage clients, projects, payments and your website."
      footer={
        <>
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
          <Link to="/client/login" className="inline-flex items-center gap-1.5 hover:text-white">
            Client login <ArrowRight className="size-4" />
          </Link>
        </>
      }
    >
      {!isApiConfigured() && (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          The API is not configured. Set VITE_API_BASE_URL to use the admin panel.
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-white/80">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(glassInput, 'pl-10')}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/80">
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
            id="password"
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
                <p className="mb-2 font-semibold text-white/90">Reset your admin password</p>
                <ol className="list-decimal space-y-1 pl-4">
                  <li>
                    cPanel → File Manager → <span className="text-white/90">public_html/api</span>
                  </li>
                  <li>
                    Create an empty file named <code className="rounded bg-white/10 px-1 text-white">reset-admin.txt</code>
                  </li>
                  <li>Open the reset page and set a new password</li>
                </ol>
                <a
                  href={apiUrl('/reset-admin.php')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary mt-3 inline-flex items-center gap-1.5 font-semibold hover:underline"
                >
                  Open reset page <ExternalLink className="size-3.5" />
                </a>
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
          disabled={submitting || !isApiConfigured()}
          className="mt-2 h-12 gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_10px_30px_-8px] shadow-orange-500/60 hover:opacity-95"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          {submitting ? 'Signing in…' : 'Sign in securely'}
        </Button>
      </form>
    </AuthShell>
  )
}
