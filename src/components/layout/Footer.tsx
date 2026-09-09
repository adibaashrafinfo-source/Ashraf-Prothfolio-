import { ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { navLinks, site } from '@/data/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-border bg-secondary/40 border-t">
      <div className="container-px mx-auto flex max-w-6xl flex-col gap-10 py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <a href="#top" className="font-display text-lg font-bold">
              {site.shortName}
              <span className="text-primary">.</span>
            </a>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{site.tagline}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">Quick Links</span>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">Follow</span>
            <div className="flex gap-3">
              {site.social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.name}
                  className="border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {year} {site.name}. All rights reserved.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp className="size-4" />
            Back to top
          </Button>
        </div>
      </div>
    </footer>
  )
}
