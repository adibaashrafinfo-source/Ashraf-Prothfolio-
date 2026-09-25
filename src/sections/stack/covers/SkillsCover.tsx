import { motion, useReducedMotion } from 'framer-motion'

import { skillPillars } from '@/data/skills'

const FLOAT_DELAYS = [0, 0.5, 1]

export function SkillsCover() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="liquid-mesh liquid-violet flex size-full flex-wrap items-center justify-center gap-3 p-5">
      {skillPillars.map((pillar, i) => (
        <motion.div
          key={pillar.title}
          className="bg-background/90 text-foreground flex w-24 flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center shadow-lg backdrop-blur-sm md:w-28"
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: FLOAT_DELAYS[i % 3] }
          }
        >
          <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
            <pillar.icon className="size-5" />
          </span>
          <p className="text-[11px] leading-tight font-semibold">{pillar.title}</p>
        </motion.div>
      ))}
    </div>
  )
}
