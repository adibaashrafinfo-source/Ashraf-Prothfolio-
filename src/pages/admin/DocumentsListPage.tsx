import { Link, useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { docTotals, isOverdue } from '@/lib/documents'
import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type { BusinessDocument, DocumentKind } from '@/types'

const statusClass: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  accepted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  partial: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  overdue: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  expired: 'bg-muted text-muted-foreground',
}

export function DocumentsListPage({ kind }: { kind: DocumentKind }) {
  const { rows, loading, refetch } = useAdminTable<BusinessDocument>('business_documents')
  const { toast } = useToast()
  const navigate = useNavigate()

  const docs = rows.filter((d) => d.kind === kind)
  const label = kind === 'quotation' ? 'Quotations' : 'Invoices'

  const remove = async (id: string) => {
    if (!supabase || !window.confirm(`Delete this ${kind}?`)) return
    const { error } = await supabase.from('business_documents').delete().eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Could not delete', description: error.message })
      return
    }
    refetch()
  }

  const totalValue = docs.reduce((sum, d) => sum + docTotals(d).total, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{label}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {docs.length} {kind}
            {docs.length === 1 ? '' : 's'} · {formatMoney(totalValue)} total value
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() =>
            navigate(kind === 'quotation' ? '/admin/quotations/new' : '/admin/invoices/new')
          }
        >
          <Plus className="size-4" />
          New {kind}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : docs.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
          <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <FileText className="size-6" />
          </span>
          <p className="text-muted-foreground text-sm">No {kind}s yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {docs.map((d) => {
            const status = isOverdue(d) ? 'overdue' : d.status
            return (
              <div
                key={d.id}
                className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <Link to={`/admin/documents/${d.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{d.project_title}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
                        statusClass[status] ?? statusClass.draft,
                      )}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {d.client_name} · <span className="font-mono">{d.doc_number}</span> ·{' '}
                    {new Date(d.issue_date).toLocaleDateString()}
                  </p>
                </Link>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatMoney(docTotals(d).total, d.currency)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${kind}`}
                    onClick={() => remove(d.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
