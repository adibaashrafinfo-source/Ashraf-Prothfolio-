import * as React from 'react'
import { Loader2, Pencil, Plus, Star, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import type { Testimonial } from '@/types'

type FormState = {
  client_name: string
  client_role: string
  client_avatar_url: string
  message: string
  rating: number
}

const emptyForm: FormState = {
  client_name: '',
  client_role: '',
  client_avatar_url: '',
  message: '',
  rating: 5,
}

export function TestimonialsAdmin() {
  const { rows, loading, refetch } = useAdminTable<Testimonial>('testimonials')
  const { toast } = useToast()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [adding, setAdding] = React.useState(false)

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setForm({
      client_name: t.client_name,
      client_role: t.client_role,
      client_avatar_url: t.client_avatar_url ?? '',
      message: t.message,
      rating: t.rating,
    })
    setAdding(false)
  }

  const startAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
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

    const payload = {
      client_name: form.client_name,
      client_role: form.client_role,
      client_avatar_url: form.client_avatar_url || null,
      message: form.message,
      rating: form.rating,
    }

    try {
      const { error } = editingId
        ? await supabase.from('testimonials').update(payload).eq('id', editingId)
        : await supabase.from('testimonials').insert(payload)

      if (error) {
        toast({ variant: 'destructive', title: 'Could not save', description: error.message })
        return
      }
      toast({ title: editingId ? 'Testimonial updated' : 'Testimonial added' })
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
    if (!supabase || !window.confirm('Delete this testimonial?')) return
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
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
          <h1 className="font-display text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1 text-sm">Client reviews shown on the site.</p>
        </div>
        {!showForm && (
          <Button className="gap-2" onClick={startAdd}>
            <Plus className="size-4" />
            Add testimonial
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={save} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-name">Client name</Label>
                  <Input
                    id="t-name"
                    required
                    value={form.client_name}
                    onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-role">Client role / company</Label>
                  <Input
                    id="t-role"
                    required
                    value={form.client_role}
                    onChange={(e) => setForm((f) => ({ ...f, client_role: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-message">Message</Label>
                <Textarea
                  id="t-message"
                  required
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:w-48">
                <Label htmlFor="t-rating">Rating</Label>
                <select
                  id="t-rating"
                  className="border-input h-11 rounded-lg border bg-transparent px-3 text-sm"
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUploadField
                label="Avatar (optional)"
                folder="testimonials"
                value={form.client_avatar_url || null}
                onChange={(url) => setForm((f) => ({ ...f, client_avatar_url: url ?? '' }))}
                aspectClassName="aspect-square max-w-32"
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingId ? 'Save changes' : 'Add testimonial'}
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
        <p className="text-muted-foreground text-sm">No testimonials yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((t) => (
            <div
              key={t.id}
              className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start"
            >
              <div className="min-w-0 flex-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-3.5',
                        i < t.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30',
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm">{t.message}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {t.client_name} — {t.client_role}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => startEdit(t)}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => remove(t.id)}>
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
