import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileOutput, Loader2, Plus, Printer, Sparkles, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { DocumentPreview } from '@/components/documents/DocumentPreview'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import {
  addDays,
  composeProfessionalCopy,
  emptyItem,
  generateDocNumber,
  templateMeta,
  today,
} from '@/lib/documents'
import { CURRENCIES } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import {
  DOCUMENT_TEMPLATES,
  INVOICE_STATUSES,
  QUOTATION_STATUSES,
} from '@/types'
import type {
  BusinessDocument,
  DocumentKind,
  DocumentStatus,
  DocumentTemplate,
  Lead,
} from '@/types'

const VALID_DAYS = 15

function blankDoc(kind: DocumentKind): BusinessDocument {
  return {
    id: '',
    kind,
    doc_number: generateDocNumber(kind),
    lead_id: null,
    source_quotation_id: null,
    client_name: '',
    client_company: null,
    client_email: null,
    client_phone: null,
    client_address: null,
    project_title: '',
    project_details: null,
    items: [emptyItem()],
    currency: 'BDT',
    discount: 0,
    tax_percent: 0,
    terms: null,
    notes: null,
    issue_date: today(),
    valid_until: kind === 'quotation' ? addDays(VALID_DAYS) : null,
    due_date: kind === 'invoice' ? addDays(7) : null,
    paid_amount: 0,
    template: 'modern',
    status: 'draft',
    created_at: '',
    updated_at: '',
  }
}

export function DocumentEditPage({ newKind }: { newKind?: DocumentKind }) {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [doc, setDoc] = React.useState<BusinessDocument>(() => blankDoc(newKind ?? 'quotation'))
  const [loading, setLoading] = React.useState(Boolean(id))
  const [saving, setSaving] = React.useState(false)

  const set = <K extends keyof BusinessDocument>(key: K, value: BusinessDocument[K]) =>
    setDoc((d) => ({ ...d, [key]: value }))

  // Load an existing document, or prefill a new one from the lead it came from.
  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!supabase) {
        setLoading(false)
        return
      }

      if (id) {
        const { data, error } = await supabase
          .from('business_documents')
          .select('*')
          .eq('id', id)
          .single()
        if (cancelled) return
        if (error || !data) {
          toast({ variant: 'destructive', title: 'Could not load document' })
        } else {
          setDoc({ ...(data as BusinessDocument), items: (data.items ?? []) as never })
        }
        setLoading(false)
        return
      }

      const leadId = params.get('lead')
      if (leadId) {
        const { data } = await supabase
          .from('contact_submissions')
          .select('*')
          .eq('id', leadId)
          .single()
        if (cancelled || !data) return
        const lead = data as Lead
        setDoc((d) => ({
          ...d,
          lead_id: lead.id,
          client_name: lead.name,
          client_email: lead.email,
          client_phone: lead.phone,
          client_company: lead.company,
          project_title: lead.project_name || lead.subject,
          project_details: lead.message,
          currency: lead.currency || d.currency,
          items: [
            {
              ...emptyItem(),
              title: lead.project_type || lead.project_name || lead.subject,
              unit_price: lead.project_cost ?? 0,
            },
          ],
        }))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, params, toast])

  const statuses: readonly DocumentStatus[] =
    doc.kind === 'quotation' ? QUOTATION_STATUSES : INVOICE_STATUSES

  const generateCopy = () => {
    const { details, terms } = composeProfessionalCopy({
      kind: doc.kind,
      clientName: doc.client_name,
      projectTitle: doc.project_title,
      rawDetails: doc.project_details ?? '',
      items: doc.items,
      validDays: VALID_DAYS,
      currency: doc.currency,
    })
    setDoc((d) => ({ ...d, project_details: details, terms }))
    toast({ title: 'Draft copy generated', description: 'Edit anything that needs tweaking.' })
  }

  const save = async () => {
    if (!supabase) return
    if (!doc.client_name || !doc.project_title) {
      toast({
        variant: 'destructive',
        title: 'Missing details',
        description: 'Client name and project title are required.',
      })
      return
    }
    setSaving(true)

    const payload = {
      kind: doc.kind,
      doc_number: doc.doc_number,
      lead_id: doc.lead_id,
      source_quotation_id: doc.source_quotation_id,
      client_name: doc.client_name,
      client_company: doc.client_company,
      client_email: doc.client_email,
      client_phone: doc.client_phone,
      client_address: doc.client_address,
      project_title: doc.project_title,
      project_details: doc.project_details,
      items: doc.items,
      currency: doc.currency,
      discount: doc.discount,
      tax_percent: doc.tax_percent,
      terms: doc.terms,
      notes: doc.notes,
      issue_date: doc.issue_date,
      valid_until: doc.valid_until,
      due_date: doc.due_date,
      paid_amount: doc.paid_amount,
      template: doc.template,
      status: doc.status,
      updated_at: new Date().toISOString(),
    }

    try {
      if (doc.id) {
        const { error } = await supabase
          .from('business_documents')
          .update(payload)
          .eq('id', doc.id)
        if (error) throw new Error(error.message)
        toast({ title: 'Saved' })
      } else {
        const { data, error } = await supabase
          .from('business_documents')
          .insert(payload)
          .select()
          .single()
        if (error) throw new Error(error.message)
        toast({ title: 'Created' })
        navigate(`/admin/documents/${(data as BusinessDocument).id}`, { replace: true })
      }
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

  const convertToInvoice = async () => {
    if (!supabase || !doc.id) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('business_documents')
        .insert({
          kind: 'invoice',
          doc_number: generateDocNumber('invoice'),
          lead_id: doc.lead_id,
          source_quotation_id: doc.id,
          client_name: doc.client_name,
          client_company: doc.client_company,
          client_email: doc.client_email,
          client_phone: doc.client_phone,
          client_address: doc.client_address,
          project_title: doc.project_title,
          project_details: doc.project_details,
          items: doc.items,
          currency: doc.currency,
          discount: doc.discount,
          tax_percent: doc.tax_percent,
          terms: composeProfessionalCopy({
            kind: 'invoice',
            clientName: doc.client_name,
            projectTitle: doc.project_title,
            rawDetails: '',
            items: doc.items,
            validDays: VALID_DAYS,
            currency: doc.currency,
          }).terms,
          notes: doc.notes,
          issue_date: today(),
          due_date: addDays(7),
          template: doc.template,
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      toast({ title: 'Invoice created from this quotation' })
      navigate(`/admin/documents/${(data as BusinessDocument).id}`)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not create invoice',
        description: err instanceof Error ? err.message : 'Could not reach the server.',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (itemId: string, patch: Partial<BusinessDocument['items'][number]>) =>
    setDoc((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    }))

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => navigate(doc.kind === 'quotation' ? '/admin/quotations' : '/admin/invoices')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold capitalize">{doc.kind}</h1>
            <p className="text-muted-foreground font-mono text-xs">{doc.doc_number}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={generateCopy}>
            <Sparkles className="size-4" />
            Generate copy
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print / PDF
          </Button>
          {doc.kind === 'quotation' && doc.id && (
            <Button variant="outline" className="gap-2" onClick={convertToInvoice} disabled={saving}>
              <FileOutput className="size-4" />
              Make invoice
            </Button>
          )}
          <Button className="gap-2" onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 print:hidden">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Client</p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="d-cname">Name *</Label>
                <Input
                  id="d-cname"
                  value={doc.client_name}
                  onChange={(e) => set('client_name', e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-ccomp">Company</Label>
                  <Input
                    id="d-ccomp"
                    value={doc.client_company ?? ''}
                    onChange={(e) => set('client_company', e.target.value || null)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-cmail">Email</Label>
                  <Input
                    id="d-cmail"
                    type="email"
                    value={doc.client_email ?? ''}
                    onChange={(e) => set('client_email', e.target.value || null)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-cphone">Phone</Label>
                  <Input
                    id="d-cphone"
                    value={doc.client_phone ?? ''}
                    onChange={(e) => set('client_phone', e.target.value || null)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-caddr">Address</Label>
                  <Input
                    id="d-caddr"
                    value={doc.client_address ?? ''}
                    onChange={(e) => set('client_address', e.target.value || null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Project</p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="d-ptitle">Title *</Label>
                <Input
                  id="d-ptitle"
                  value={doc.project_title}
                  onChange={(e) => set('project_title', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="d-pdetails">Details / scope</Label>
                <Textarea
                  id="d-pdetails"
                  rows={5}
                  placeholder="Rough notes are fine — hit Generate copy to turn them into client-ready text."
                  value={doc.project_details ?? ''}
                  onChange={(e) => set('project_details', e.target.value || null)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Line items</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setDoc((d) => ({ ...d, items: [...d.items, emptyItem()] }))}
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>

              {doc.items.map((item) => (
                <div key={item.id} className="border-border flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Item title"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove item"
                      onClick={() =>
                        setDoc((d) => ({ ...d, items: d.items.filter((i) => i.id !== item.id) }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Short description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Unit price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Pricing &amp; dates</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-cur">Currency</Label>
                  <select
                    id="d-cur"
                    className="border-input bg-background h-11 rounded-lg border px-3 text-sm"
                    value={doc.currency}
                    onChange={(e) => set('currency', e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-status">Status</Label>
                  <select
                    id="d-status"
                    className="border-input bg-background h-11 rounded-lg border px-3 text-sm capitalize"
                    value={doc.status}
                    onChange={(e) => set('status', e.target.value as DocumentStatus)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-disc">Discount</Label>
                  <Input
                    id="d-disc"
                    type="number"
                    min="0"
                    step="0.01"
                    value={doc.discount}
                    onChange={(e) => set('discount', Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-tax">Tax %</Label>
                  <Input
                    id="d-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={doc.tax_percent}
                    onChange={(e) => set('tax_percent', Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-issue">Issue date</Label>
                  <Input
                    id="d-issue"
                    type="date"
                    value={doc.issue_date}
                    onChange={(e) => set('issue_date', e.target.value)}
                  />
                </div>
                {doc.kind === 'quotation' ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-valid">Valid until</Label>
                    <Input
                      id="d-valid"
                      type="date"
                      value={doc.valid_until ?? ''}
                      onChange={(e) => set('valid_until', e.target.value || null)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="d-due">Due date</Label>
                      <Input
                        id="d-due"
                        type="date"
                        value={doc.due_date ?? ''}
                        onChange={(e) => set('due_date', e.target.value || null)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="d-paid">Paid amount</Label>
                      <Input
                        id="d-paid"
                        type="number"
                        min="0"
                        step="0.01"
                        value={doc.paid_amount}
                        onChange={(e) => set('paid_amount', Number(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="d-terms">Terms</Label>
                <Textarea
                  id="d-terms"
                  rows={4}
                  value={doc.terms ?? ''}
                  onChange={(e) => set('terms', e.target.value || null)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="d-notes">Notes</Label>
                <Textarea
                  id="d-notes"
                  rows={2}
                  value={doc.notes ?? ''}
                  onChange={(e) => set('notes', e.target.value || null)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm font-semibold">Template</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {DOCUMENT_TEMPLATES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('template', t as DocumentTemplate)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-colors',
                      doc.template === t
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <p className="text-sm font-semibold">{templateMeta[t].label}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                      {templateMeta[t].description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="print-area bg-secondary/30 overflow-x-auto rounded-xl p-4 print:bg-white print:p-0">
          <DocumentPreview doc={doc} />
        </div>
      </div>
    </div>
  )
}
