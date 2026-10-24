import { Link } from 'react-router-dom'
import { Pencil, Receipt, Trash2 } from 'lucide-react'

import { Pill } from '@/components/crm/bits'
import { formatDate, paymentTypeMeta } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type { CrmPayment } from '@/types/crm'

export function PaymentsTable({
  payments,
  showProject = false,
  showClient = false,
  onEdit,
  onDelete,
  onReceipt,
  empty = 'No payments recorded yet.',
}: {
  payments: CrmPayment[]
  showProject?: boolean
  showClient?: boolean
  onEdit?: (p: CrmPayment) => void
  onDelete?: (p: CrmPayment) => void
  onReceipt?: (p: CrmPayment) => void
  empty?: string
}) {
  if (payments.length === 0) {
    return <p className="text-muted-foreground text-sm">{empty}</p>
  }
  const hasActions = Boolean(onEdit || onDelete || onReceipt)
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-muted-foreground border-border border-b text-left text-xs">
            <th className="px-5 pb-2 font-medium">Date</th>
            {showClient && <th className="pb-2 font-medium">Client</th>}
            {showProject && <th className="pb-2 font-medium">Project</th>}
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Method</th>
            <th className="pb-2 font-medium">Reference</th>
            <th className={cn('pb-2 text-right font-medium', !hasActions && 'pr-5')}>Amount</th>
            {hasActions && <th className="w-20 px-5 pb-2" />}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-border border-b last:border-0">
              <td className="px-5 py-2.5 whitespace-nowrap">{formatDate(p.paid_at)}</td>
              {showClient && (
                <td className="py-2.5">
                  <Link to={`/admin/crm/clients/${p.client_id}`} className="hover:text-primary">
                    {p.client_name}
                  </Link>
                </td>
              )}
              {showProject && (
                <td className="max-w-48 truncate py-2.5">
                  <Link to={`/admin/crm/projects/${p.project_id}`} className="hover:text-primary">
                    {p.project_title}
                  </Link>
                </td>
              )}
              <td className="py-2.5">
                <Pill meta={paymentTypeMeta[p.type]} />
              </td>
              <td className="py-2.5">{p.method}</td>
              <td className="text-muted-foreground max-w-40 truncate py-2.5">{p.reference || '—'}</td>
              <td
                className={cn(
                  'py-2.5 text-right font-semibold whitespace-nowrap',
                  !hasActions && 'pr-5',
                  p.type === 'refund' && 'text-rose-600 dark:text-rose-400',
                )}
              >
                {p.type === 'refund' ? '−' : ''}
                {formatMoney(p.amount, p.currency)}
              </td>
              {hasActions && (
                <td className="px-5 py-2.5 text-right whitespace-nowrap">
                  {onReceipt && (
                    <button
                      type="button"
                      onClick={() => onReceipt(p)}
                      aria-label="View receipt"
                      className="text-muted-foreground hover:text-foreground rounded p-1.5"
                    >
                      <Receipt className="size-3.5" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      aria-label="Edit payment"
                      className="text-muted-foreground hover:text-foreground rounded p-1.5"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      aria-label="Delete payment"
                      className="text-muted-foreground hover:text-destructive rounded p-1.5"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
