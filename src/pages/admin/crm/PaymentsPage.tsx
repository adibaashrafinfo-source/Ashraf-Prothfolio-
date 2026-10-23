import * as React from 'react'
import { ArrowDownLeft, ArrowUpRight, Download, Plus, Receipt, Wallet } from 'lucide-react'

import { SectionCard, StatCard } from '@/components/crm/bits'
import { PaymentFormModal } from '@/components/crm/PaymentFormModal'
import { PaymentsTable } from '@/components/crm/PaymentsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { apiDelete, errorMessage } from '@/lib/apiClient'
import { todayISO } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import type { CrmPayment } from '@/types/crm'

function monthRange(month: string) {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` }
}

function csvCell(v: unknown) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function PaymentsPage() {
  const { toast } = useToast()
  const [month, setMonth] = React.useState(todayISO().slice(0, 7))
  const { from, to } = monthRange(month)
  const { rows, loading, error, refetch } = useAdminTable<CrmPayment>(`/crm/payments?from=${from}&to=${to}`)
  const [modal, setModal] = React.useState<{ open: boolean; payment: CrmPayment | null }>({ open: false, payment: null })

  const received = rows.filter((p) => p.type !== 'refund').reduce((s, p) => s + p.amount, 0)
  const refunds = rows.filter((p) => p.type === 'refund').reduce((s, p) => s + p.amount, 0)
  const advance = rows.filter((p) => p.type === 'advance').reduce((s, p) => s + p.amount, 0)

  const byMethod = Object.entries(
    rows
      .filter((p) => p.type !== 'refund')
      .reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.method]: (acc[p.method] ?? 0) + p.amount }), {}),
  ).sort((a, b) => b[1] - a[1])
  const maxMethod = byMethod[0]?.[1] ?? 0

  const remove = async (p: CrmPayment) => {
    if (!window.confirm('Delete this payment record?')) return
    try {
      await apiDelete(`/crm/payments/${p.id}`)
      refetch()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not delete', description: errorMessage(err) })
    }
  }

  const exportCsv = () => {
    const header = ['Date', 'Client', 'Project', 'Type', 'Method', 'Reference', 'Amount', 'Currency', 'Note']
    const lines = rows.map((p) =>
      [p.paid_at, p.client_name, p.project_title, p.type, p.method, p.reference, p.type === 'refund' ? -p.amount : p.amount, p.currency, p.note]
        .map(csvCell)
        .join(','),
    )
    const blob = new Blob(['﻿' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1 text-sm">Every payment received from clients, month by month.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="month" aria-label="Month" className="w-44" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
          <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="size-4" /> CSV
          </Button>
          <Button className="gap-2" onClick={() => setModal({ open: true, payment: null })}>
            <Plus className="size-4" /> Record payment
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} tone="good" label="Net collected" value={formatMoney(received - refunds)} />
        <StatCard icon={ArrowDownLeft} label="Received" value={formatMoney(received)} hint={`${rows.filter((p) => p.type !== 'refund').length} payments`} />
        <StatCard icon={Receipt} label="Advances" value={formatMoney(advance)} />
        <StatCard icon={ArrowUpRight} tone={refunds ? 'bad' : 'default'} label="Refunds" value={formatMoney(refunds)} />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Ledger" className="lg:col-span-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : (
            <PaymentsTable
              payments={rows}
              showClient
              showProject
              onEdit={(p) => setModal({ open: true, payment: p })}
              onDelete={remove}
              empty="No payments recorded in this month."
            />
          )}
        </SectionCard>

        <SectionCard title="By payment method">
          {byMethod.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nothing received this month yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {byMethod.map(([method, amount]) => (
                <li key={method}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{method}</span>
                    <span className="font-semibold">{formatMoney(amount)}</span>
                  </div>
                  <div className="bg-secondary h-2 overflow-hidden rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${(amount / maxMethod) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <PaymentFormModal
        open={modal.open}
        onClose={() => setModal({ open: false, payment: null })}
        payment={modal.payment}
        onSaved={refetch}
      />
    </div>
  )
}
