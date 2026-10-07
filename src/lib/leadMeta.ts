import type { LeadStatus } from '@/types'

export const leadStatusMeta: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  contacted: { label: 'Contacted', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  in_progress: {
    label: 'In progress',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  converted: {
    label: 'Converted',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  important: { label: 'Important', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

export const CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP', 'INR'] as const

const SYMBOLS: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
}

export function formatMoney(amount: number | null | undefined, currency = 'BDT') {
  if (amount == null) return '—'
  const symbol = SYMBOLS[currency] ?? ''
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}
