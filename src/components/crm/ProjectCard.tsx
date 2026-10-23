import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'

import { Pill, ProgressBar } from '@/components/crm/bits'
import { StageStrip } from '@/components/crm/StageTimeline'
import { deadlineLabel, isOverdue, priorityMeta, projectStatusMeta, stageStatusMeta } from '@/lib/crm'
import { formatMoney } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import type { CrmProject } from '@/types/crm'

export function ProjectCard({ project, showClient = true }: { project: CrmProject; showClient?: boolean }) {
  const overdue = isOverdue(project)
  const deadline = deadlineLabel(project)
  return (
    <Link
      to={`/admin/crm/projects/${project.id}`}
      className="border-border bg-card hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{project.title}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {showClient && <>{project.client_company || project.client_name} · </>}
            {project.service_type}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Pill meta={projectStatusMeta[project.status]} />
          {(project.priority === 'high' || project.priority === 'urgent') && (
            <Pill meta={priorityMeta[project.priority]} />
          )}
        </div>
      </div>

      {project.current_stage && project.status !== 'completed' && project.status !== 'cancelled' && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Now:</span>
          <span className="font-medium">{project.current_stage}</span>
          {project.current_stage_status && project.current_stage_status !== 'pending' && (
            <Pill meta={stageStatusMeta[project.current_stage_status]} className="text-[10px]" />
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <StageStrip stages={project.stages} />
        <div className="flex items-center gap-2">
          <ProgressBar value={project.progress} className="h-1.5" />
          <span className="text-muted-foreground w-9 text-right text-xs font-medium">{project.progress}%</span>
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>
          {formatMoney(project.total_cost, project.currency)}
          {project.due_amount > 0 && (
            <span className="text-rose-600 dark:text-rose-400"> · due {formatMoney(project.due_amount, project.currency)}</span>
          )}
        </span>
        {deadline && (
          <span className={cn('inline-flex items-center gap-1', overdue && 'font-semibold text-rose-600 dark:text-rose-400')}>
            <CalendarClock className="size-3.5" />
            {deadline}
          </span>
        )}
      </div>
    </Link>
  )
}
