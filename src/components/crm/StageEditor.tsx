import * as React from 'react'
import { ArrowDown, ArrowUp, Check, Loader2, MessageSquarePlus, Plus, RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { stageStatusMeta } from '@/lib/crm'
import { cn } from '@/lib/utils'
import { STAGE_STATUSES } from '@/types/crm'
import type { ProjectStage, StageStatus } from '@/types/crm'

const STATUS_BUTTON: Record<StageStatus, string> = {
  pending: 'data-[on=true]:bg-secondary data-[on=true]:text-foreground',
  running: 'data-[on=true]:bg-blue-500 data-[on=true]:text-white',
  done: 'data-[on=true]:bg-emerald-500 data-[on=true]:text-white',
  hold: 'data-[on=true]:bg-amber-500 data-[on=true]:text-white',
  skipped: 'data-[on=true]:bg-muted-foreground/70 data-[on=true]:text-white',
}

function newId() {
  return Math.random().toString(36).slice(2, 12)
}

export function StageEditor({
  stages,
  onSave,
  onReset,
}: {
  stages: ProjectStage[]
  /** Persists the full stage list; resolves false if the save failed. */
  onSave: (stages: ProjectStage[]) => Promise<boolean>
  onReset: () => void
}) {
  const [local, setLocal] = React.useState(stages)
  const [saving, setSaving] = React.useState(false)
  const [noteOpen, setNoteOpen] = React.useState<string | null>(null)
  const [newStage, setNewStage] = React.useState('')

  React.useEffect(() => setLocal(stages), [stages])

  const commit = async (next: ProjectStage[]) => {
    const prev = local
    setLocal(next)
    setSaving(true)
    const ok = await onSave(next)
    setSaving(false)
    if (!ok) setLocal(prev)
  }

  const patch = (id: string, changes: Partial<ProjectStage>) =>
    local.map((s) => (s.id === id ? { ...s, ...changes } : s))

  const move = (index: number, dir: -1 | 1) => {
    const next = [...local]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }

  const addStage = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newStage.trim()
    if (!name) return
    setNewStage('')
    commit([
      ...local,
      { id: newId(), name, status: 'pending', started_at: null, completed_at: null, note: null },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          Click a status to update a stage — it saves instantly and shows on the client's dashboard.
        </p>
        {saving ? (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Loader2 className="size-3.5 animate-spin" /> Saving
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5" /> Saved
          </span>
        )}
      </div>

      <ol className="flex flex-col gap-2">
        {local.map((stage, i) => (
          <li
            key={stage.id}
            className={cn(
              'border-border rounded-xl border p-3 transition-colors',
              stage.status === 'running' && 'border-blue-500/40 bg-blue-500/5',
              stage.status === 'hold' && 'border-amber-500/40 bg-amber-500/5',
              stage.status === 'done' && 'bg-emerald-500/5',
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  stage.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground',
                )}
              >
                {stage.status === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <input
                aria-label="Stage name"
                title={stage.name}
                defaultValue={stage.name}
                key={`${stage.id}-${stage.name}`}
                onBlur={(e) => {
                  const name = e.target.value.trim()
                  if (name && name !== stage.name) commit(patch(stage.id, { name }))
                  else e.target.value = stage.name
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                className={cn(
                  'hover:border-border focus:border-ring min-w-48 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium outline-none',
                  stage.status === 'skipped' && 'text-muted-foreground line-through',
                )}
              />
              <div className="bg-secondary/60 flex flex-wrap rounded-lg p-0.5" role="group" aria-label={`${stage.name} status`}>
                {STAGE_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-on={stage.status === s}
                    aria-pressed={stage.status === s}
                    onClick={() => stage.status !== s && commit(patch(stage.id, { status: s }))}
                    className={cn(
                      'text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-xs font-medium transition-colors',
                      STATUS_BUTTON[s],
                    )}
                  >
                    {stageStatusMeta[s].label.replace('Skipped', 'Skip')}
                  </button>
                ))}
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="Add note"
                  onClick={() => setNoteOpen(noteOpen === stage.id ? null : stage.id)}
                  className={cn('text-muted-foreground hover:text-foreground rounded p-1.5', stage.note && 'text-primary')}
                >
                  <MessageSquarePlus className="size-4" />
                </button>
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground rounded p-1.5 disabled:opacity-30">
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={i === local.length - 1}
                  onClick={() => move(i, 1)}
                  className="text-muted-foreground hover:text-foreground rounded p-1.5 disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove stage"
                  onClick={() => window.confirm(`Remove stage "${stage.name}"?`) && commit(local.filter((s) => s.id !== stage.id))}
                  className="text-muted-foreground hover:text-destructive rounded p-1.5"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {(noteOpen === stage.id || stage.note) && (
              <div className="mt-2 pl-10">
                <input
                  aria-label="Stage note"
                  placeholder="Note for the client, e.g. “Waiting for your logo files”"
                  defaultValue={stage.note ?? ''}
                  key={`${stage.id}-note-${stage.note ?? ''}`}
                  autoFocus={noteOpen === stage.id && !stage.note}
                  onBlur={(e) => {
                    const note = e.target.value.trim() || null
                    if (note !== stage.note) commit(patch(stage.id, { note }))
                    if (!note) setNoteOpen(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                  }}
                  className="border-border bg-background focus:border-ring w-full rounded-lg border px-3 py-1.5 text-xs outline-none"
                />
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2 sm:flex-row">
        <form onSubmit={addStage} className="flex flex-1 gap-2">
          <Input placeholder="Add a custom stage, e.g. “Domain & hosting setup”" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
          <Button type="submit" variant="outline" className="gap-1.5" disabled={!newStage.trim()}>
            <Plus className="size-4" /> Add
          </Button>
        </form>
        <Button type="button" variant="ghost" className="gap-1.5" onClick={onReset}>
          <RotateCcw className="size-4" /> Reset to template
        </Button>
      </div>
    </div>
  )
}
