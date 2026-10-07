import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Loader2, Mail, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { CURRENCIES, formatMoney, leadStatusMeta } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import { LEAD_STATUSES } from '@/types'
import type { Lead, LeadStatus } from '@/types'

type Draft = {
  status: LeadStatus
  phone: string
  company: string
  project_name: string
  project_type: string
  progress: string
  project_cost: string
  currency: string
  next_follow_up: string
  notes: string
}

function toDraft(lead: Lead): Draft {
  return {
    status: lead.status,
    phone: lead.phone ?? '',
    company: lead.company ?? '',
    project_name: lead.project_name ?? '',
    project_type: lead.project_type ?? '',
    progress: String(lead.progress ?? 0),
    project_cost: lead.project_cost == null ? '' : String(lead.project_cost),
    currency: lead.currency || 'BDT',
    next_follow_up: lead.next_follow_up ?? '',
    notes: lead.notes ?? '',
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-display mt-1 text-xl font-bold">{value}</p>
    </div>
  )
}

export function LeadsPage() {
  const { rows, loading, refetch } = useAdminTable<Lead>('contact_submissions')
  const { toast } = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = React.useState<LeadStatus | 'all'>('all')
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [saving, setSaving] = React.useState(false)

  const visible = filter === 'all' ? rows : rows.filter((l) => (l.status ?? 'new') === filter)

  const pipeline = rows
    .filter((l) => l.status !== 'cancelled' && l.status !== 'converted')
    .reduce((sum, l) => sum + (l.project_cost ?? 0), 0)
  const won = rows
    .filter((l) => l.status === 'converted')
    .reduce((sum, l) => sum + (l.project_cost ?? 0), 0)

  const toggle = (lead: Lead) => {
    if (openId === lead.id) {
      setOpenId(null)
      setDraft(null)
      return
    }
    setOpenId(lead.id)
    setDraft(toDraft(lead))
  }

  const save = async (lead: Lead) => {
    if (!supabase || !draft) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({
          status: draft.status,
          phone: draft.phone || null,
          company: draft.company || null,
          project_name: draft.project_name || null,
          project_type: draft.project_type || null,
          progress: Math.max(0, Math.min(100, Number(draft.progress) || 0)),
          project_cost: draft.project_cost === '' ? null : Number(draft.project_cost),
          currency: draft.currency,
          next_follow_up: draft.next_follow_up || null,
          notes: draft.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)

      if (error) {
        toast({ variant: 'destructive', title: 'Could not save', description: error.message })
        return
      }
      toast({ title: 'Lead updated' })
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not save',
        description: err instanceof Error ? err.message : 'Could not reach the server.',
      })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!supabase || !window.confirm('Delete this lead permanently?')) return
    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
      if (error) {
        toast({ variant: 'destructive', title: 'Could not delete', description: error.message })
        return
      }
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not delete',
        description: err instanceof Error ? err.message : 'Could not reach the server.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Leads</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everyone who submitted the contact form, plus where each one stands in your pipeline.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={String(rows.length)} />
        <StatCard
          label="Active"
          value={String(
            rows.filter((l) => l.status !== 'cancelled' && l.status !== 'converted').length,
          )}
        />
        <StatCard label="Open pipeline" value={formatMoney(pipeline)} />
        <StatCard label="Won" value={formatMoney(won)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => setFilter('all')}
        >
          All ({rows.length})
        </Button>
        {LEAD_STATUSES.map((s) => {
          const count = rows.filter((l) => (l.status ?? 'new') === s).length
          return (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setFilter(s)}
            >
              {leadStatusMeta[s].label} ({count})
            </Button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
          <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Mail className="size-6" />
          </span>
          <p className="text-muted-foreground text-sm">No leads here yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((lead) => {
            const status = lead.status ?? 'new'
            const meta = leadStatusMeta[status] ?? leadStatusMeta.new
            const isOpen = openId === lead.id

            return (
              <div key={lead.id} className="border-border bg-card rounded-xl border">
                <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <button
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    onClick={() => toggle(lead)}
                  >
                    <ChevronDown
                      className={cn(
                        'text-muted-foreground mt-1 size-4 shrink-0 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{lead.subject}</p>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </span>
                        {lead.project_cost != null && (
                          <span className="text-muted-foreground text-xs">
                            {formatMoney(lead.project_cost, lead.currency)}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {lead.name} ·{' '}
                        <a href={`mailto:${lead.email}`} className="hover:text-primary">
                          {lead.email}
                        </a>
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete lead"
                      onClick={() => remove(lead.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-border border-t px-5 py-4">
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {lead.message}
                  </p>
                </div>

                {isOpen && draft && (
                  <div className="border-border bg-secondary/20 flex flex-col gap-4 border-t p-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`st-${lead.id}`}>Status</Label>
                        <select
                          id={`st-${lead.id}`}
                          className="border-input bg-background h-11 rounded-lg border px-3 text-sm"
                          value={draft.status}
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, status: e.target.value as LeadStatus })
                          }
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {leadStatusMeta[s].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`ph-${lead.id}`}>Phone</Label>
                        <Input
                          id={`ph-${lead.id}`}
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => d && { ...d, phone: e.target.value })}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`co-${lead.id}`}>Company</Label>
                        <Input
                          id={`co-${lead.id}`}
                          value={draft.company}
                          onChange={(e) => setDraft((d) => d && { ...d, company: e.target.value })}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`pn-${lead.id}`}>Project name</Label>
                        <Input
                          id={`pn-${lead.id}`}
                          value={draft.project_name}
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, project_name: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`pt-${lead.id}`}>Project type</Label>
                        <Input
                          id={`pt-${lead.id}`}
                          placeholder="E-Commerce, SEO, Branding…"
                          value={draft.project_type}
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, project_type: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`fu-${lead.id}`}>Next follow-up</Label>
                        <Input
                          id={`fu-${lead.id}`}
                          type="date"
                          value={draft.next_follow_up}
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, next_follow_up: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`pc-${lead.id}`}>Project cost</Label>
                        <Input
                          id={`pc-${lead.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.project_cost}
                          onChange={(e) =>
                            setDraft((d) => d && { ...d, project_cost: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`cu-${lead.id}`}>Currency</Label>
                        <select
                          id={`cu-${lead.id}`}
                          className="border-input bg-background h-11 rounded-lg border px-3 text-sm"
                          value={draft.currency}
                          onChange={(e) => setDraft((d) => d && { ...d, currency: e.target.value })}
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`pr-${lead.id}`}>Progress ({draft.progress}%)</Label>
                        <input
                          id={`pr-${lead.id}`}
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="accent-primary h-11"
                          value={draft.progress}
                          onChange={(e) => setDraft((d) => d && { ...d, progress: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`no-${lead.id}`}>Internal notes</Label>
                      <Textarea
                        id={`no-${lead.id}`}
                        rows={3}
                        placeholder="Call summary, requirements, next steps…"
                        value={draft.notes}
                        onChange={(e) => setDraft((d) => d && { ...d, notes: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => save(lead)} disabled={saving} className="gap-2">
                        {saving && <Loader2 className="size-4 animate-spin" />}
                        Save lead
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/admin/quotations/new?lead=${lead.id}`)}
                      >
                        <FileText className="size-4" />
                        Create quotation
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
