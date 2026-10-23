import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderKanban,
  Loader,
  Mail,
  MessageSquareQuote,
  PauseCircle,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'

import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { SectionCard, StatCard } from '@/components/crm/bits'
import { MiniBarChart } from '@/components/crm/MiniBarChart'
import { ProjectCard } from '@/components/crm/ProjectCard'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useApiResource } from '@/hooks/use-api-resource'
import { docTotals } from '@/lib/documents'
import { daysUntil, deadlineLabel, isOverdue } from '@/lib/crm'
import { formatMoney, leadStatusMeta } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type { BusinessDocument, ClientLogo, Lead, Project, Testimonial } from '@/types'
import type { CrmActivity, CrmProject, CrmStats } from '@/types/crm'

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short' })

export function Dashboard() {
  const stats = useApiResource<CrmStats>('/crm/stats')
  const crmProjects = useAdminTable<CrmProject>('/crm/projects')
  const activity = useAdminTable<CrmActivity>('/crm/activity?limit=8')
  const leads = useAdminTable<Lead>('/leads')
  const documents = useAdminTable<BusinessDocument>('/documents')
  const portfolio = useAdminTable<Project>('/projects')
  const logos = useAdminTable<ClientLogo>('/client-logos')
  const testimonials = useAdminTable<Testimonial>('/testimonials')

  const s = stats.data
  const by = s?.projects_by_status
  const running = crmProjects.rows
    .filter((p) => p.status === 'running' || p.status === 'review')
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
  const deadlines = crmProjects.rows
    .filter((p) => {
      const d = daysUntil(p.deadline)
      return d !== null && d <= 14 && !['completed', 'cancelled'].includes(p.status)
    })
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
    .slice(0, 6)

  const invoices = documents.rows.filter((d) => d.kind === 'invoice')
  const openLeads = leads.rows.filter((l) => !['cancelled', 'converted'].includes(l.status ?? 'new'))
  const unpaidInvoices = invoices.reduce((sum, d) => sum + Math.max(0, docTotals(d).total - (d.paid_amount ?? 0)), 0)

  const monthly = (s?.monthly ?? []).map((m) => ({
    label: MONTH.format(new Date(`${m.month}-01T00:00:00`)),
    value: m.total,
  }))

  const website = [
    { label: 'Leads', icon: Mail, to: '/admin/leads', value: leads.rows.length, hint: `${openLeads.length} open` },
    { label: 'Quotations', icon: FileText, to: '/admin/quotations', value: documents.rows.length - invoices.length },
    { label: 'Invoices', icon: Receipt, to: '/admin/invoices', value: invoices.length, hint: unpaidInvoices ? `${formatMoney(unpaidInvoices)} unpaid` : undefined },
    { label: 'Portfolio', icon: Briefcase, to: '/admin/portfolio', value: portfolio.rows.length },
    { label: 'Client logos', icon: Building2, to: '/admin/clients', value: logos.rows.length },
    { label: 'Testimonials', icon: MessageSquareQuote, to: '/admin/testimonials', value: testimonials.rows.length },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your agency at a glance — clients, projects and cash flow.</p>
        </div>
        <Link to="/admin/crm/reports" className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <CalendarDays className="size-4" /> Today's report
        </Link>
      </div>

      {stats.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">{stats.error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Clients" value={s?.clients_total ?? '—'} hint={s ? `${s.clients_active} active` : undefined} />
        <StatCard icon={FolderKanban} label="Total projects" value={s?.projects_total ?? '—'} hint={by ? `${by.completed} completed` : undefined} />
        <StatCard icon={Loader} label="Running now" value={by ? by.running + by.review : '—'} hint={by ? `${by.not_started} not started` : undefined} />
        <StatCard
          icon={by && by.on_hold ? PauseCircle : AlertTriangle}
          tone={s && s.projects_overdue > 0 ? 'bad' : by && by.on_hold ? 'warn' : 'good'}
          label="On hold / overdue"
          value={by ? `${by.on_hold} / ${s?.projects_overdue}` : '—'}
        />
        <StatCard icon={Briefcase} label="Total project value" value={s ? formatMoney(s.total_value) : '—'} />
        <StatCard icon={Wallet} tone="good" label="Total collected" value={s ? formatMoney(s.collected_total) : '—'} hint={s ? `${formatMoney(s.collected_today)} today` : undefined} />
        <StatCard icon={Wallet} tone={s && s.due_total > 0 ? 'bad' : 'good'} label="Outstanding due" value={s ? formatMoney(s.due_total) : '—'} />
        <StatCard icon={CheckCircle2} label="Collected this month" value={s ? formatMoney(s.collected_month) : '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Collections — last 6 months"
          className="lg:col-span-2"
          action={
            <Link to="/admin/crm/payments" className="text-primary text-xs font-medium hover:underline">
              View payments
            </Link>
          }
        >
          {monthly.length > 0 ? (
            <MiniBarChart data={monthly} format={(v) => formatMoney(v)} label="Net payments collected per month" />
          ) : (
            <p className="text-muted-foreground text-sm">Loading…</p>
          )}
        </SectionCard>

        <SectionCard title="Upcoming deadlines">
          {deadlines.length === 0 ? (
            <p className="text-muted-foreground text-sm">No deadlines in the next two weeks.</p>
          ) : (
            <ul className="flex flex-col gap-2.5 text-sm">
              {deadlines.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link to={`/admin/crm/projects/${p.id}`} className="hover:text-primary min-w-0 truncate">
                    {p.title}
                    <span className="text-muted-foreground block truncate text-xs">{p.client_name}</span>
                  </Link>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      isOverdue(p) ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {deadlineLabel(p)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Running projects</h2>
            <Link to="/admin/crm/projects" className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline">
              All projects <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {running.length === 0 ? (
            <div className="border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
              No running projects.{' '}
              <Link to="/admin/crm/clients" className="text-primary hover:underline">
                Add a client
              </Link>{' '}
              to get started.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {running.slice(0, 6).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>

        <SectionCard title="Recent activity">
          <ActivityFeed items={activity.rows} showContext />
        </SectionCard>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Sales & website</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {website.map((c) => (
            <Link key={c.label} to={c.to} className="group">
              <StatCard icon={c.icon} label={c.label} value={c.value} hint={c.hint} />
            </Link>
          ))}
        </div>
        {leads.rows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(leadStatusMeta).map(([status, meta]) => {
              const count = leads.rows.filter((l) => (l.status ?? 'new') === status).length
              if (count === 0) return null
              return (
                <span key={status} className={cn('rounded-full px-3 py-1 text-xs font-semibold', meta.className)}>
                  {meta.label} · {count}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
