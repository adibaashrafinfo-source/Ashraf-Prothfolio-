import { Download, Mail, MapPin, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function About() {
  const { settings: site } = useSiteSettings()

  const facts = [
    { icon: User, label: 'Name', value: site.name },
    { icon: Mail, label: 'Email', value: site.email },
    { icon: MapPin, label: 'Location', value: site.location },
  ]

  return (
    <section id="about" className="container-px mx-auto max-w-6xl py-24">
      <SectionHeading
        eyebrow="About Me"
        title="Design-minded builder, growth-focused thinker"
        description="A quick look at who I am and what drives the work at Abrar IT."
      />

      <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="bg-primary/10 absolute -inset-4 -z-10 rounded-3xl" />
          <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-lg">
            <img
              src="/profile-about.jpg"
              alt={`${site.name} portrait`}
              width={480}
              height={600}
              loading="lazy"
              className="aspect-4/5 w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-6">
          <p className="font-display text-foreground text-lg leading-snug font-semibold sm:text-xl">
            {site.short_bio}
          </p>
          <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">{site.about}</p>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="border-border bg-card flex items-center gap-3 rounded-xl border p-4"
              >
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                  <fact.icon className="size-5" />
                </span>
                <div>
                  <dt className="text-muted-foreground text-xs">{fact.label}</dt>
                  <dd className="truncate text-sm font-medium">{fact.value}</dd>
                </div>
              </div>
            ))}
            <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-4">
              <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold">
                {site.years_experience}+
              </span>
              <div>
                <dt className="text-muted-foreground text-xs">Experience</dt>
                <dd className="text-sm font-medium">Years in the industry</dd>
              </div>
            </div>
          </dl>

          <Button size="lg" asChild className="w-fit gap-2">
            <a href={site.resume_url} download>
              <Download className="size-4" />
              Download CV
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
