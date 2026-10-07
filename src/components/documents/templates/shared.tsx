import { docTotals } from '@/lib/documents'
import { formatMoney } from '@/lib/leadMeta'
import type { BusinessDocument } from '@/types'

export function docTitle(doc: BusinessDocument) {
  return doc.kind === 'quotation' ? 'Quotation' : 'Invoice'
}

export function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function CompanyMark({
  logoUrl,
  logoText,
  dark = false,
}: {
  logoUrl: string | null
  logoText: string
  dark?: boolean
}) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="max-h-14 w-auto max-w-[200px] object-contain" />
  }
  return (
    <p className={dark ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-slate-900'}>
      {logoText}
    </p>
  )
}

export function TotalsBlock({ doc, accent }: { doc: BusinessDocument; accent: string }) {
  const t = docTotals(doc)
  const row = 'flex justify-between py-1.5 text-sm'

  return (
    <div className="w-full max-w-xs space-y-0.5">
      <div className={row}>
        <span className="text-slate-500">Subtotal</span>
        <span className="font-medium text-slate-900">{formatMoney(t.subtotal, doc.currency)}</span>
      </div>
      {t.discount > 0 && (
        <div className={row}>
          <span className="text-slate-500">Discount</span>
          <span className="font-medium text-slate-900">
            −{formatMoney(t.discount, doc.currency)}
          </span>
        </div>
      )}
      {doc.tax_percent > 0 && (
        <div className={row}>
          <span className="text-slate-500">Tax ({doc.tax_percent}%)</span>
          <span className="font-medium text-slate-900">{formatMoney(t.tax, doc.currency)}</span>
        </div>
      )}
      <div className="mt-1 flex justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-slate-900">Total</span>
        <span className="text-lg font-bold" style={{ color: accent }}>
          {formatMoney(t.total, doc.currency)}
        </span>
      </div>
      {doc.kind === 'invoice' && doc.paid_amount > 0 && (
        <>
          <div className={row}>
            <span className="text-slate-500">Paid</span>
            <span className="font-medium text-slate-900">
              {formatMoney(doc.paid_amount, doc.currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="text-sm font-semibold text-slate-900">Amount due</span>
            <span className="text-sm font-bold text-slate-900">
              {formatMoney(t.due, doc.currency)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export function ItemsTable({ doc, accent }: { doc: BusinessDocument; accent: string }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left">
          <th className="py-2 pr-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Description
          </th>
          <th className="w-16 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Qty
          </th>
          <th className="w-28 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Rate
          </th>
          <th className="w-28 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {doc.items.map((item) => (
          <tr key={item.id} className="border-b border-slate-100 align-top">
            <td className="py-3 pr-3">
              <p className="font-medium text-slate-900">{item.title || 'Item'}</p>
              {item.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.description}</p>
              )}
            </td>
            <td className="py-3 text-right text-slate-700">{item.quantity}</td>
            <td className="py-3 text-right text-slate-700">
              {formatMoney(item.unit_price, doc.currency)}
            </td>
            <td className="py-3 text-right font-medium" style={{ color: accent }}>
              {formatMoney(item.quantity * item.unit_price, doc.currency)}
            </td>
          </tr>
        ))}
        {doc.items.length === 0 && (
          <tr>
            <td colSpan={4} className="py-6 text-center text-slate-400">
              No line items yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
