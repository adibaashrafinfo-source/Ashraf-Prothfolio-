import * as React from 'react'
import { CheckCircle2, Loader2, MessageSquareWarning, ThumbsDown, ThumbsUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { errorMessage, portalPut } from '@/lib/apiClient'
import type { StageApproval } from '@/types/crm'

/** Action card shown on the client dashboard for a stage awaiting their sign-off. */
export function ClientApprovalCard({ approval, onResolved }: { approval: StageApproval; onResolved: () => void }) {
  const { toast } = useToast()
  const [declining, setDeclining] = React.useState(false)
  const [comment, setComment] = React.useState('')
  const [sending, setSending] = React.useState<'approved' | 'changes_requested' | null>(null)

  const respond = async (status: 'approved' | 'changes_requested') => {
    if (status === 'changes_requested' && !comment.trim()) {
      setDeclining(true)
      return
    }
    setSending(status)
    try {
      await portalPut(`/approvals/${approval.id}`, { status, comment: comment.trim() || undefined })
      toast({ title: status === 'approved' ? 'Approved — thank you!' : 'Change request sent' })
      onResolved()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not send your response', description: errorMessage(err) })
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="border-primary/30 bg-primary/5 flex flex-col gap-3 rounded-2xl border-2 p-5">
      <div className="flex items-start gap-3">
        <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
          <CheckCircle2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-bold">Your review needed: {approval.stage_name}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {approval.message || 'Please check this stage and let us know if it looks good.'}
          </p>
        </div>
      </div>

      {declining && (
        <Textarea
          autoFocus
          rows={2}
          placeholder="What should we change?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={sending !== null} className="gap-2" onClick={() => respond('approved')}>
          {sending === 'approved' ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp className="size-4" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={sending !== null}
          className="gap-2"
          onClick={() => (declining ? respond('changes_requested') : setDeclining(true))}
        >
          {sending === 'changes_requested' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : declining ? (
            <MessageSquareWarning className="size-4" />
          ) : (
            <ThumbsDown className="size-4" />
          )}
          {declining ? 'Send change request' : 'Request changes'}
        </Button>
      </div>
    </div>
  )
}
