import * as React from 'react'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import type { SiteSettings } from '@/types'

type FormState = Omit<SiteSettings, 'id' | 'updated_at'>

export function SettingsPage() {
  const { settings, loading } = useSiteSettings()
  const { toast } = useToast()
  const [form, setForm] = React.useState<FormState>(settings)
  const [saving, setSaving] = React.useState(false)
  const initialized = React.useRef(false)

  React.useEffect(() => {
    if (!loading && !initialized.current) {
      setForm(settings)
      initialized.current = true
    }
  }, [loading, settings])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setSaving(true)
    try {
      const { error } = await supabase.from('site_settings').upsert({ id: 'default', ...form })
      if (error) {
        toast({ variant: 'destructive', title: 'Could not save', description: error.message })
        return
      }
      toast({ title: 'Saved', description: 'Site settings updated.' })
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

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Edit the header, hero, about, stats, and contact info shown on the site.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logo_text">Logo text</Label>
            <Input
              id="logo_text"
              value={form.logo_text}
              onChange={(e) => set('logo_text', e.target.value)}
            />
          </div>
          <ImageUploadField
            label="Logo image (optional — overrides logo text)"
            folder="logo"
            value={form.logo_image_url}
            onChange={(url) => set('logo_image_url', url)}
            aspectClassName="aspect-[3/1]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="short_name">Short name</Label>
            <Input
              id="short_name"
              value={form.short_name}
              onChange={(e) => set('short_name', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="title">Title / role</Label>
            <Input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="tagline">Hero tagline</Label>
            <Textarea
              id="tagline"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="about">About paragraph</Label>
            <Textarea
              id="about"
              className="min-h-40"
              value={form.about}
              onChange={(e) => set('about', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="years_experience">Years experience</Label>
            <Input
              id="years_experience"
              type="number"
              value={form.years_experience}
              onChange={(e) => set('years_experience', Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="projects_completed">Projects completed</Label>
            <Input
              id="projects_completed"
              type="number"
              value={form.projects_completed}
              onChange={(e) => set('projects_completed', Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="happy_clients">Happy clients</Label>
            <Input
              id="happy_clients"
              type="number"
              value={form.happy_clients}
              onChange={(e) => set('happy_clients', Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="awards_won">Awards won</Label>
            <Input
              id="awards_won"
              type="number"
              value={form.awards_won}
              onChange={(e) => set('awards_won', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resume_url">Resume / CV URL</Label>
            <Input
              id="resume_url"
              value={form.resume_url}
              onChange={(e) => set('resume_url', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="map_embed_src">Google Maps embed URL</Label>
            <Input
              id="map_embed_src"
              value={form.map_embed_src}
              onChange={(e) => set('map_embed_src', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
