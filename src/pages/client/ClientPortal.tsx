import * as React from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  CalendarDays,
  ExternalLink,
  FolderKanban,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquareText,
  Wallet,
} from 'lucide-react'

import { ChangePasswordModal } from '@/components/admin/ChangePasswordModal'
import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { EmptyState, MoneySummary, Pill, StatCard } from '@/components/crm/bits'
import { StageTimeline } from '@/components/crm/StageTimeline'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { useClientAuth } from '@/hooks/use-client-auth'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { toast } from '@/hooks/use-toast'
import { errorMessage, hasValidToken, portalGet, portalPut } from '@/lib/apiClient'
import { deadlineLabel, formatDate, isOverdue, paymentTypeMeta, projectStatusMeta, stageStatusMeta } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type { CrmProject, PortalData } from '@/types/crm'

/** Sums amounts per currency so mixed-currency clients see e.g. "৳50,000 + $200". */
function sumLabel(projects: CrmProject[], pick: (p: CrmProject) => number) {
  const totals = projects.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.currency]: (acc[p.currency] ?? 0) + pick(p) }), {})
  const entries = Object.entries(totals)
  if (entries.length === 0) return formatMoney(0)
  return entries.map(([cur, v]) => formatMoney(v, cur)).join(' + ')
}

function ProgressRing({ value }: { value: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={r} className="stroke-secondary" strokeWidth="7" fill="none" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className={cn('transition-colors duration-700', value === 100 ? 'stroke-emerald-500' : 'stroke-primary')}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <span className="font-display absolute inset-0 flex items-center justify-center text-xl font-bold">{value}%</span>
    </div>
  )
}

/** How often the open dashboard re-checks for admin-side updates (shared hosting: polling, not sockets). */
const POLL_MS = 15_000

export function ClientPortal() {
  const { isAuthenticated, signOut } = useClientAuth()
  const { settings: site } = useSiteSettings()
  const navigate = useNavigate()
  const [data, setData] = React.useState<PortalData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [pwOpen, setPwOpen] = React.useState(false)

  const [lastSynced, setLastSynced] = React.useState<Date | null>(null)
  const snapshot = React.useRef<string | null>(null)

  /** silent = background refresh: no error banner, but announce changes made from the admin side. */
  const load = React.useCallback(
    async (silent: boolean) => {
      try {
        const d = await portalGet<PortalData>('/me')
        const signature = JSON.stringify([d.projects, d.payments, d.activity.map((a) => a.id)])
        if (silent && snapshot.current !== null && signature !== snapshot.current) {
          toast({ title: 'Your project was just updated', description: d.activity[0]?.message })
        }
        snapshot.current = signature
        setData(d)
        setSelectedId((id) => (id && d.projects.some((p) => p.id === id) ? id : (d.projects[0]?.id ?? null)))
        setLastSynced(new Date())
        setError(null)
      } catch (err) {
        if (!hasValidToken('client')) {
          signOut()
          navigate('/client/login', { replace: true })
          return
        }
        if (!silent) setError(errorMessage(err))
      }
    },
    [navigate, signOut],
  )

  React.useEffect(() => {
    if (!isAuthenticated) return
    load(false)
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') load(true)
    }
    const timer = window.setInterval(refreshIfVisible, POLL_MS)
    document.addEventListener('visibilitychange', refreshIfVisible)
    window.addEventListener('focus', refreshIfVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshIfVisible)
      window.removeEventListener('focus', refreshIfVisible)
    }
  }, [isAuthenticated, load])

  if (!isAuthenticated) return <Navigate to="/client/login" replace />

  const handleSignOut = () => {
    signOut()
    navigate('/client/login')
  }

  const project = data?.projects.find((p) => p.id === selectedId) ?? null
  const billable = data?.projects.filter((p) => p.status !== 'cancelled') ?? []
  const active = data?.projects.filter((p) => ['not_started', 'running', 'on_hold', 'review'].includes(p.status)) ?? []
  const projectPayments = data?.payments.filter((p) => p.project_id === selectedId) ?? []
  const whatsapp = site.phone ? `https://wa.me/${site.phone.replace(/\D/g, '').replace(/^0/, '880')}` : null

  return (
    <div className="bg-secondary/30 min-h-screen">
      <header className="border-border bg-background/80 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="/" className="min-w-0">
            <Logo text={site.logo_text} imageUrl={site.logo_image_url} />
          </a>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setPwOpen(true)}>
              <KeyRound className="size-4" />
              <span className="hidden sm:inline">Password</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        {error && <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">{error}</p>}

        {!data && !error ? (
          <div className="text-muted-foreground flex items-center gap-2 py-20 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading your dashboard…
          </div>
        ) : data ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-sm">Welcome back,</p>
                <h1 className="font-display text-3xl font-bold">{data.client.name}</h1>
                {data.client.company && <p className="text-muted-foreground text-sm">{data.client.company}</p>}
              </div>
              {lastSynced && (
                <span
                  className="border-border bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                  title="This page refreshes automatically when we update your project"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Live · updated {lastSynced.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={FolderKanban} label="Active projects" value={active.length} hint={`${data.projects.length} in total`} />
              <StatCard icon={Wallet} label="Total project value" value={sumLabel(billable, (p) => p.total_cost)} />
              <StatCard icon={Wallet} tone="good" label="Paid" value={sumLabel(billable, (p) => p.paid_amount)} />
              <StatCard
                icon={Wallet}
                tone={billable.some((p) => p.due_amount > 0) ? 'bad' : 'good'}
                label="Remaining due"
                value={sumLabel(billable, (p) => p.due_amount)}
              />
            </div>

            {data.projects.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No projects yet">
                <p className="text-muted-foreground text-sm">Your projects will appear here as soon as we start working on them.</p>
              </EmptyState>
            ) : (
              <>
                {data.projects.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {data.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          'border-border flex shrink-0 flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors',
                          p.id === selectedId ? 'border-primary bg-primary/5' : 'bg-card hover:border-primary/40',
                        )}
                      >
                        <span className="text-sm font-semibold">{p.title}</span>
                        <span className="text-muted-foreground text-xs">
                          {projectStatusMeta[p.status].label} · {p.progress}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {project && (
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                      <section className="border-border bg-card rounded-2xl border p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                          <ProgressRing key={project.id} value={project.progress} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="font-display text-xl font-bold">{project.title}</h2>
                              <Pill meta={projectStatusMeta[project.status]} />
                            </div>
                            <p className="text-muted-foreground text-sm">{project.service_type}</p>
                            {project.current_stage && project.status !== 'completed' && (
                              <p className="mt-2 text-sm">
                                Currently: <span className="font-semibold">{project.current_stage}</span>{' '}
                                {project.current_stage_status && project.current_stage_status !== 'pending' && (
                                  <Pill meta={stageStatusMeta[project.current_stage_status]} className="ml-1" />
                                )}
                              </p>
                            )}
                            <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              {project.start_date && (
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="size-3.5" /> Started {formatDate(project.start_date)}
                                </span>
                              )}
                              {project.deadline && (
                                <span className={cn('inline-flex items-center gap-1', isOverdue(project) && 'text-rose-600 dark:text-rose-400')}>
                                  <CalendarClock className="size-3.5" /> Target {formatDate(project.deadline)}
                                  {deadlineLabel(project) && !isOverdue(project) && ` · ${deadlineLabel(project)}`}
                                </span>
                              )}
                              {project.completed_at && <span>Completed {formatDate(project.completed_at)}</span>}
                            </div>
                          </div>
                        </div>
                        {(project.live_url || project.staging_url) && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {project.staging_url && (
                              <Button asChild variant="outline" size="sm" className="gap-2">
                                <a href={project.staging_url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="size-3.5" /> View preview
                                </a>
                              </Button>
                            )}
                            {project.live_url && (
                              <Button asChild size="sm" className="gap-2">
                                <a href={project.live_url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="size-3.5" /> Visit live site
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                        {project.client_note && (
                          <div className="bg-primary/5 border-primary/20 mt-5 flex gap-3 rounded-xl border p-4">
                            <MessageSquareText className="text-primary mt-0.5 size-5 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold">Message from our team</p>
                              <p className="text-muted-foreground mt-0.5 text-sm whitespace-pre-wrap">{project.client_note}</p>
                            </div>
                          </div>
                        )}
                      </section>

                      <section className="border-border bg-card rounded-2xl border p-6">
                        <h3 className="font-display mb-5 text-base font-semibold">Project stages</h3>
                        <StageTimeline key={project.id} stages={project.stages} />
                      </section>
                    </div>

                    <div className="flex flex-col gap-6">
                      <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6">
                        <h3 className="font-display text-base font-semibold">Payment summary</h3>
                        <MoneySummary
                          total={project.total_cost}
                          paid={project.paid_amount}
                          due={project.due_amount}
                          currency={project.currency}
                          className="grid-cols-1 divide-x-0 divide-y sm:grid-cols-1"
                        />
                        {projectPayments.length > 0 ? (
                          <ul className="flex flex-col gap-2 text-sm">
                            {projectPayments.map((p) => (
                              <li key={p.id} className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-medium">
                                    {p.type === 'refund' ? '−' : ''}
                                    {formatMoney(p.amount, p.currency)}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {formatDate(p.paid_at)} · {p.method}
                                  </p>
                                </div>
                                <Pill meta={paymentTypeMeta[p.type]} />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
                        )}
                      </section>

                      <section className="border-border bg-card rounded-2xl border p-6">
                        <h3 className="font-display mb-4 text-base font-semibold">Latest updates</h3>
                        <ActivityFeed
                          items={data.activity.filter((a) => !a.project_id || a.project_id === project.id)}
                          empty="Updates from our team will appear here."
                        />
                      </section>

                      <section className="border-border bg-card rounded-2xl border p-6">
                        <h3 className="font-display text-base font-semibold">Need anything?</h3>
                        <p className="text-muted-foreground mt-1 text-sm">Reach us directly about your project.</p>
                        <div className="mt-4 flex flex-col gap-2">
                          {whatsapp && (
                            <Button asChild variant="outline" className="justify-start gap-2">
                              <a href={whatsapp} target="_blank" rel="noreferrer">
                                <MessageCircle className="size-4" /> WhatsApp {site.phone}
                              </a>
                            </Button>
                          )}
                          {site.email && (
                            <Button asChild variant="outline" className="justify-start gap-2">
                              <a href={`mailto:${site.email}?subject=${encodeURIComponent(`About: ${project.title}`)}`}>
                                <Mail className="size-4" /> {site.email}
                              </a>
                            </Button>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </main>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} save={(body) => portalPut('/password', body)} />
      <Toaster />
    </div>
  )
}
