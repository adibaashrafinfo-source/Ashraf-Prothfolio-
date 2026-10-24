import { Printer } from 'lucide-react'

import { CompanyMark } from '@/components/documents/templates/shared'
import { useCompanyInfo } from '@/components/documents/DocumentPreview'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { formatDate, paymentTypeMeta } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import type { CrmPayment } from '@/types/crm'

export interface ReceiptContext {
  clientName: string
  clientCompany?: string | null
  clientEmail?: string | null
  projectTitle: string
}

function ReceiptDocument({ payment, context }: { payment: CrmPayment; context: ReceiptContext }) {
  const company = useCompanyInfo()
  const receiptNo = `RCPT-${payment.paid_at.replace(/-/g, '')}-${payment.id.slice(0, 6).toUpperCase()}`

  return (
    <div className="mx-auto w-full max-w-xl bg-white p-8 text-slate-900 print:p-0">
      <div className="flex items-start justify-between gap-4">
        <CompanyMark logoUrl={company.logoUrl} logoText={company.logoText} />
        <div className="text-right">
          <p className="text-lg font-bold">Payment Receipt</p>
          <p className="text-xs text-slate-500">{receiptNo}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-slate-200 pt-4 text-sm">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Received from</p>
          <p className="mt-0.5 font-medium">{context.clientName}</p>
          {context.clientCompany && <p className="text-slate-500">{context.clientCompany}</p>}
          {context.clientEmail && <p className="text-slate-500">{context.clientEmail}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">For project</p>
          <p className="mt-0.5 font-medium">{context.projectTitle}</p>
          <p className="text-slate-500">{formatDate(payment.paid_at)}</p>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Description</th>
            <th className="py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-3">
              <p className="font-medium">{paymentTypeMeta[payment.type].label} payment via {payment.method}</p>
              {payment.reference && <p className="mt-0.5 text-xs text-slate-500">Ref: {payment.reference}</p>}
              {payment.note && <p className="mt-0.5 text-xs text-slate-500">{payment.note}</p>}
            </td>
            <td className="py-3 text-right font-medium">
              {payment.type === 'refund' ? '−' : ''}
              {formatMoney(payment.amount, payment.currency)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2 flex justify-between border-t border-slate-200 pt-3">
        <span className="font-semibold">{payment.type === 'refund' ? 'Total refunded' : 'Total received'}</span>
        <span className="text-primary text-lg font-bold">{formatMoney(payment.amount, payment.currency)}</span>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
        <p>
          {company.name}
          {company.email ? ` · ${company.email}` : ''}
          {company.phone ? ` · ${company.phone}` : ''}
        </p>
        <p className="mt-1">Thank you for your business.</p>
      </div>
    </div>
  )
}

/** Printable receipt for one CRM payment — same on-screen print pattern as the invoice editor. */
export function ReceiptModal({
  open,
  onClose,
  payment,
  context,
}: {
  open: boolean
  onClose: () => void
  payment: CrmPayment | null
  context: ReceiptContext | null
}) {
  return (
    <Modal open={open} onClose={onClose} title="Payment receipt" className="max-w-2xl" printable>
      {payment && context && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end print:hidden">
            <Button size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print / PDF
            </Button>
          </div>
          <div className="print-area overflow-x-auto rounded-xl bg-slate-100 p-4 print:bg-white print:p-0">
            <ReceiptDocument payment={payment} context={context} />
          </div>
        </div>
      )}
    </Modal>
  )
}
