import { Check, Circle, Pause, SkipForward } from 'lucide-react'

import { formatDate, stageStatusMeta } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { ProjectStage } from '@/types/crm'

/** Thin segmented bar — one segment per stage — for compact project cards. */
export function StageStrip({ stages, className }: { stages: ProjectStage[]; className?: string }) {
  if (stages.length === 0) return null
  return (
    <div className={cn('flex gap-1', className)} aria-hidden>
      {stages.map((s) => (
        <span
          key={s.id}
          title={`${s.name}: ${stageStatusMeta[s.status].label}`}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            stageStatusMeta[s.status].dot,
            s.status === 'running' && 'animate-pulse',
          )}
        />
      ))}
    </div>
  )
}

function StageIcon({ status }: { status: ProjectStage['status'] }) {
  const base = 'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2'
  switch (status) {
    case 'done':
      return (
        <span className={cn(base, 'border-emerald-500 bg-emerald-500 text-white')}>
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )
    case 'running':
      return (
        <span className={cn(base, 'border-blue-500 bg-blue-500/10 text-blue-500')}>
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
          <Circle className="size-2.5 fill-current" />
        </span>
      )
    case 'hold':
      return (
        <span className={cn(base, 'border-amber-500 bg-amber-500/10 text-amber-500')}>
          <Pause className="size-3 fill-current" />
        </span>
      )
    case 'skipped':
      return (
        <span className={cn(base, 'border-border bg-muted text-muted-foreground')}>
          <SkipForward className="size-3" />
        </span>
      )
    default:
      return <span className={cn(base, 'border-border bg-card')} />
  }
}

/** Vertical step-by-step timeline (read-only) used by the client portal and project overviews. */
export function StageTimeline({ stages }: { stages: ProjectStage[] }) {
  if (stages.length === 0) {
    return <p className="text-muted-foreground text-sm">No stages defined yet.</p>
  }
  return (
    <ol className="flex flex-col">
      {stages.map((s, i) => {
        const last = i === stages.length - 1
        const meta = stageStatusMeta[s.status]
        return (
          <li key={s.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-7 left-3.5 -ml-px h-[calc(100%-1.75rem)] w-0.5',
                  s.status === 'done' ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            )}
            <StageIcon status={s.status} />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    'text-sm font-medium',
                    s.status === 'pending' && 'text-muted-foreground',
                    s.status === 'skipped' && 'text-muted-foreground line-through',
                  )}
                >
                  {s.name}
                </p>
                {s.status !== 'pending' && (
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', meta.className)}>
                    {s.status === 'running' ? 'In progress' : meta.label}
                  </span>
                )}
              </div>
              {(s.started_at || s.completed_at) && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {s.completed_at
                    ? `Completed ${formatDate(s.completed_at)}`
                    : `Started ${formatDate(s.started_at)}`}
                </p>
              )}
              {s.note && (
                <p className="bg-secondary/60 text-foreground/80 mt-1.5 rounded-lg px-3 py-2 text-xs">
                  {s.note}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
