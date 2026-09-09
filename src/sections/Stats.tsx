import * as React from 'react'
import { useInView } from 'framer-motion'
import { Award, Briefcase, Smile, Timer } from 'lucide-react'

import { useCounter } from '@/hooks/use-counter'
import { site } from '@/data/site'

const stats = [
  { icon: Briefcase, label: 'Projects Completed', value: site.projectsCompleted, suffix: '+' },
  { icon: Smile, label: 'Happy Clients', value: site.happyClients, suffix: '+' },
  { icon: Timer, label: 'Years Experience', value: site.yearsExperience, suffix: '+' },
  { icon: Award, label: 'Awards Won', value: site.awardsWon, suffix: '' },
]

function StatItem({
  icon: Icon,
  label,
  value,
  suffix,
  inView,
}: (typeof stats)[number] & { inView: boolean }) {
  const count = useCounter(value, inView)

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="bg-primary-foreground/10 text-primary-foreground flex size-14 items-center justify-center rounded-2xl">
        <Icon className="size-7" />
      </span>
      <p className="font-display text-primary-foreground text-4xl font-bold">
        {count}
        {suffix}
      </p>
      <p className="text-primary-foreground/80 text-sm">{label}</p>
    </div>
  )
}

export function Stats() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section ref={ref} className="bg-primary py-20">
      <div className="container-px mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} inView={inView} />
        ))}
      </div>
    </section>
  )
}
