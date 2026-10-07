import type { BusinessDocument, DocumentItem, DocumentKind, DocumentTemplate } from '@/types'

export const templateMeta: Record<DocumentTemplate, { label: string; description: string }> = {
  modern: { label: 'Modern', description: 'Accent header band, soft cards, roomy type.' },
  minimal: { label: 'Minimal', description: 'Mono-flavoured, hairline rules, lots of white space.' },
  bold: { label: 'Bold', description: 'Dark header block, heavy numbers, high contrast.' },
}

export function emptyItem(): DocumentItem {
  return { id: crypto.randomUUID(), title: '', description: '', quantity: 1, unit_price: 0 }
}

export function docTotals(doc: {
  items: DocumentItem[]
  discount: number
  tax_percent: number
  paid_amount?: number
}) {
  const subtotal = doc.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const discount = Math.min(doc.discount || 0, subtotal)
  const taxable = subtotal - discount
  const tax = (taxable * (doc.tax_percent || 0)) / 100
  const total = taxable + tax
  const paid = doc.paid_amount ?? 0
  return { subtotal, discount, tax, total, due: total - paid }
}

/** QT-20260207-4821 / INV-20260207-4821 — readable, sortable, collision-safe enough. */
export function generateDocNumber(kind: DocumentKind) {
  const prefix = kind === 'quotation' ? 'QT' : 'INV'
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${stamp}-${rand}`
}

export function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Composes a polished scope + terms block out of whatever the admin typed, so a
 * few rough notes come back as client-ready copy instead of a blank document.
 */
export function composeProfessionalCopy(input: {
  kind: DocumentKind
  clientName: string
  projectTitle: string
  rawDetails: string
  items: DocumentItem[]
  validDays: number
  currency: string
}) {
  const { clientName, projectTitle, rawDetails, items, validDays } = input
  const named = items.filter((i) => i.title.trim())
  const client = clientName.trim() || 'the client'
  const project = projectTitle.trim() || 'the proposed project'

  const scopeLines = named.length
    ? named.map((i) => `• ${i.title}${i.description ? ` — ${i.description}` : ''}`).join('\n')
    : '• Scope items will be confirmed before work begins.'

  const details = [
    `Prepared for ${client}, this proposal covers ${project}.`,
    rawDetails.trim(),
    '',
    'Scope of work',
    scopeLines,
  ]
    .filter(Boolean)
    .join('\n')

  const terms =
    input.kind === 'quotation'
      ? [
          `1. This quotation is valid for ${validDays} days from the issue date.`,
          '2. 50% advance is required to start; the balance is due on delivery.',
          '3. The quoted price covers the scope listed above. Anything outside it is quoted separately.',
          '4. Two rounds of revisions are included per deliverable.',
          '5. Full ownership transfers to the client once the final payment clears.',
        ].join('\n')
      : [
          '1. Payment is due by the date shown above.',
          '2. Please reference the invoice number with your transfer.',
          '3. Deliverables remain the property of Abrar IT until payment clears in full.',
          '4. Late payments may pause ongoing work on the project.',
        ].join('\n')

  return { details, terms }
}

export function isOverdue(doc: BusinessDocument) {
  if (doc.kind !== 'invoice' || !doc.due_date) return false
  if (doc.status === 'paid' || doc.status === 'cancelled') return false
  return new Date(doc.due_date) < new Date(new Date().toDateString())
}
