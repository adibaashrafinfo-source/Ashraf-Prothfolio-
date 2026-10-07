import * as React from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAdminTable } from '@/hooks/use-admin-table'
import { useToast } from '@/hooks/use-toast'
import { ApiError, apiDelete, apiPost, apiPut } from '@/lib/apiClient'
import { projectThumbnail } from '@/lib/siteThumbnail'
import { PROJECT_CATEGORIES } from '@/types'
import type { Project, ProjectCategory } from '@/types'

type FormState = {
  title: string
  category: ProjectCategory
  description: string
  image_url: string
  project_url: string
}

const emptyForm: FormState = {
  title: '',
  category: 'E-Commerce',
  description: '',
  image_url: '',
  project_url: '',
}

export function PortfolioAdmin() {
  const { rows, loading, refetch } = useAdminTable<Project>('/projects')
  const { toast } = useToast()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [adding, setAdding] = React.useState(false)

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      image_url: project.image_url,
      project_url: project.project_url ?? '',
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
    if (!form.image_url && !form.project_url) {
      toast({
        variant: 'destructive',
        title: 'Image or link required',
        description: 'Add the live website link to auto-capture a thumbnail, or upload an image.',
      })
      return
    }
    setSaving(true)

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      image_url: form.image_url,
      project_url: form.project_url || null,
    }

    try {
      if (editingId) {
        await apiPut(`/projects/${editingId}`, payload)
      } else {
        await apiPost('/projects', payload)
      }
      toast({ title: editingId ? 'Project updated' : 'Project added' })
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
    if (!window.confirm('Delete this project?')) return
    try {
      await apiDelete(`/projects/${id}`)
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
          <h1 className="font-display text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Projects shown in the Portfolio section, each with its own case study page.
          </p>
        </div>
        {!showForm && (
          <Button className="gap-2" onClick={startAdd}>
            <Plus className="size-4" />
            Add project
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={save} className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-title">Title</Label>
                  <Input
                    id="p-title"
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-category">Category</Label>
                  <select
                    id="p-category"
                    className="border-input h-11 rounded-lg border bg-transparent px-3 text-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as ProjectCategory }))
                    }
                  >
                    {PROJECT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-description">Description</Label>
                <Textarea
                  id="p-description"
                  required
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-url">Live website link</Label>
                <Input
                  id="p-url"
                  placeholder="https://client-site.com"
                  value={form.project_url}
                  onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))}
                />
                <p className="text-muted-foreground text-xs">
                  Add the link and the site&apos;s own hero is captured as the card thumbnail
                  automatically. Clicking the card opens this link.
                </p>
              </div>

              {!form.image_url && form.project_url && (
                <div className="flex flex-col gap-1.5">
                  <Label>Auto thumbnail preview</Label>
                  <img
                    src={projectThumbnail({ image_url: '', project_url: form.project_url })}
                    alt=""
                    className="border-border aspect-video w-full max-w-xs rounded-lg border object-cover object-top"
                  />
                </div>
              )}

              <ImageUploadField
                label="Custom image (optional — overrides the auto thumbnail)"
                folder="projects"
                value={form.image_url || null}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url ?? '' }))}
                aspectClassName="aspect-video"
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingId ? 'Save changes' : 'Add project'}
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
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => (
            <div
              key={project.id}
              className="border-border bg-card overflow-hidden rounded-xl border"
            >
              <img
                src={projectThumbnail(project)}
                alt={project.title}
                className="aspect-video w-full object-cover object-top"
              />
              <div className="flex flex-col gap-2 p-4">
                <Badge>{project.category}</Badge>
                <p className="text-sm font-semibold">{project.title}</p>
                <div className="mt-1 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => startEdit(project)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5"
                    onClick={() => remove(project.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
