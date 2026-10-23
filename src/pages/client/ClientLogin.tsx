import * as React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, LayoutDashboard } from 'lucide-react'

import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientAuth } from '@/hooks/use-client-auth'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function ClientLogin() {
  const { isAuthenticated, signIn } = useClientAuth()
  const { settings: site } = useSiteSettings()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  if (isAuthenticated) return <Navigate to="/client" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/client')
  }

  return (
    <div className="bg-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="from-background via-background/90 to-background pointer-events-none absolute inset-0 bg-gradient-to-b" />
      <div className="bg-primary/20 pointer-events-none absolute -top-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo text={site.logo_text} imageUrl={site.logo_image_url} />
        </Link>
        <div className="border-border bg-card rounded-2xl border p-8 shadow-xl shadow-black/5">
          <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-xl">
            <LayoutDashboard className="size-5" />
          </div>
          <h1 className="font-display text-xl font-bold">Client dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to follow your project's progress, stages and payments.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-email">Email</Label>
              <Input id="client-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-password">Password</Label>
              <Input
                id="client-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" size="lg" disabled={submitting} className="mt-2 gap-2">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="text-muted-foreground mt-5 text-center text-xs">
            Don't have a login? Ask us — we'll set up your dashboard access.
          </p>
        </div>
        <Link to="/" className="text-muted-foreground hover:text-foreground mt-6 flex items-center justify-center gap-1.5 text-sm">
          <ArrowLeft className="size-4" /> Back to website
        </Link>
      </div>
    </div>
  )
}
