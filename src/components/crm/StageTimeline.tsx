import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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

const ICON_STYLE: Record<ProjectStage['status'], string> = {
  done: 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_4px] shadow-emerald-500/15',
  running: 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_0_4px] shadow-blue-500/15',
  hold: 'border-amber-500 bg-amber-500/10 text-amber-500',
  skipped: 'border-border bg-muted text-muted-foreground',
  pending: 'border-border bg-card',
}

function StageIcon({ status, delay }: { status: ProjectStage['status']; delay: number }) {
  return (
    <span className="relative z-10 flex size-7 shrink-0 items-center justify-center">
      {status === 'running' && <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/25" />}
      <AnimatePresence mode="wait" initial={true}>
        <motion.span
          key={status}
          initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22, delay }}
          className={cn('flex size-7 items-center justify-center rounded-full border-2 transition-shadow', ICON_STYLE[status])}
        >
          {status === 'done' && <Check className="size-3.5" strokeWidth={3} />}
          {status === 'running' && <Circle className="size-2.5 fill-current" />}
          {status === 'hold' && <Pause className="size-3 fill-current" />}
          {status === 'skipped' && <SkipForward className="size-3" />}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/**
 * Vertical step-by-step timeline (read-only) for the client portal. Stages
 * cascade in on load; when a status changes while the page is open (the portal
 * polls for updates) that stage re-animates and briefly glows.
 */
export function StageTimeline({ stages }: { stages: ProjectStage[] }) {
  const reduceMotion = useReducedMotion()
  const firstRender = React.useRef(true)
  React.useEffect(() => {
    firstRender.current = false
  }, [])

  if (stages.length === 0) {
    return <p className="text-muted-foreground text-sm">No stages defined yet.</p>
  }

  const stagger = (i: number) => (reduceMotion || !firstRender.current ? 0 : 0.08 * i)

  return (
    <ol className="flex flex-col">
      {stages.map((s, i) => {
        const last = i === stages.length - 1
        const meta = stageStatusMeta[s.status]
        return (
          <motion.li
            key={s.id}
            initial={reduceMotion ? false : { opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: stagger(i) }}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {!last && (
              <span aria-hidden className="bg-border absolute top-7 left-3.5 -ml-px h-[calc(100%-1.75rem)] w-0.5 overflow-hidden rounded-full">
                <motion.span
                  className="absolute inset-0 origin-top bg-emerald-500"
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: s.status === 'done' ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut', delay: stagger(i) + 0.25 }}
                />
              </span>
            )}

            {/* Re-keyed on status so a live change replays the glow; skipped on first paint. */}
            <motion.span
              key={`${s.id}-${s.status}`}
              aria-hidden
              className="bg-primary/10 pointer-events-none absolute -inset-x-3 -top-1.5 bottom-3.5 rounded-xl"
              initial={firstRender.current || reduceMotion ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
            />

            <StageIcon status={s.status} delay={stagger(i) + 0.1} />
            <div className="relative min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors duration-500',
                    s.status === 'pending' && 'text-muted-foreground',
                    s.status === 'skipped' && 'text-muted-foreground line-through',
                  )}
                >
                  {s.name}
                </p>
                <AnimatePresence mode="wait">
                  {s.status !== 'pending' && (
                    <motion.span
                      key={s.status}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, delay: stagger(i) + 0.2 }}
                      className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', meta.className)}
                    >
                      {s.status === 'running' ? 'In progress' : meta.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.span
                  key={`upd-${s.id}-${s.status}`}
                  aria-hidden
                  className="text-primary pointer-events-none text-[10px] font-semibold"
                  initial={{ opacity: firstRender.current || reduceMotion ? 0 : 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 3 }}
                >
                  Updated
                </motion.span>
              </div>
              {(s.started_at || s.completed_at) && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {s.completed_at ? `Completed ${formatDate(s.completed_at)}` : `Started ${formatDate(s.started_at)}`}
                </p>
              )}
              {s.note && (
                <p className="bg-secondary/60 text-foreground/80 mt-1.5 rounded-lg px-3 py-2 text-xs">{s.note}</p>
              )}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
