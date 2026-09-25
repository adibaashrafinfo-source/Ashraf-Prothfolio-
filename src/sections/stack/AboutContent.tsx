import { Download, Mail, MapPin, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function AboutContent() {
  const { settings: site } = useSiteSettings()

  const facts = [
    { icon: User, label: 'Name', value: site.name },
    { icon: Mail, label: 'Email', value: site.email },
    { icon: MapPin, label: 'Location', value: site.location },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">{site.about}</p>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="border-border bg-background/60 flex items-center gap-3 rounded-xl border p-3"
          >
            <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
              <fact.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs">{fact.label}</dt>
              <dd className="truncate text-sm font-medium">{fact.value}</dd>
            </div>
          </div>
        ))}
        <div className="border-border bg-background/60 flex items-center gap-3 rounded-xl border p-3">
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold">
            {site.years_experience}+
          </span>
          <div>
            <dt className="text-muted-foreground text-xs">Experience</dt>
            <dd className="text-sm font-medium">Years in the industry</dd>
          </div>
        </div>
      </dl>

      <Button size="sm" asChild className="w-fit gap-2">
        <a href={site.resume_url} download>
          <Download className="size-3.5" />
          Download CV
        </a>
      </Button>
    </div>
  )
}
