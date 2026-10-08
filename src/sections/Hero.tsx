import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/Magnetic'
import { TechBackground } from '@/components/TechBackground'
import { RotatingHeadline } from '@/components/hero/RotatingHeadline'
import { HeroVisual } from '@/components/hero/HeroVisual'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function Hero() {
  const { settings: site } = useSiteSettings()
  const spotlightX = useMotionValue(50)
  const spotlightY = useMotionValue(35)
  const spotlightBackground = useMotionTemplate`radial-gradient(640px circle at ${spotlightX}% ${spotlightY}%, var(--primary) 0%, transparent 65%)`

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    spotlightX.set(((e.clientX - rect.left) / rect.width) * 100)
    spotlightY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="top"
      onMouseMove={handleMouseMove}
      className="bg-grid relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      <div className="from-background via-background/95 to-background pointer-events-none absolute inset-0 bg-gradient-to-b" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ background: spotlightBackground }}
      />
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
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 size-[32rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'conic-gradient(from 0deg, var(--primary), var(--accent), var(--chart-3, var(--primary)), var(--primary))',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
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
            <Magnetic strength={0.25}>
              <Button size="lg" onClick={() => scrollTo('#portfolio')} className="gap-2">
                View My Work
                <ArrowRight className="size-4" />
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <a href={site.resume_url} download>
                  <Download className="size-4" />
                  Download CV
                </a>
              </Button>
            </Magnetic>
          </div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  )
}
