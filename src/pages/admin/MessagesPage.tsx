import { Mail, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import type { ContactSubmission } from '@/types'

export function MessagesPage() {
  const { rows, loading, refetch } = useAdminTable<ContactSubmission>('contact_submissions')
  const { toast } = useToast()

  const remove = async (id: string) => {
    if (!supabase || !window.confirm('Delete this message?')) return
    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
      if (error) {
        toast({ variant: 'destructive', title: 'Could not delete', description: error.message })
        return
      }
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not delete',
        description: err instanceof Error ? err.message : 'Could not reach the server.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everything submitted through the contact form, newest first.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border p-12 text-center">
          <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Mail className="size-6" />
          </span>
          <p className="text-muted-foreground text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((m) => (
            <div key={m.id} className="border-border bg-card rounded-xl border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{m.subject}</p>
                  <p className="text-muted-foreground text-xs">
                    {m.name} &middot;{' '}
                    <a href={`mailto:${m.email}`} className="hover:text-primary">
                      {m.email}
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => remove(m.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
