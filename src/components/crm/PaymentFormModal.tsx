import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { AreaField, SelectField, TextField, toOptions } from '@/components/crm/fields'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/hooks/use-toast'
import { apiGet, apiPost, apiPut, errorMessage } from '@/lib/apiClient'
import { PAYMENT_METHODS, paymentTypeMeta, todayISO } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import { PAYMENT_TYPES } from '@/types/crm'
import type { CrmPayment, CrmProject, PaymentType } from '@/types/crm'

export function PaymentFormModal({
  open,
  onClose,
  payment,
  project,
  clientId,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  payment?: CrmPayment | null
  /** Locks the payment to one project (project page). */
  project?: CrmProject | null
  /** Limits the project picker to one client (client page). */
  clientId?: string
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [projects, setProjects] = React.useState<CrmProject[]>([])
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    project_id: '',
    amount: '',
    type: 'installment' as PaymentType,
    method: 'Cash',
    paid_at: todayISO(),
    reference: '',
    note: '',
  })

  React.useEffect(() => {
    if (!open) return
    setForm(
      payment
        ? {
            project_id: payment.project_id,
            amount: String(payment.amount),
            type: payment.type,
            method: payment.method,
            paid_at: payment.paid_at,
            reference: payment.reference ?? '',
            note: payment.note ?? '',
          }
        : {
            project_id: project?.id ?? '',
            amount: '',
            type: project && project.paid_amount === 0 ? 'advance' : 'installment',
            method: 'Cash',
            paid_at: todayISO(),
            reference: '',
            note: '',
          },
    )
    if (!project && !payment) {
      apiGet<CrmProject[]>(clientId ? `/crm/projects?client_id=${clientId}` : '/crm/projects')
        .then((rows) => setProjects(rows.filter((p) => p.status !== 'cancelled')))
        .catch(() => setProjects([]))
    }
  }, [open, payment, project, clientId])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const selected = project ?? projects.find((p) => p.id === form.project_id) ?? null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, amount: Number(form.amount) }
    try {
      if (payment) {
        await apiPut(`/crm/payments/${payment.id}`, payload)
      } else {
        await apiPost('/crm/payments', payload)
      }
      toast({ title: payment ? 'Payment updated' : 'Payment recorded' })
      onSaved()
      onClose()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not save payment', description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={payment ? 'Edit payment' : 'Record payment'} className="max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!project && !payment && (
          <SelectField
            label="Project *"
            required
            value={form.project_id}
            onChange={set('project_id')}
            options={[
              { value: '', label: projects.length ? 'Select a project…' : 'No open projects' },
              ...projects.map((p) => ({ value: p.id, label: `${p.title} — ${p.client_name}` })),
            ]}
          />
        )}
        {selected && !payment && (
          <p className="bg-secondary/60 rounded-lg px-3 py-2 text-xs">
            {selected.title}: total {formatMoney(selected.total_cost, selected.currency)} · paid{' '}
            {formatMoney(selected.paid_amount, selected.currency)} ·{' '}
            <span className="font-semibold">due {formatMoney(selected.due_amount, selected.currency)}</span>
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={`Amount${selected ? ` (${selected.currency})` : ''} *`}
            type="number"
            min="0.01"
            step="0.01"
            required
            autoFocus
            value={form.amount}
            onChange={set('amount')}
          />
          <SelectField label="Type" value={form.type} onChange={set('type')} options={toOptions(PAYMENT_TYPES, paymentTypeMeta)} />
          <SelectField
            label="Method"
            value={form.method}
            onChange={set('method')}
            options={toOptions(
              PAYMENT_METHODS.includes(form.method as (typeof PAYMENT_METHODS)[number])
                ? PAYMENT_METHODS
                : [...PAYMENT_METHODS, form.method],
            )}
          />
          <TextField label="Payment date" type="date" required value={form.paid_at} onChange={set('paid_at')} />
          <TextField
            label="Transaction ID / reference"
            className="sm:col-span-2"
            placeholder="bKash TrxID, cheque no…"
            value={form.reference}
            onChange={set('reference')}
          />
        </div>
        <AreaField label="Note" rows={2} value={form.note} onChange={set('note')} />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {payment ? 'Save changes' : 'Record payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
