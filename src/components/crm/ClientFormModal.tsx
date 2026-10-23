import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { AreaField, SelectField, TextField, toOptions } from '@/components/crm/fields'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/hooks/use-toast'
import { apiPost, apiPut, errorMessage } from '@/lib/apiClient'
import { clientStatusMeta } from '@/lib/crm'
import { CRM_CLIENT_STATUSES } from '@/types/crm'
import type { CrmClient, CrmClientStatus } from '@/types/crm'

const EMPTY = {
  name: '',
  company: '',
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  industry: '',
  source: '',
  address: '',
  notes: '',
  status: 'active' as CrmClientStatus,
}
type Form = typeof EMPTY

export function ClientFormModal({
  open,
  onClose,
  client,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  client?: CrmClient | null
  onSaved: (client: CrmClient) => void
}) {
  const { toast } = useToast()
  const [form, setForm] = React.useState<Form>(EMPTY)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setForm(
      client
        ? {
            name: client.name,
            company: client.company ?? '',
            email: client.email ?? '',
            phone: client.phone ?? '',
            whatsapp: client.whatsapp ?? '',
            website: client.website ?? '',
            industry: client.industry ?? '',
            source: client.source ?? '',
            address: client.address ?? '',
            notes: client.notes ?? '',
            status: client.status,
          }
        : EMPTY,
    )
  }, [open, client])

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = client
        ? await apiPut<CrmClient>(`/crm/clients/${client.id}`, form)
        : await apiPost<CrmClient>('/crm/clients', form)
      toast({ title: client ? 'Client updated' : 'Client added' })
      onSaved(saved)
      onClose()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not save client', description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Edit client' : 'Add client'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Client name *" required value={form.name} onChange={set('name')} autoFocus />
          <TextField label="Company / Business" value={form.company} onChange={set('company')} />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            hint="Used as the client's portal login."
          />
          <TextField label="Phone" value={form.phone} onChange={set('phone')} />
          <TextField label="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} />
          <TextField label="Website" placeholder="example.com" value={form.website} onChange={set('website')} />
          <TextField label="Industry" placeholder="Fashion, Education…" value={form.industry} onChange={set('industry')} />
          <TextField label="Source" placeholder="Facebook, Referral, Website…" value={form.source} onChange={set('source')} />
          <SelectField
            label="Status"
            value={form.status}
            onChange={set('status')}
            options={toOptions(CRM_CLIENT_STATUSES, clientStatusMeta)}
          />
        </div>
        <AreaField label="Address" rows={2} value={form.address} onChange={set('address')} />
        <AreaField label="Internal notes" rows={3} value={form.notes} onChange={set('notes')} />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {client ? 'Save changes' : 'Add client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
