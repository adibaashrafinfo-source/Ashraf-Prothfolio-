import { motion, useReducedMotion } from 'framer-motion'

import { services } from '@/data/services'

export function ServicesCover() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="liquid-mesh liquid-teal grid size-full grid-cols-3 place-items-center gap-3 p-6">
      {services.map((service, i) => (
        <motion.div
          key={service.title}
          className="bg-background/90 text-primary flex size-12 items-center justify-center rounded-2xl shadow-lg backdrop-blur-sm md:size-14"
          animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }
          }
        >
          <service.icon className="size-5 md:size-6" />
        </motion.div>
      ))}
    </div>
  )
}
