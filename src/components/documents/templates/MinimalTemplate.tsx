import {
  CompanyMark,
  ItemsTable,
  TotalsBlock,
  docTitle,
  formatDate,
} from '@/components/documents/templates/shared'
import type { TemplateProps } from '@/components/documents/types'

const ACCENT = '#0f172a'

export function MinimalTemplate({ doc, company }: TemplateProps) {
  return (
    <article className="mx-auto w-full max-w-[820px] bg-white px-10 py-12 text-slate-900 shadow-sm print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-900 pb-6">
        <div>
          <CompanyMark logoUrl={company.logoUrl} logoText={company.logoText} />
          <p className="mt-2 font-mono text-xs tracking-wide text-slate-500 uppercase">
            {company.name}
          </p>
        </div>
        <div className="text-right font-mono text-xs text-slate-600">
          <p className="text-sm tracking-[0.3em] text-slate-900 uppercase">{docTitle(doc)}</p>
          <p className="mt-2">{doc.doc_number}</p>
          <p>Issued · {formatDate(doc.issue_date)}</p>
          {doc.kind === 'quotation' && doc.valid_until && (
            <p>Valid · {formatDate(doc.valid_until)}</p>
          )}
          {doc.kind === 'invoice' && doc.due_date && <p>Due · {formatDate(doc.due_date)}</p>}
        </div>
      </header>

      <div className="grid gap-10 py-8 sm:grid-cols-2">
        <section>
          <p className="font-mono text-[11px] tracking-[0.2em] text-slate-400 uppercase">To</p>
          <p className="mt-2 font-semibold">{doc.client_name}</p>
          {doc.client_company && <p className="text-sm text-slate-600">{doc.client_company}</p>}
          {doc.client_email && <p className="text-sm text-slate-600">{doc.client_email}</p>}
          {doc.client_phone && <p className="text-sm text-slate-600">{doc.client_phone}</p>}
          {doc.client_address && (
            <p className="mt-1 text-sm whitespace-pre-line text-slate-600">{doc.client_address}</p>
          )}
        </section>
        <section>
          <p className="font-mono text-[11px] tracking-[0.2em] text-slate-400 uppercase">From</p>
          <p className="mt-2 font-semibold">{company.name}</p>
          {company.email && <p className="text-sm text-slate-600">{company.email}</p>}
          {company.phone && <p className="text-sm text-slate-600">{company.phone}</p>}
          {company.address && <p className="text-sm text-slate-600">{company.address}</p>}
        </section>
      </div>

      <section className="border-t border-slate-200 pt-6">
        <h2 className="font-semibold">{doc.project_title}</h2>
        {doc.project_details && (
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-600">
            {doc.project_details}
          </p>
        )}
      </section>

      <div className="py-8">
        <ItemsTable doc={doc} accent={ACCENT} />
        <div className="mt-6 flex justify-end">
          <TotalsBlock doc={doc} accent={ACCENT} />
        </div>
      </div>

      {(doc.terms || doc.notes) && (
        <div className="grid gap-8 border-t border-slate-200 pt-6 sm:grid-cols-2">
          {doc.terms && (
            <section>
              <p className="font-mono text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                Terms
              </p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                {doc.terms}
              </p>
            </section>
          )}
          {doc.notes && (
            <section>
              <p className="font-mono text-[11px] tracking-[0.2em] text-slate-400 uppercase">
                Notes
              </p>
              <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                {doc.notes}
              </p>
            </section>
          )}
        </div>
      )}

      <footer className="mt-10 border-t border-slate-900 pt-4 text-center font-mono text-[11px] tracking-wide text-slate-500 uppercase">
        {company.name}
        {company.email ? ` — ${company.email}` : ''}
      </footer>
    </article>
  )
}
