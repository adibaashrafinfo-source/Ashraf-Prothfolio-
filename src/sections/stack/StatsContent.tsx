import * as React from 'react'
import { useInView } from 'framer-motion'
import { Award, Briefcase, Smile, Timer } from 'lucide-react'

import { useCounter } from '@/hooks/use-counter'
import { useSiteSettings } from '@/hooks/use-site-settings'

function StatItem({
  icon: Icon,
  label,
  value,
  suffix,
  inView,
}: {
  icon: typeof Briefcase
  label: string
  value: number
  suffix: string
  inView: boolean
}) {
  const count = useCounter(value, inView)

  return (
    <div className="border-border bg-background/60 flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center">
      <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
        <Icon className="size-5" />
      </span>
      <p className="font-display text-xl font-bold">
        {count}
        {suffix}
      </p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
}

export function StatsContent() {
  const { settings: site } = useSiteSettings()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const stats = [
    { icon: Briefcase, label: 'Projects Completed', value: site.projects_completed, suffix: '+' },
    { icon: Smile, label: 'Happy Clients', value: site.happy_clients, suffix: '+' },
    { icon: Timer, label: 'Years Experience', value: site.years_experience, suffix: '+' },
    { icon: Award, label: 'Awards Won', value: site.awards_won, suffix: '' },
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <StatItem key={stat.label} {...stat} inView={inView} />
      ))}
    </div>
  )
}
