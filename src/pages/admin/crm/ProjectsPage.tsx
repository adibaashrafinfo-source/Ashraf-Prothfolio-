import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, FolderKanban, Loader, PauseCircle, Plus, Search } from 'lucide-react'

import { EmptyState, StatCard } from '@/components/crm/bits'
import { InlineSelect } from '@/components/crm/fields'
import { ProjectCard } from '@/components/crm/ProjectCard'
import { ProjectFormModal } from '@/components/crm/ProjectFormModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminTable } from '@/hooks/use-admin-table'
import { isOverdue, OPEN_STATUSES, projectStatusMeta } from '@/lib/crm'
import { PROJECT_STATUSES } from '@/types/crm'
import type { CrmProject, ProjectStatus } from '@/types/crm'

type Filter = ProjectStatus | 'all' | 'open' | 'overdue'

export function ProjectsPage() {
  const { rows, loading, error } = useAdminTable<CrmProject>('/crm/projects')
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<Filter>('open')
  const [service, setService] = React.useState('all')
  const [adding, setAdding] = React.useState(false)

  const services = Array.from(new Set(rows.map((p) => p.service_type))).sort()
  const q = query.trim().toLowerCase()
  const matchesFilter = (p: CrmProject) =>
    filter === 'all' ||
    (filter === 'open' && OPEN_STATUSES.includes(p.status)) ||
    (filter === 'overdue' && isOverdue(p)) ||
    p.status === filter

  const visible = rows
    .filter(
      (p) =>
        matchesFilter(p) &&
        (service === 'all' || p.service_type === service) &&
        (!q || [p.title, p.client_name, p.client_company].some((v) => v?.toLowerCase().includes(q))),
    )
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))

  const count = (status: ProjectStatus) => rows.filter((p) => p.status === status).length
  const overdue = rows.filter(isOverdue).length

  const chips: { key: Filter; label: string; n: number }[] = [
    { key: 'open', label: 'Open', n: rows.filter((p) => OPEN_STATUSES.includes(p.status)).length },
    { key: 'overdue', label: 'Overdue', n: overdue },
    ...PROJECT_STATUSES.map((s) => ({ key: s as Filter, label: projectStatusMeta[s].label, n: count(s) })),
    { key: 'all', label: 'All', n: rows.length },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">Every client project, its current stage, and what's still due.</p>
        </div>
        <Button className="gap-2" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> New project
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Loader} label="Running" value={count('running') + count('review')} hint={`${count('not_started')} not started`} />
        <StatCard icon={PauseCircle} tone="warn" label="On hold" value={count('on_hold')} />
        <StatCard icon={AlertTriangle} tone={overdue ? 'bad' : 'good'} label="Overdue" value={overdue} />
        <StatCard icon={CheckCircle2} tone="good" label="Completed" value={count('completed')} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input placeholder="Search project or client…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <InlineSelect aria-label="Filter by service" value={service} onChange={(e) => setService(e.target.value)} className="h-11">
          <option value="all">All services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </InlineSelect>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <Button key={c.key} size="sm" variant={filter === c.key ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilter(c.key)}>
            {c.label} ({c.n})
          </Button>
        ))}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState icon={FolderKanban} title={rows.length === 0 ? 'No projects yet' : 'No projects match'}>
          {rows.length === 0 && <p className="text-muted-foreground text-sm">Create a project for one of your clients to start tracking it.</p>}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <ProjectFormModal open={adding} onClose={() => setAdding(false)} onSaved={(p) => navigate(`/admin/crm/projects/${p.id}`)} />
    </div>
  )
}
