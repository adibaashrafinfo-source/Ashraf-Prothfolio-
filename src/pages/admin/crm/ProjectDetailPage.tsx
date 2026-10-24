import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, ExternalLink, Eye, Loader2, Pencil, Plus, Send, Trash2 } from 'lucide-react'

import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { MoneySummary, Pill, ProgressBar, SectionCard } from '@/components/crm/bits'
import { AreaField, InlineSelect, toOptions } from '@/components/crm/fields'
import { FileVault } from '@/components/crm/FileVault'
import { PaymentFormModal } from '@/components/crm/PaymentFormModal'
import { PaymentsTable } from '@/components/crm/PaymentsTable'
import { ProjectFormModal } from '@/components/crm/ProjectFormModal'
import { ReceiptModal } from '@/components/crm/Receipt'
import { StageEditor } from '@/components/crm/StageEditor'
import { UpdateComposer } from '@/components/crm/UpdateComposer'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useApiResource } from '@/hooks/use-api-resource'
import { useToast } from '@/hooks/use-toast'
import { apiDelete, apiPost, apiPut, errorMessage } from '@/lib/apiClient'
import { deadlineLabel, formatDate, isOverdue, priorityMeta, projectStatusMeta } from '@/lib/crm'
import { cn } from '@/lib/utils'
import { PROJECT_STATUSES } from '@/types/crm'
import type { CrmPayment, CrmProject, CrmProjectDetail, ProjectStage, ProjectStatus } from '@/types/crm'

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: project, setData, loading, error, refetch } = useApiResource<CrmProjectDetail>(`/crm/projects/${id}`)
  const [editing, setEditing] = React.useState(false)
  const [paymentModal, setPaymentModal] = React.useState<{ open: boolean; payment: CrmPayment | null }>({
    open: false,
    payment: null,
  })
  const [approvalStage, setApprovalStage] = React.useState<ProjectStage | null>(null)
  const [receiptPayment, setReceiptPayment] = React.useState<CrmPayment | null>(null)

  if (loading && !project) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (error || !project) return <p className="text-destructive text-sm">{error ?? 'Project not found.'}</p>

  /** PUTs changes, then reloads so payments/activity stay in sync. */
  const update = async (changes: Record<string, unknown>, success?: string): Promise<boolean> => {
    try {
      const updated = await apiPut<CrmProject>(`/crm/projects/${project.id}`, changes)
      setData((d) => (d ? { ...d, ...updated } : d))
      if (success) toast({ title: success })
      refetch()
      return true
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not update project', description: errorMessage(err) })
      return false
    }
  }

  const saveStages = (stages: ProjectStage[]) => update({ stages })

  const resetStages = () => {
    if (!window.confirm(`Replace all stages with the default "${project.service_type}" template? Stage progress will be cleared.`)) return
    update({ reset_stages: true }, 'Stages reset to template')
  }

  const remove = async () => {
    if (!window.confirm(`Delete project "${project.title}" and its payment records?`)) return
    try {
      await apiDelete(`/crm/projects/${project.id}`)
      toast({ title: 'Project deleted' })
      navigate(`/admin/crm/clients/${project.client_id}`)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not delete', description: errorMessage(err) })
    }
  }

  const deletePayment = async (p: CrmPayment) => {
    if (!window.confirm('Delete this payment record?')) return
    try {
      await apiDelete(`/crm/payments/${p.id}`)
      refetch()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not delete', description: errorMessage(err) })
    }
  }

  const requestApproval = async (message: string) => {
    if (!approvalStage) return
    try {
      await apiPost('/crm/approvals', {
        project_id: project.id,
        stage_id: approvalStage.id,
        stage_name: approvalStage.name,
        message: message || null,
      })
      toast({ title: 'Approval request sent to client' })
      setApprovalStage(null)
      refetch()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not send request', description: errorMessage(err) })
    }
  }

  const deleteActivity = async (activityId: string) => {
    try {
      await apiDelete(`/crm/activity/${activityId}`)
      refetch()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not delete', description: errorMessage(err) })
    }
  }

  const overdue = isOverdue(project)
  const deadline = deadlineLabel(project)
  const details = [
    { label: 'Service', value: project.service_type },
    { label: 'Started', value: formatDate(project.start_date) },
    { label: 'Deadline', value: formatDate(project.deadline) },
    { label: 'Completed', value: formatDate(project.completed_at) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/admin/crm/clients/${project.client_id}`}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" /> {project.client_name}
        {project.client_company && ` · ${project.client_company}`}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{project.title}</h1>
            <Pill meta={priorityMeta[project.priority]} />
          </div>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 text-sm">
            <span>{project.service_type}</span>
            {deadline && (
              <span className={cn('inline-flex items-center gap-1', overdue && 'font-semibold text-rose-600 dark:text-rose-400')}>
                <CalendarClock className="size-4" /> {deadline}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InlineSelect
            aria-label="Project status"
            value={project.status}
            onChange={(e) => update({ status: e.target.value as ProjectStatus }, 'Status updated')}
          >
            {toOptions(PROJECT_STATUSES, projectStatusMeta).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </InlineSelect>
          <Button variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete project" onClick={remove}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {project.status === 'completed'
              ? 'Project completed'
              : project.current_stage
                ? `Current stage: ${project.current_stage}`
                : 'Overall progress'}
          </span>
          <span className="font-display text-lg font-bold">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <MoneySummary
        total={project.total_cost}
        advance={project.advance_amount}
        paid={project.paid_amount}
        due={project.due_amount}
        currency={project.currency}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SectionCard title={`Work stages (${project.stages.filter((s) => s.status === 'done').length}/${project.stages.length} done)`}>
            <StageEditor
              stages={project.stages}
              approvals={project.approvals}
              onSave={saveStages}
              onReset={resetStages}
              onRequestApproval={setApprovalStage}
            />
          </SectionCard>

          <SectionCard
            title="Payments"
            action={
              <Button size="sm" className="gap-1.5" onClick={() => setPaymentModal({ open: true, payment: null })}>
                <Plus className="size-3.5" /> Record payment
              </Button>
            }
          >
            <PaymentsTable
              payments={project.payments}
              onEdit={(p) => setPaymentModal({ open: true, payment: p })}
              onDelete={deletePayment}
              onReceipt={setReceiptPayment}
            />
          </SectionCard>

          <SectionCard title={`Files (${project.files.length})`}>
            <FileVault projectId={project.id} files={project.files} onChanged={refetch} />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Details">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {details.map((d) => (
                <div key={d.label}>
                  <dt className="text-muted-foreground text-xs">{d.label}</dt>
                  <dd className="font-medium">{d.value}</dd>
                </div>
              ))}
            </dl>
            {(project.live_url || project.staging_url) && (
              <div className="mt-4 flex flex-col gap-1.5 text-sm">
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1.5 hover:underline">
                    <ExternalLink className="size-3.5" /> Live site
                  </a>
                )}
                {project.staging_url && (
                  <a href={project.staging_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1.5 hover:underline">
                    <ExternalLink className="size-3.5" /> Preview link
                  </a>
                )}
              </div>
            )}
            {project.description && (
              <p className="text-muted-foreground mt-4 text-sm whitespace-pre-wrap">{project.description}</p>
            )}
            {project.client_note && (
              <div className="mt-4 rounded-lg bg-blue-500/10 px-3 py-2 text-xs">
                <p className="mb-0.5 inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
                  <Eye className="size-3" /> Message shown to client
                </p>
                <p className="whitespace-pre-wrap">{project.client_note}</p>
              </div>
            )}
            {project.internal_notes && (
              <div className="bg-secondary/60 mt-3 rounded-lg px-3 py-2 text-xs">
                <p className="mb-0.5 font-semibold">Internal notes</p>
                <p className="whitespace-pre-wrap">{project.internal_notes}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Updates & history">
            <div className="flex flex-col gap-4">
              <UpdateComposer projectId={project.id} onPosted={refetch} />
              <ActivityFeed items={project.activity} onDelete={deleteActivity} />
            </div>
          </SectionCard>
        </div>
      </div>

      <ProjectFormModal open={editing} onClose={() => setEditing(false)} project={project} onSaved={refetch} />
      <PaymentFormModal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, payment: null })}
        payment={paymentModal.payment}
        project={project}
        onSaved={refetch}
      />
      <RequestApprovalModal stage={approvalStage} onClose={() => setApprovalStage(null)} onSend={requestApproval} />
      <ReceiptModal
        open={receiptPayment !== null}
        onClose={() => setReceiptPayment(null)}
        payment={receiptPayment}
        context={{ clientName: project.client_name, clientCompany: project.client_company, projectTitle: project.title }}
      />
    </div>
  )
}

function RequestApprovalModal({
  stage,
  onClose,
  onSend,
}: {
  stage: ProjectStage | null
  onClose: () => void
  onSend: (message: string) => Promise<void>
}) {
  const [message, setMessage] = React.useState('')
  const [sending, setSending] = React.useState(false)

  React.useEffect(() => {
    if (stage) setMessage('')
  }, [stage])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await onSend(message)
    setSending(false)
  }

  return (
    <Modal
      open={stage !== null}
      onClose={onClose}
      title="Request client approval"
      description={stage ? `Stage: ${stage.name}` : undefined}
      className="max-w-md"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AreaField
          label="Message to client (optional)"
          rows={3}
          placeholder="e.g. “Homepage design is ready — please review and approve.”"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          The client will see an "Approve" / "Request changes" card on their dashboard for this stage.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={sending} className="gap-2">
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
