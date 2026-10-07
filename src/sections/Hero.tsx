import { motion } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TechBackground } from '@/components/TechBackground'
import { RotatingHeadline } from '@/components/hero/RotatingHeadline'
import { HeroVisual } from '@/components/hero/HeroVisual'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function Hero() {
  const { settings: site } = useSiteSettings()

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="top"
      className="bg-grid relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      <div className="from-background via-background/95 to-background pointer-events-none absolute inset-0 bg-gradient-to-b" />
      <motion.div
        aria-hidden
        className="bg-primary/25 pointer-events-none absolute top-1/4 -left-32 size-96 rounded-full blur-3xl"
        animate={{ x: [0, 40, -10, 0], y: [0, -20, 30, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="bg-accent/60 pointer-events-none absolute right-0 bottom-0 size-96 rounded-full blur-3xl"
        animate={{ x: [0, -30, 20, 0], y: [0, 25, -15, 0], scale: [1, 1.1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <TechBackground />

      <div className="container-px relative z-10 mx-auto grid max-w-6xl items-center gap-16 py-16 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-start gap-6"
        >
          <RotatingHeadline />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => scrollTo('#portfolio')} className="gap-2">
              View My Work
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <a href={site.resume_url} download>
                <Download className="size-4" />
                Download CV
              </a>
            </Button>
          </div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  )
}
