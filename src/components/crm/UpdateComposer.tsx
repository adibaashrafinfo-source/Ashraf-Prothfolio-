import * as React from 'react'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { apiPost, errorMessage } from '@/lib/apiClient'

/** Post a manual update/note to a project or client timeline. */
export function UpdateComposer({
  projectId,
  clientId,
  onPosted,
}: {
  projectId?: string
  clientId?: string
  onPosted: () => void
}) {
  const { toast } = useToast()
  const [message, setMessage] = React.useState('')
  const [visible, setVisible] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const checkboxId = React.useId()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSaving(true)
    try {
      await apiPost('/crm/activity', {
        project_id: projectId ?? null,
        client_id: clientId ?? null,
        message,
        visible_to_client: visible,
      })
      setMessage('')
      onPosted()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not post update', description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        rows={2}
        placeholder="Post an update — e.g. “Homepage design ready for review”"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={checkboxId} className="text-muted-foreground flex items-center gap-2 text-xs">
          <input
            id={checkboxId}
            type="checkbox"
            className="accent-primary size-4"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />
          Show this update on the client's dashboard
        </label>
        <Button type="submit" size="sm" disabled={saving || !message.trim()} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
          Post update
        </Button>
      </div>
    </form>
  )
}
