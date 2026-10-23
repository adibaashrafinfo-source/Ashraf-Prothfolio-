import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader,
  Printer,
  Wallet,
} from 'lucide-react'

import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { Pill, ProgressBar, SectionCard, StatCard } from '@/components/crm/bits'
import { PaymentsTable } from '@/components/crm/PaymentsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminTable } from '@/hooks/use-admin-table'
import {
  daysUntil,
  deadlineLabel,
  formatDate,
  isOverdue,
  projectStatusMeta,
  stageStatusMeta,
  todayISO,
} from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type { CrmActivity, CrmPayment, CrmProject } from '@/types/crm'

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function ReportsPage() {
  const [date, setDate] = React.useState(todayISO())
  const activity = useAdminTable<CrmActivity>(`/crm/activity?date=${date}&limit=500`)
  const payments = useAdminTable<CrmPayment>(`/crm/payments?from=${date}&to=${date}`)
  const projects = useAdminTable<CrmProject>('/crm/projects')
  const isToday = date === todayISO()

  const net = payments.rows.reduce((s, p) => s + (p.type === 'refund' ? -p.amount : p.amount), 0)
  const work = projects.rows.flatMap((p) =>
    p.stages
      .filter((s) => s.completed_at === date || (s.started_at === date && s.status !== 'done'))
      .map((s) => ({ project: p, stage: s, completed: s.completed_at === date })),
  )
  const running = projects.rows
    .filter((p) => ['running', 'review', 'on_hold'].includes(p.status))
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
  const overdue = projects.rows.filter(isOverdue)
  const upcoming = projects.rows.filter((p) => {
    const d = daysUntil(p.deadline)
    return d !== null && d >= 0 && d <= 7 && !['completed', 'cancelled'].includes(p.status)
  })
  const finishedToday = projects.rows.filter((p) => p.completed_at === date)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Daily report</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous day"
            onClick={() => setDate(shiftDate(date, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Input
            type="date"
            aria-label="Report date"
            className="w-44"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Next day"
            disabled={isToday}
            onClick={() => setDate(shiftDate(date, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
          {!isToday && (
            <Button variant="ghost" onClick={() => setDate(todayISO())}>
              Today
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          tone="good"
          label="Collected"
          value={formatMoney(net)}
          hint={`${payments.rows.length} payment${payments.rows.length === 1 ? '' : 's'}`}
        />
        <StatCard
          icon={Layers}
          label="Stages completed"
          value={work.filter((w) => w.completed).length}
          hint={`${work.filter((w) => !w.completed).length} started`}
        />
        <StatCard
          icon={Loader}
          label="Projects in progress"
          value={running.length}
          hint={`${finishedToday.length} completed this day`}
        />
        <StatCard
          icon={AlertTriangle}
          tone={overdue.length ? 'bad' : 'good'}
          label="Overdue now"
          value={overdue.length}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Work done">
          {work.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No stages were started or completed on this day.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {work.map(({ project, stage, completed }) => (
                <li key={`${project.id}-${stage.id}`} className="flex items-start gap-3 text-sm">
                  {completed ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Loader className="mt-0.5 size-4 shrink-0 text-blue-500" />
                  )}
                  <div className="min-w-0">
                    <p>
                      <span className="font-medium">{stage.name}</span>{' '}
                      {completed ? 'completed' : 'started'}
                    </p>
                    <Link
                      to={`/admin/crm/projects/${project.id}`}
                      className="text-muted-foreground hover:text-primary text-xs"
                    >
                      {project.title} · {project.client_name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Deadlines in the next 7 days">
          {upcoming.length === 0 && overdue.length === 0 ? (
            <p className="text-muted-foreground text-sm">No deadlines coming up.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {[...overdue, ...upcoming].map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link to={`/admin/crm/projects/${p.id}`} className="hover:text-primary truncate">
                    {p.title} <span className="text-muted-foreground">· {p.client_name}</span>
                  </Link>
                  <span
                    className={cn(
                      'shrink-0 text-xs font-semibold',
                      isOverdue(p)
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400',
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

      <SectionCard title="Payments received">
        <PaymentsTable payments={payments.rows} showClient showProject empty="No payments on this day." />
      </SectionCard>

      <SectionCard title={`Projects in progress (${running.length})`}>
        {running.length === 0 ? (
          <p className="text-muted-foreground text-sm">No projects are in progress.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-muted-foreground border-border border-b text-left text-xs">
                  <th className="px-5 pb-2 font-medium">Project</th>
                  <th className="pb-2 font-medium">Current stage</th>
                  <th className="w-40 pb-2 font-medium">Progress</th>
                  <th className="pb-2 font-medium">Deadline</th>
                  <th className="px-5 pb-2 text-right font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {running.map((p) => (
                  <tr key={p.id} className="border-border border-b last:border-0">
                    <td className="px-5 py-2.5">
                      <Link
                        to={`/admin/crm/projects/${p.id}`}
                        className="hover:text-primary font-medium"
                      >
                        {p.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">{p.client_name}</p>
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{p.current_stage ?? '—'}</span>
                        {p.status !== 'running' ? (
                          <Pill meta={projectStatusMeta[p.status]} />
                        ) : (
                          p.current_stage_status &&
                          p.current_stage_status !== 'pending' && (
                            <Pill meta={stageStatusMeta[p.current_stage_status]} />
                          )
                        )}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} className="h-1.5" />
                        <span className="text-muted-foreground w-9 text-xs">{p.progress}%</span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        'py-2.5 text-xs',
                        isOverdue(p) && 'font-semibold text-rose-600 dark:text-rose-400',
                      )}
                    >
                      {formatDate(p.deadline)}
                      {deadlineLabel(p) && <span className="block">{deadlineLabel(p)}</span>}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium whitespace-nowrap">
                      {formatMoney(p.due_amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title={`All activity (${activity.rows.length})`}>
        <ActivityFeed items={activity.rows} showContext empty="Nothing was logged on this day." />
      </SectionCard>
    </div>
  )
}
