import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FolderKanban, Globe, Mail, MapPin, MessageCircle, Pencil, Phone, Plus, Trash2 } from 'lucide-react'

import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { EmptyState, MoneySummary, Pill, SectionCard } from '@/components/crm/bits'
import { ClientFormModal } from '@/components/crm/ClientFormModal'
import { PaymentFormModal } from '@/components/crm/PaymentFormModal'
import { PaymentsTable } from '@/components/crm/PaymentsTable'
import { PortalAccessCard } from '@/components/crm/PortalAccessCard'
import { ProjectCard } from '@/components/crm/ProjectCard'
import { ProjectFormModal } from '@/components/crm/ProjectFormModal'
import { UpdateComposer } from '@/components/crm/UpdateComposer'
import { Button } from '@/components/ui/button'
import { useApiResource } from '@/hooks/use-api-resource'
import { useToast } from '@/hooks/use-toast'
import { apiDelete, errorMessage } from '@/lib/apiClient'
import { clientStatusMeta, formatDate } from '@/lib/crm'
import type { CrmClientDetail, CrmPayment } from '@/types/crm'

export function ClientDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: client, loading, error, refetch } = useApiResource<CrmClientDetail>(`/crm/clients/${id}`)
  const [editing, setEditing] = React.useState(false)
  const [addingProject, setAddingProject] = React.useState(false)
  const [paymentModal, setPaymentModal] = React.useState<{ open: boolean; payment: CrmPayment | null }>({
    open: false,
    payment: null,
  })

  if (loading && !client) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (error || !client) return <p className="text-destructive text-sm">{error ?? 'Client not found.'}</p>

  const remove = async () => {
    if (!window.confirm(`Delete ${client.name}? All of their projects, payments and history will be deleted too.`)) return
    try {
      await apiDelete(`/crm/clients/${client.id}`)
      toast({ title: 'Client deleted' })
      navigate('/admin/crm/clients')
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

  const deleteActivity = async (activityId: string) => {
    try {
      await apiDelete(`/crm/activity/${activityId}`)
      refetch()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not delete', description: errorMessage(err) })
    }
  }

  const contacts = [
    client.phone && { icon: Phone, label: client.phone, href: `tel:${client.phone}` },
    client.whatsapp && {
      icon: MessageCircle,
      label: `WhatsApp ${client.whatsapp}`,
      href: `https://wa.me/${client.whatsapp.replace(/\D/g, '')}`,
    },
    client.email && { icon: Mail, label: client.email, href: `mailto:${client.email}` },
    client.website && { icon: Globe, label: client.website.replace(/^https?:\/\//, ''), href: client.website },
    client.address && { icon: MapPin, label: client.address, href: undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string }[]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/crm/clients" className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" /> All clients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl text-2xl font-bold">
            {client.name.trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{client.name}</h1>
              <Pill meta={clientStatusMeta[client.status]} />
            </div>
            <p className="text-muted-foreground text-sm">
              {[client.company, client.industry].filter(Boolean).join(' · ') || 'No company added'}
              {' · '}client since {formatDate(client.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setEditing(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete client" onClick={remove}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <MoneySummary total={client.total_value} paid={client.paid_amount} due={client.due_amount} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SectionCard
            title={`Projects (${client.projects.length})`}
            action={
              <Button size="sm" className="gap-1.5" onClick={() => setAddingProject(true)}>
                <Plus className="size-3.5" /> New project
              </Button>
            }
          >
            {client.projects.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No projects for this client yet" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {client.projects.map((p) => (
                  <ProjectCard key={p.id} project={p} showClient={false} />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Payments"
            action={
              client.projects.length > 0 && (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPaymentModal({ open: true, payment: null })}>
                  <Plus className="size-3.5" /> Record payment
                </Button>
              )
            }
          >
            <PaymentsTable
              payments={client.payments}
              showProject
              onEdit={(p) => setPaymentModal({ open: true, payment: p })}
              onDelete={deletePayment}
            />
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Contact">
            {contacts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No contact details yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5 text-sm">
                {contacts.map((c) => (
                  <li key={c.label} className="flex items-start gap-2.5">
                    <c.icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer" className="hover:text-primary break-all">
                        {c.label}
                      </a>
                    ) : (
                      <span className="whitespace-pre-wrap">{c.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {client.source && <p className="text-muted-foreground mt-3 text-xs">Source: {client.source}</p>}
            {client.notes && (
              <p className="bg-secondary/60 mt-3 rounded-lg px-3 py-2 text-xs whitespace-pre-wrap">{client.notes}</p>
            )}
          </SectionCard>

          <PortalAccessCard client={client} onChanged={refetch} />

          <SectionCard title="Activity">
            <div className="flex flex-col gap-4">
              <UpdateComposer clientId={client.id} onPosted={refetch} />
              <ActivityFeed items={client.activity} onDelete={deleteActivity} />
            </div>
          </SectionCard>
        </div>
      </div>

      <ClientFormModal open={editing} onClose={() => setEditing(false)} client={client} onSaved={refetch} />
      <ProjectFormModal
        open={addingProject}
        onClose={() => setAddingProject(false)}
        clientId={client.id}
        onSaved={(p) => navigate(`/admin/crm/projects/${p.id}`)}
      />
      <PaymentFormModal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, payment: null })}
        payment={paymentModal.payment}
        clientId={client.id}
        onSaved={refetch}
      />
    </div>
  )
}
