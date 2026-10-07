import {
  CompanyMark,
  ItemsTable,
  TotalsBlock,
  docTitle,
  formatDate,
} from '@/components/documents/templates/shared'
import type { TemplateProps } from '@/components/documents/types'

const ACCENT = '#ea580c'

export function ModernTemplate({ doc, company }: TemplateProps) {
  return (
    <article className="mx-auto w-full max-w-[820px] bg-white text-slate-900 shadow-sm print:shadow-none">
      <header
        className="flex flex-wrap items-start justify-between gap-6 px-10 py-8"
        style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}
      >
        <div className="flex flex-col gap-2">
          <CompanyMark logoUrl={company.logoUrl} logoText={company.logoText} />
          <p className="text-sm font-medium text-slate-700">{company.name}</p>
          {company.tagline && <p className="text-xs text-slate-500">{company.tagline}</p>}
        </div>
        <div className="text-right">
          <p
            className="text-3xl font-bold tracking-tight uppercase"
            style={{ color: ACCENT }}
          >
            {docTitle(doc)}
          </p>
          <p className="mt-1 font-mono text-sm text-slate-600">{doc.doc_number}</p>
          <p className="mt-2 text-xs text-slate-500">Issued {formatDate(doc.issue_date)}</p>
          {doc.kind === 'quotation' && doc.valid_until && (
            <p className="text-xs text-slate-500">Valid until {formatDate(doc.valid_until)}</p>
          )}
          {doc.kind === 'invoice' && doc.due_date && (
            <p className="text-xs text-slate-500">Due {formatDate(doc.due_date)}</p>
          )}
        </div>
      </header>

      <div className="grid gap-6 px-10 py-8 sm:grid-cols-2">
        <section className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Billed to</p>
          <p className="mt-2 text-base font-semibold">{doc.client_name}</p>
          {doc.client_company && <p className="text-sm text-slate-600">{doc.client_company}</p>}
          {doc.client_email && <p className="text-sm text-slate-600">{doc.client_email}</p>}
          {doc.client_phone && <p className="text-sm text-slate-600">{doc.client_phone}</p>}
          {doc.client_address && (
            <p className="mt-1 text-sm whitespace-pre-line text-slate-600">{doc.client_address}</p>
          )}
        </section>

        <section className="rounded-xl bg-slate-50 p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">From</p>
          <p className="mt-2 text-base font-semibold">{company.name}</p>
          {company.email && <p className="text-sm text-slate-600">{company.email}</p>}
          {company.phone && <p className="text-sm text-slate-600">{company.phone}</p>}
          {company.address && <p className="text-sm text-slate-600">{company.address}</p>}
        </section>
      </div>

      <div className="px-10">
        <h2 className="text-lg font-semibold">{doc.project_title}</h2>
        {doc.project_details && (
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-600">
            {doc.project_details}
          </p>
        )}
      </div>

      <div className="px-10 py-8">
        <ItemsTable doc={doc} accent={ACCENT} />
        <div className="mt-6 flex justify-end">
          <TotalsBlock doc={doc} accent={ACCENT} />
        </div>
      </div>

      {(doc.terms || doc.notes) && (
        <div className="grid gap-6 px-10 pb-10 sm:grid-cols-2">
          {doc.terms && (
            <section>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Terms &amp; conditions
              </p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                {doc.terms}
              </p>
            </section>
          )}
          {doc.notes && (
            <section>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Notes</p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                {doc.notes}
              </p>
            </section>
          )}
        </div>
      )}

      <footer
        className="px-10 py-5 text-center text-xs text-white"
        style={{ backgroundColor: ACCENT }}
      >
        Thank you for your business — {company.name}
        {company.email ? ` · ${company.email}` : ''}
      </footer>
    </article>
  )
}
