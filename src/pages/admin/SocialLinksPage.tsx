import * as React from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { socialIconMap, socialIconOptions } from '@/lib/socialIcons'
import { supabase } from '@/lib/supabaseClient'
import type { SocialIconKey, SocialLink } from '@/types'

type FormState = { name: string; icon: SocialIconKey; href: string; sort_order: number }

const emptyForm: FormState = { name: '', icon: 'globe', href: '', sort_order: 0 }

export function SocialLinksPage() {
  const { rows, loading, refetch } = useAdminTable<SocialLink>('social_links', 'sort_order', true)
  const { toast } = useToast()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [adding, setAdding] = React.useState(false)

  const startEdit = (link: SocialLink) => {
    setEditingId(link.id)
    setForm({ name: link.name, icon: link.icon, href: link.href, sort_order: link.sort_order })
    setAdding(false)
  }

  const startAdd = () => {
    setEditingId(null)
    setForm({ ...emptyForm, sort_order: rows.length })
    setAdding(true)
  }

  const cancel = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyForm)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    try {
      const { error } = editingId
        ? await supabase.from('social_links').update(form).eq('id', editingId)
        : await supabase.from('social_links').insert(form)

      if (error) {
        toast({ variant: 'destructive', title: 'Could not save', description: error.message })
        return
      }
      toast({ title: editingId ? 'Link updated' : 'Link added' })
      cancel()
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not save',
        description: err instanceof Error ? err.message : 'Could not reach the server.',
      })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!supabase || !window.confirm('Delete this social link?')) return
    try {
      const { error } = await supabase.from('social_links').delete().eq('id', id)
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

  const showForm = adding || editingId

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Social Links</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Shown in the footer and contact section.
          </p>
        </div>
        {!showForm && (
          <Button className="gap-2" onClick={startAdd}>
            <Plus className="size-4" />
            Add link
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sl-name">Name</Label>
                <Input
                  id="sl-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sl-icon">Icon</Label>
                <select
                  id="sl-icon"
                  className="border-input h-11 rounded-lg border bg-transparent px-3 text-sm"
                  value={form.icon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, icon: e.target.value as SocialIconKey }))
                  }
                >
                  {socialIconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="sl-href">URL</Label>
                <Input
                  id="sl-href"
                  required
                  value={form.href}
                  onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sl-order">Sort order</Label>
                <Input
                  id="sl-order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-3">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingId ? 'Save changes' : 'Add link'}
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
        <p className="text-muted-foreground text-sm">No social links yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((link) => {
            const Icon = socialIconMap[link.icon]
            return (
              <div
                key={link.id}
                className="border-border bg-card flex items-center gap-3 rounded-xl border p-4"
              >
                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{link.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{link.href}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(link)}
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(link.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
