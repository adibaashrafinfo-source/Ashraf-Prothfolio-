import { motion, useInView } from 'framer-motion'
import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { skillPillars } from '@/data/skills'

function SkillBar({
  name,
  level,
  inView,
  delay,
}: {
  name: string
  level: number
  inView: boolean
  delay: number
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">{level}%</span>
      </div>
      <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          className="bg-primary h-full rounded-full"
        />
      </div>
    </div>
  )
}

export function Skills() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" className="bg-secondary/40 py-24">
      <div className="container-px mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Skills"
          title="Three disciplines, one focused outcome"
          description="Design, development, and marketing working together — not in silos."
        />

        <div ref={ref} className="mt-14 grid gap-6 lg:grid-cols-3">
          {skillPillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.1}>
              <Card className="h-full">
                <CardHeader>
                  <span className="bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-xl">
                    <pillar.icon className="size-6" />
                  </span>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {pillar.tools.map((tool, j) => (
                    <SkillBar
                      key={tool.name}
                      name={tool.name}
                      level={tool.level}
                      inView={inView}
                      delay={j * 0.08}
                    />
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
