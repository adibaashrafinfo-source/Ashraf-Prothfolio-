import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { AreaField, SelectField, TextField, toOptions } from '@/components/crm/fields'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/hooks/use-toast'
import { apiGet, apiPost, apiPut, errorMessage } from '@/lib/apiClient'
import { priorityMeta, projectStatusMeta, SERVICE_TYPES } from '@/lib/crm'
import { CURRENCIES } from '@/lib/leadMeta'
import { PRIORITIES, PROJECT_STATUSES } from '@/types/crm'
import type { CrmClient, CrmProject, Priority, ProjectStatus } from '@/types/crm'

const EMPTY = {
  client_id: '',
  title: '',
  service_type: 'Website Development' as string,
  status: 'not_started' as ProjectStatus,
  priority: 'medium' as Priority,
  total_cost: '',
  currency: 'BDT',
  start_date: '',
  deadline: '',
  live_url: '',
  staging_url: '',
  description: '',
  client_note: '',
  internal_notes: '',
}
type Form = typeof EMPTY

export function ProjectFormModal({
  open,
  onClose,
  project,
  clientId,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  project?: CrmProject | null
  /** Pre-selects (and locks) the client when adding from a client's page. */
  clientId?: string
  onSaved: (project: CrmProject) => void
}) {
  const { toast } = useToast()
  const [form, setForm] = React.useState<Form>(EMPTY)
  const [clients, setClients] = React.useState<CrmClient[]>([])
  const [saving, setSaving] = React.useState(false)
  const editing = Boolean(project)

  React.useEffect(() => {
    if (!open) return
    setForm(
      project
        ? {
            client_id: project.client_id,
            title: project.title,
            service_type: project.service_type,
            status: project.status,
            priority: project.priority,
            total_cost: String(project.total_cost || ''),
            currency: project.currency,
            start_date: project.start_date ?? '',
            deadline: project.deadline ?? '',
            live_url: project.live_url ?? '',
            staging_url: project.staging_url ?? '',
            description: project.description ?? '',
            client_note: project.client_note ?? '',
            internal_notes: project.internal_notes ?? '',
          }
        : { ...EMPTY, client_id: clientId ?? '' },
    )
    if (!project && !clientId) {
      apiGet<CrmClient[]>('/crm/clients')
        .then(setClients)
        .catch(() => setClients([]))
    }
  }, [open, project, clientId])

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const serviceOptions = SERVICE_TYPES.includes(form.service_type as (typeof SERVICE_TYPES)[number])
    ? toOptions(SERVICE_TYPES)
    : [...toOptions(SERVICE_TYPES), { value: form.service_type, label: form.service_type }]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id) {
      toast({ variant: 'destructive', title: 'Choose a client first' })
      return
    }
    setSaving(true)
    const { client_id, ...fields } = form
    const payload = { ...fields, total_cost: form.total_cost === '' ? 0 : Number(form.total_cost) }
    try {
      const saved = project
        ? await apiPut<CrmProject>(`/crm/projects/${project.id}`, payload)
        : await apiPost<CrmProject>('/crm/projects', { ...payload, client_id })
      toast({ title: project ? 'Project updated' : 'Project created' })
      onSaved(saved)
      onClose()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not save project', description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit project' : 'New project'}
      description={editing ? undefined : 'Stages are created automatically from the service type — you can edit them after.'}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!editing && !clientId && (
            <SelectField
              label="Client *"
              className="sm:col-span-2"
              value={form.client_id}
              onChange={set('client_id')}
              required
              options={[
                { value: '', label: clients.length ? 'Select a client…' : 'No clients yet — add one first' },
                ...clients.map((c) => ({ value: c.id, label: c.company ? `${c.name} — ${c.company}` : c.name })),
              ]}
            />
          )}
          <TextField label="Project title *" required value={form.title} onChange={set('title')} autoFocus />
          <SelectField
            label="Service"
            value={form.service_type}
            onChange={set('service_type')}
            options={serviceOptions}
            hint={editing ? 'Changing service keeps the current stages. Use "Reset stages" to load the new template.' : undefined}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={set('status')}
            options={toOptions(PROJECT_STATUSES, projectStatusMeta)}
          />
          <SelectField
            label="Priority"
            value={form.priority}
            onChange={set('priority')}
            options={toOptions(PRIORITIES, priorityMeta)}
          />
          <TextField label="Total cost" type="number" min="0" step="0.01" value={form.total_cost} onChange={set('total_cost')} />
          <SelectField label="Currency" value={form.currency} onChange={set('currency')} options={toOptions(CURRENCIES)} />
          <TextField label="Start date" type="date" value={form.start_date} onChange={set('start_date')} />
          <TextField label="Deadline" type="date" value={form.deadline} onChange={set('deadline')} />
          <TextField label="Live site link" placeholder="https://" value={form.live_url} onChange={set('live_url')} />
          <TextField label="Preview / staging link" placeholder="https://" value={form.staging_url} onChange={set('staging_url')} />
        </div>
        <AreaField label="Scope / description" rows={3} value={form.description} onChange={set('description')} />
        <AreaField
          label="Message for client"
          rows={2}
          value={form.client_note}
          onChange={set('client_note')}
          hint="Shown on the client's dashboard (e.g. what you need from them)."
        />
        <AreaField
          label="Internal notes"
          rows={2}
          value={form.internal_notes}
          onChange={set('internal_notes')}
          hint="Only you can see this."
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editing ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
