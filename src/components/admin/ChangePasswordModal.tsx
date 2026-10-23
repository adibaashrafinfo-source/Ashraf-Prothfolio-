import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { PasswordInput } from '@/components/ui/password-input'
import { useToast } from '@/hooks/use-toast'
import { errorMessage } from '@/lib/apiClient'

/** Shared by the admin panel and the client portal — `save` hits the right endpoint. */
export function ChangePasswordModal({
  open,
  onClose,
  save,
}: {
  open: boolean
  onClose: () => void
  save: (body: { current_password: string; new_password: string }) => Promise<unknown>
}) {
  const { toast } = useToast()
  const [current, setCurrent] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const mismatch = confirm.length > 0 && next !== confirm

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirm) return
    setSaving(true)
    try {
      await save({ current_password: current, new_password: next })
      toast({ title: 'Password changed' })
      setCurrent('')
      setNext('')
      setConfirm('')
      onClose()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not change password', description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Change password" className="max-w-md">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cp-current">Current password</Label>
          <PasswordInput id="cp-current" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cp-new">New password (min 8 characters)</Label>
          <PasswordInput id="cp-new" autoComplete="new-password" minLength={8} required value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cp-confirm">Confirm new password</Label>
          <PasswordInput
            id="cp-confirm"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={mismatch}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && <p className="text-destructive text-xs">Passwords do not match.</p>}
        </div>
        <Button type="submit" disabled={saving || mismatch} className="gap-2">
          {saving && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </Modal>
  )
}
