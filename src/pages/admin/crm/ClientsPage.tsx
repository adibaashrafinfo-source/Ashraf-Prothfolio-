import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, ShieldCheck, Users, Wallet } from 'lucide-react'

import { EmptyState, Pill, StatCard } from '@/components/crm/bits'
import { ClientFormModal } from '@/components/crm/ClientFormModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminTable } from '@/hooks/use-admin-table'
import { clientStatusMeta } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import { CRM_CLIENT_STATUSES } from '@/types/crm'
import type { CrmClient, CrmClientStatus } from '@/types/crm'

export function ClientsPage() {
  const { rows, loading, error, refetch } = useAdminTable<CrmClient>('/crm/clients')
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<CrmClientStatus | 'all'>('all')
  const [adding, setAdding] = React.useState(false)

  const q = query.trim().toLowerCase()
  const visible = rows.filter(
    (c) =>
      (filter === 'all' || c.status === filter) &&
      (!q || [c.name, c.company, c.email, c.phone].some((v) => v?.toLowerCase().includes(q))),
  )

  const totalValue = rows.reduce((s, c) => s + c.total_value, 0)
  const totalDue = rows.reduce((s, c) => s + c.due_amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your client database — contacts, projects and balances.</p>
        </div>
        <Button className="gap-2" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Add client
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total clients" value={rows.length} />
        <StatCard
          icon={ShieldCheck}
          tone="good"
          label="Active"
          value={rows.filter((c) => c.status === 'active').length}
          hint={`${rows.filter((c) => c.portal_enabled).length} with portal access`}
        />
        <StatCard icon={Wallet} label="Lifetime project value" value={formatMoney(totalValue)} />
        <StatCard icon={Wallet} tone={totalDue > 0 ? 'bad' : 'good'} label="Outstanding due" value={formatMoney(totalDue)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, company, email or phone…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', ...CRM_CLIENT_STATUSES] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : clientStatusMeta[s].label} (
              {s === 'all' ? rows.length : rows.filter((c) => c.status === s).length})
            </Button>
          ))}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState icon={Users} title={rows.length === 0 ? 'No clients yet' : 'No clients match'}>
          {rows.length === 0 && (
            <p className="text-muted-foreground max-w-sm text-sm">
              Add your first client, or convert a lead from the Leads page.
            </p>
          )}
        </EmptyState>
      ) : (
        <div className="border-border bg-card overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-left text-xs">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="py-3 font-medium">Contact</th>
                <th className="py-3 font-medium">Projects</th>
                <th className="py-3 text-right font-medium">Value</th>
                <th className="py-3 text-right font-medium">Paid</th>
                <th className="py-3 text-right font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/crm/clients/${c.id}`)}
                  className="border-border hover:bg-secondary/40 cursor-pointer border-b last:border-0"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        {c.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          to={`/admin/crm/clients/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary font-semibold"
                        >
                          {c.name}
                        </Link>
                        {c.company && <p className="text-muted-foreground truncate text-xs">{c.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-xs">{c.phone || '—'}</p>
                    <p className="text-muted-foreground truncate text-xs">{c.email || ''}</p>
                  </td>
                  <td className="py-3">
                    <span className="font-medium">{c.project_count}</span>
                    {c.active_projects > 0 && (
                      <span className="text-muted-foreground text-xs"> · {c.active_projects} active</span>
                    )}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">{formatMoney(c.total_value)}</td>
                  <td className="py-3 text-right whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                    {formatMoney(c.paid_amount)}
                  </td>
                  <td
                    className={cn(
                      'py-3 text-right font-semibold whitespace-nowrap',
                      c.due_amount > 0 && 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {formatMoney(c.due_amount)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Pill meta={clientStatusMeta[c.status]} />
                      {c.portal_enabled && (
                        <span title="Client portal enabled">
                          <ShieldCheck className="size-4 text-emerald-500" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientFormModal
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(c) => {
          refetch()
          navigate(`/admin/crm/clients/${c.id}`)
        }}
      />
    </div>
  )
}
