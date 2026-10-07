import { docTotals } from '@/lib/documents'
import { formatMoney } from '@/lib/leadMeta'
import {
  CompanyMark,
  ItemsTable,
  TotalsBlock,
  docTitle,
  formatDate,
} from '@/components/documents/templates/shared'
import type { TemplateProps } from '@/components/documents/types'

const ACCENT = '#ea580c'

export function BoldTemplate({ doc, company }: TemplateProps) {
  const totals = docTotals(doc)

  return (
    <article className="mx-auto w-full max-w-[820px] bg-white text-slate-900 shadow-sm print:shadow-none">
      <header className="bg-slate-900 px-10 py-9 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <CompanyMark logoUrl={company.logoUrl} logoText={company.logoText} dark />
            <p className="mt-2 text-sm text-white/70">{company.name}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black tracking-tight uppercase">{docTitle(doc)}</p>
            <p className="mt-1 font-mono text-sm text-white/60">{doc.doc_number}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-10 text-sm">
          <div>
            <p className="text-[11px] tracking-wide text-white/50 uppercase">Issued</p>
            <p className="font-semibold">{formatDate(doc.issue_date)}</p>
          </div>
          {doc.kind === 'quotation' && doc.valid_until && (
            <div>
              <p className="text-[11px] tracking-wide text-white/50 uppercase">Valid until</p>
              <p className="font-semibold">{formatDate(doc.valid_until)}</p>
            </div>
          )}
          {doc.kind === 'invoice' && doc.due_date && (
            <div>
              <p className="text-[11px] tracking-wide text-white/50 uppercase">Due</p>
              <p className="font-semibold">{formatDate(doc.due_date)}</p>
            </div>
          )}
          <div className="ml-auto text-right">
            <p className="text-[11px] tracking-wide text-white/50 uppercase">
              {doc.kind === 'invoice' ? 'Amount due' : 'Total'}
            </p>
            <p className="text-2xl font-black" style={{ color: '#fb923c' }}>
              {formatMoney(doc.kind === 'invoice' ? totals.due : totals.total, doc.currency)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 px-10 py-8 sm:grid-cols-2">
        <section>
          <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Billed to</p>
          <p className="mt-2 text-lg font-bold">{doc.client_name}</p>
          {doc.client_company && <p className="text-sm text-slate-600">{doc.client_company}</p>}
          {doc.client_email && <p className="text-sm text-slate-600">{doc.client_email}</p>}
          {doc.client_phone && <p className="text-sm text-slate-600">{doc.client_phone}</p>}
          {doc.client_address && (
            <p className="mt-1 text-sm whitespace-pre-line text-slate-600">{doc.client_address}</p>
          )}
        </section>
        <section className="sm:text-right">
          <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">From</p>
          <p className="mt-2 text-lg font-bold">{company.name}</p>
          {company.email && <p className="text-sm text-slate-600">{company.email}</p>}
          {company.phone && <p className="text-sm text-slate-600">{company.phone}</p>}
          {company.address && <p className="text-sm text-slate-600">{company.address}</p>}
        </section>
      </div>

      <div className="px-10">
        <div className="border-l-4 pl-4" style={{ borderColor: ACCENT }}>
          <h2 className="text-xl font-bold">{doc.project_title}</h2>
          {doc.project_details && (
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-600">
              {doc.project_details}
            </p>
          )}
        </div>
      </div>

      <div className="px-10 py-8">
        <ItemsTable doc={doc} accent={ACCENT} />
        <div className="mt-6 flex justify-end">
          <TotalsBlock doc={doc} accent={ACCENT} />
        </div>
      </div>

      {(doc.terms || doc.notes) && (
        <div className="grid gap-6 bg-slate-50 px-10 py-8 sm:grid-cols-2">
          {doc.terms && (
            <section>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                Terms &amp; conditions
              </p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                {doc.terms}
              </p>
            </section>
          )}
          {doc.notes && (
            <section>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Notes</p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                {doc.notes}
              </p>
            </section>
          )}
        </div>
      )}

      <footer className="bg-slate-900 px-10 py-5 text-center text-xs text-white/70">
        {company.name}
        {company.phone ? ` · ${company.phone}` : ''}
        {company.email ? ` · ${company.email}` : ''}
      </footer>
    </article>
  )
}
