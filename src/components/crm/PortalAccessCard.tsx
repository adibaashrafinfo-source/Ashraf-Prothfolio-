import * as React from 'react'
import { Copy, KeyRound, Loader2, ShieldCheck, ShieldOff, Wand2 } from 'lucide-react'

import { SectionCard } from '@/components/crm/bits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { apiPut, errorMessage } from '@/lib/apiClient'
import { formatDateTime, generatePassword } from '@/lib/crm'
import type { CrmClient } from '@/types/crm'

export function PortalAccessCard({ client, onChanged }: { client: CrmClient; onChanged: () => void }) {
  const { toast } = useToast()
  const [password, setPassword] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [shared, setShared] = React.useState<string | null>(null)
  const loginUrl = `${window.location.origin}/client/login`

  const save = async (enabled: boolean) => {
    setSaving(true)
    try {
      await apiPut(`/crm/clients/${client.id}/portal`, { enabled, password })
      if (password) setShared(password)
      setPassword('')
      toast({ title: enabled ? 'Client portal access saved' : 'Client portal access turned off' })
      onChanged()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not update portal access', description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const copyCredentials = async () => {
    const text = `Your project dashboard\nLogin: ${loginUrl}\nEmail: ${client.email}\nPassword: ${shared ?? '(the password we shared earlier)'}`
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: 'Login details copied — paste them into WhatsApp or email' })
    } catch {
      toast({ variant: 'destructive', title: 'Could not copy', description: text })
    }
  }

  return (
    <SectionCard
      title="Client dashboard access"
      action={
        client.portal_enabled ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" /> Enabled
          </span>
        ) : (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-semibold">
            <ShieldOff className="size-4" /> Off
          </span>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          The client signs in at <span className="text-foreground font-medium">{loginUrl}</span> with their email to track
          project stages and payments.
        </p>
        {!client.email ? (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            Add an email address to this client to enable their dashboard.
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="pl-9 font-mono"
                  placeholder={client.has_password ? 'New password (optional)' : 'Set a password (min 8)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" size="icon" aria-label="Generate password" onClick={() => setPassword(generatePassword())}>
                <Wand2 className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={saving} onClick={() => save(true)} className="gap-2">
                {saving && <Loader2 className="size-4 animate-spin" />}
                {client.portal_enabled ? (password ? 'Update password' : 'Save') : 'Enable dashboard'}
              </Button>
              {client.portal_enabled && (
                <>
                  <Button size="sm" variant="outline" className="gap-2" onClick={copyCredentials}>
                    <Copy className="size-3.5" />
                    Copy login details
                  </Button>
                  <Button size="sm" variant="ghost" disabled={saving} onClick={() => save(false)}>
                    Turn off
                  </Button>
                </>
              )}
            </div>
            {shared && (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                Password set to <span className="font-mono font-semibold">{shared}</span> — copy the login details now; it
                won't be shown again.
              </p>
            )}
            {client.last_login_at && (
              <p className="text-muted-foreground text-xs">Last signed in {formatDateTime(client.last_login_at)}</p>
            )}
          </>
        )}
      </div>
    </SectionCard>
  )
}
