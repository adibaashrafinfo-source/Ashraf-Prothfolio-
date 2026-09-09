import { motion } from 'framer-motion'
import { ArrowRight, Download, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { site } from '@/data/site'

export function Hero() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="top"
      className="bg-grid relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      <div className="from-background via-background/95 to-background pointer-events-none absolute inset-0 bg-gradient-to-b" />
      <div
        aria-hidden
        className="bg-primary/25 pointer-events-none absolute top-1/4 -left-32 size-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-accent/60 pointer-events-none absolute right-0 bottom-0 size-96 rounded-full blur-3xl"
      />

      <div className="container-px relative mx-auto grid max-w-6xl items-center gap-12 py-16 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-start gap-6"
        >
          <span className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm">
            <Sparkles className="text-primary size-4" />
            {site.title}
          </span>

          <h1 className="font-display text-balance text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
            Hi, I&apos;m {site.name.split(' ')[0]} —{' '}
            <span className="text-primary">{site.tagline}</span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">{site.about}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => scrollTo('#portfolio')} className="gap-2">
              View My Work
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <a href={site.resumeUrl} download>
                <Download className="size-4" />
                Download CV
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="from-primary/40 to-accent/40 absolute inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br blur-2xl" />
          <div className="border-border bg-card overflow-hidden rounded-[2rem] border shadow-xl">
            <img
              src="/profile.jpg"
              alt={`${site.name} portrait`}
              width={480}
              height={560}
              className="aspect-4/5 w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="border-border bg-card absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border p-4 shadow-lg">
            <div className="text-center">
              <p className="font-display text-primary text-2xl font-bold">
                {site.yearsExperience}+
              </p>
              <p className="text-muted-foreground text-xs whitespace-nowrap">Years Experience</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
