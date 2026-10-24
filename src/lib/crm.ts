import type {
  ApprovalStatus,
  CrmClientStatus,
  CrmProject,
  PaymentType,
  Priority,
  ProjectStatus,
  StageStatus,
} from '@/types/crm'

/** Must match the keys of CRM_STAGE_TEMPLATES in server-php/routes/crm.php. */
export const SERVICE_TYPES = [
  'Website Development',
  'E-Commerce Website',
  'Web Application / SaaS',
  'Mobile App Development',
  'SEO',
  'Digital Marketing',
  'Social Media Management',
  'Graphics Design',
  'Branding',
  'Other',
] as const

export const PAYMENT_METHODS = [
  'Cash',
  'bKash',
  'Nagad',
  'Rocket',
  'Bank Transfer',
  'Card',
  'Cheque',
  'Other',
] as const

type Meta = { label: string; className: string }

export const projectStatusMeta: Record<ProjectStatus, Meta> = {
  not_started: { label: 'Not started', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-300' },
  running: { label: 'Running', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  on_hold: { label: 'On hold', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  review: { label: 'In review', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
}

export const stageStatusMeta: Record<StageStatus, Meta & { dot: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground', dot: 'bg-border' },
  running: { label: 'Running', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  done: { label: 'Done', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  hold: { label: 'Hold', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  skipped: { label: 'Skipped', className: 'bg-muted text-muted-foreground line-through', dot: 'bg-muted-foreground/40' },
}

export const priorityMeta: Record<Priority, Meta> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  high: { label: 'High', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  urgent: { label: 'Urgent', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

export const clientStatusMeta: Record<CrmClientStatus, Meta> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  prospect: { label: 'Prospect', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
}

export const paymentTypeMeta: Record<PaymentType, Meta> = {
  advance: { label: 'Advance', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  installment: { label: 'Installment', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  final: { label: 'Final', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  refund: { label: 'Refund', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

export const OPEN_STATUSES: ProjectStatus[] = ['not_started', 'running', 'on_hold', 'review']

/** Local YYYY-MM-DD (not UTC), so "today" matches the admin's calendar. */
export function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Whole days until a YYYY-MM-DD date; negative once it has passed. */
export function daysUntil(date: string | null): number | null {
  if (!date) return null
  const target = new Date(`${date}T00:00:00`).getTime()
  const today = new Date(`${todayISO()}T00:00:00`).getTime()
  return Math.round((target - today) / 86_400_000)
}

export function isOverdue(project: CrmProject): boolean {
  const days = daysUntil(project.deadline)
  return days !== null && days < 0 && OPEN_STATUSES.includes(project.status)
}

export function deadlineLabel(project: CrmProject): string | null {
  const days = daysUntil(project.deadline)
  if (days === null || !OPEN_STATUSES.includes(project.status)) return null
  if (days < 0) return `${-days}d overdue`
  if (days === 0) return 'Due today'
  return `${days}d left`
}

export const approvalStatusMeta: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: 'Awaiting client', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  changes_requested: { label: 'Changes requested', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileExt(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE'
}

export function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint32Array(10)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}
