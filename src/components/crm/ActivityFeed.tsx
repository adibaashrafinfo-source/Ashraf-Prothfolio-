import { CreditCard, Eye, FolderKanban, Layers, MessageSquare, Trash2, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatDateTime } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { CrmActivity } from '@/types/crm'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  payment: CreditCard,
  stage: Layers,
  status: FolderKanban,
  project: FolderKanban,
  client: UserPlus,
  note: MessageSquare,
}

export function ActivityFeed({
  items,
  onDelete,
  showContext = false,
  empty = 'No activity yet.',
}: {
  items: CrmActivity[]
  onDelete?: (id: string) => void
  showContext?: boolean
  empty?: string
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{empty}</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((a) => {
        const Icon = ICONS[a.type] ?? MessageSquare
        return (
          <li key={a.id} className="group flex gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                a.type === 'payment'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">{a.message}</p>
              <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                <span>{formatDateTime(a.created_at)}</span>
                {showContext && a.client_name && a.client_id && (
                  <Link to={`/admin/crm/clients/${a.client_id}`} className="hover:text-primary">
                    {a.client_name}
                  </Link>
                )}
                {a.visible_to_client !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" />
                    {a.visible_to_client ? 'Client can see' : 'Internal'}
                  </span>
                )}
              </p>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                aria-label="Delete update"
                className="text-muted-foreground hover:text-destructive self-start rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
