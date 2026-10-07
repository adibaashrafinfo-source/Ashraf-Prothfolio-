import { Link } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  FileText,
  Mail,
  MessageSquareQuote,
  Receipt,
  Share2,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminTable } from '@/hooks/use-admin-table'
import { docTotals } from '@/lib/documents'
import { formatMoney, leadStatusMeta } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type {
  BusinessDocument,
  ClientLogo,
  Lead,
  Project,
  SocialLink,
  Testimonial,
} from '@/types'

export function Dashboard() {
  const projects = useAdminTable<Project>('/projects')
  const testimonials = useAdminTable<Testimonial>('/testimonials')
  const social = useAdminTable<SocialLink>('/social-links')
  const leads = useAdminTable<Lead>('/leads')
  const clients = useAdminTable<ClientLogo>('/client-logos')
  const documents = useAdminTable<BusinessDocument>('/documents')

  const quotations = documents.rows.filter((d) => d.kind === 'quotation')
  const invoices = documents.rows.filter((d) => d.kind === 'invoice')

  const openPipeline = leads.rows
    .filter((l) => l.status !== 'cancelled' && l.status !== 'converted')
    .reduce((sum, l) => sum + (l.project_cost ?? 0), 0)
  const invoiced = invoices.reduce((sum, d) => sum + docTotals(d).total, 0)
  const collected = invoices.reduce((sum, d) => sum + (d.paid_amount ?? 0), 0)

  const cards = [
    { key: 'leads', label: 'Leads', icon: Mail, to: '/admin/leads', value: leads.rows.length },
    {
      key: 'quotations',
      label: 'Quotations',
      icon: FileText,
      to: '/admin/quotations',
      value: quotations.length,
    },
    {
      key: 'invoices',
      label: 'Invoices',
      icon: Receipt,
      to: '/admin/invoices',
      value: invoices.length,
    },
    {
      key: 'projects',
      label: 'Portfolio Projects',
      icon: Briefcase,
      to: '/admin/portfolio',
      value: projects.rows.length,
    },
    {
      key: 'clients',
      label: 'Client Logos',
      icon: Building2,
      to: '/admin/clients',
      value: clients.rows.length,
    },
    {
      key: 'testimonials',
      label: 'Testimonials',
      icon: MessageSquareQuote,
      to: '/admin/testimonials',
      value: testimonials.rows.length,
    },
    {
      key: 'social',
      label: 'Social Links',
      icon: Share2,
      to: '/admin/social',
      value: social.rows.length,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your pipeline, documents, and site content at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-xl border p-5">
          <p className="text-muted-foreground text-xs">Open pipeline</p>
          <p className="font-display mt-1 text-2xl font-bold">{formatMoney(openPipeline)}</p>
        </div>
        <div className="border-border bg-card rounded-xl border p-5">
          <p className="text-muted-foreground text-xs">Invoiced</p>
          <p className="font-display mt-1 text-2xl font-bold">{formatMoney(invoiced)}</p>
        </div>
        <div className="border-border bg-card rounded-xl border p-5">
          <p className="text-muted-foreground text-xs">Collected</p>
          <p className="font-display mt-1 text-2xl font-bold">{formatMoney(collected)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.key} to={c.to}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                  <c.icon className="size-5" />
                </span>
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {leads.rows.length > 0 && (
        <div>
          <h2 className="font-display mb-3 text-lg font-semibold">Pipeline</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(leadStatusMeta).map(([status, meta]) => {
              const count = leads.rows.filter((l) => (l.status ?? 'new') === status).length
              if (count === 0) return null
              return (
                <span
                  key={status}
                  className={cn('rounded-full px-3 py-1 text-xs font-semibold', meta.className)}
                >
                  {meta.label} · {count}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
