import * as React from 'react'

import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'

export function Pill({ meta, className }: { meta: { label: string; className: string }; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('bg-secondary h-2 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn('h-full rounded-full transition-all', clamped === 100 ? 'bg-emerald-500' : 'bg-primary')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'good' | 'warn' | 'bad'
}) {
  const toneClass = {
    default: 'bg-primary/10 text-primary',
    good: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warn: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    bad: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }[tone]
  return (
    <div className="border-border bg-card flex items-start gap-3 rounded-xl border p-4">
      {Icon && (
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="size-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-display mt-0.5 truncate text-xl font-bold">{value}</p>
        {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
      </div>
    </div>
  )
}

/** Total / paid / due strip used on clients, projects and the portal. */
export function MoneySummary({
  total,
  paid,
  due,
  advance,
  currency = 'BDT',
  className,
}: {
  total: number
  paid: number
  due: number
  advance?: number
  currency?: string
  className?: string
}) {
  const items = [
    { label: 'Total cost', value: total, className: '' },
    ...(advance !== undefined ? [{ label: 'Advance', value: advance, className: '' }] : []),
    { label: 'Paid', value: paid, className: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Due', value: due, className: due > 0 ? 'text-rose-600 dark:text-rose-400' : '' },
  ]
  return (
    <div
      className={cn(
        'border-border grid divide-x rounded-xl border',
        items.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3',
        className,
      )}
    >
      {items.map((i) => (
        <div key={i.label} className="border-border px-4 py-3">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">{i.label}</p>
          <p className={cn('font-display mt-0.5 text-lg font-bold', i.className)}>
            {formatMoney(i.value, currency)}
          </p>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
        <Icon className="size-6" />
      </span>
      <p className="font-medium">{title}</p>
      {children}
    </div>
  )
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('border-border bg-card rounded-xl border', className)}>
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
