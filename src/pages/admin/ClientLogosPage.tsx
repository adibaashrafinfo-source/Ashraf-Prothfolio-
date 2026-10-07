import * as React from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/apiClient'
import type { ClientLogo } from '@/types'

type FormState = {
  name: string
  logo_url: string
  website_url: string
  sort_order: string
}

const emptyForm: FormState = { name: '', logo_url: '', website_url: '', sort_order: '0' }

export function ClientLogosPage() {
  const { rows, loading, refetch } = useAdminTable<ClientLogo>('/client-logos')
  const { toast } = useToast()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [adding, setAdding] = React.useState(false)

  const startEdit = (logo: ClientLogo) => {
    setEditingId(logo.id)
    setForm({
      name: logo.name,
      logo_url: logo.logo_url,
      website_url: logo.website_url ?? '',
      sort_order: String(logo.sort_order),
    })
    setAdding(false)
  }

  const cancel = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyForm)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.logo_url) {
      toast({
        variant: 'destructive',
        title: 'Logo required',
        description: 'Upload the client logo first.',
      })
      return
    }
    setSaving(true)

    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      website_url: form.website_url || null,
      sort_order: Number(form.sort_order) || 0,
    }

    try {
      if (editingId) {
        await apiPut(`/client-logos/${editingId}`, payload)
      } else {
        await apiPost('/client-logos', payload)
      }
      toast({ title: editingId ? 'Logo updated' : 'Logo added' })
      cancel()
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not save',
        description: err instanceof ApiError ? err.message : 'Could not reach the server.',
      })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this client logo?')) return
    try {
      await apiDelete(`/client-logos/${id}`)
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not delete',
        description: err instanceof ApiError ? err.message : 'Could not reach the server.',
      })
    }
  }

  const showForm = adding || editingId

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Client Logos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Shown in the scrolling strip under the hero. Upload any size — each logo is fitted
            into the strip whole, in its original colors.
          </p>
        </div>
        {!showForm && (
          <Button
            className="gap-2"
            onClick={() => {
              setEditingId(null)
              setForm({ ...emptyForm, sort_order: String(rows.length) })
              setAdding(true)
            }}
          >
            <Plus className="size-4" />
            Add logo
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={save} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-name">Client name</Label>
                  <Input
                    id="cl-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-order">Sort order</Label>
                  <Input
                    id="cl-order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cl-url">Client website (optional)</Label>
                <Input
                  id="cl-url"
                  placeholder="https://example.com"
                  value={form.website_url}
                  onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                />
              </div>

              <ImageUploadField
                label="Logo (PNG with transparent background works best)"
                folder="client-logos"
                value={form.logo_url || null}
                onChange={(url) => setForm((f) => ({ ...f, logo_url: url ?? '' }))}
                aspectClassName="aspect-[2/1]"
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingId ? 'Save changes' : 'Add logo'}
                </Button>
                <Button type="button" variant="outline" onClick={cancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No client logos yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((logo) => (
            <div key={logo.id} className="border-border bg-card rounded-xl border p-4">
              <div className="bg-secondary/30 flex h-24 items-center justify-center rounded-lg px-4">
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  className="max-h-14 w-auto max-w-full object-contain"
                />
              </div>
              <p className="mt-3 text-sm font-semibold">{logo.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {logo.website_url ?? 'No link'} · order {logo.sort_order}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => startEdit(logo)}>
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => remove(logo.id)}>
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
