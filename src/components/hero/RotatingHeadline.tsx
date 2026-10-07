import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { HEADLINE_INTERVAL_MS, heroHeadlines } from '@/data/heroHeadlines'

const EASE = [0.22, 1, 0.36, 1] as const

export function RotatingHeadline() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % heroHeadlines.length),
      HEADLINE_INTERVAL_MS,
    )
    return () => clearInterval(id)
  }, [reduceMotion])

  const item = heroHeadlines[index]
  const Icon = item.icon

  return (
    <div className="flex w-full flex-col gap-5">
      <AnimatePresence mode="wait">
        <motion.span
          key={`chip-${item.key}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="border-border bg-card inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm"
        >
          <Icon className="text-primary size-4" />
          {item.chip}
        </motion.span>
      </AnimatePresence>

      <h1 className="font-display text-balance min-h-[3.5em] text-4xl leading-tight font-bold sm:min-h-[2.6em] sm:text-5xl lg:text-6xl">
        <AnimatePresence mode="wait">
          <motion.span key={`head-${item.key}`} className="block">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {item.lead}
            </motion.span>
            <motion.span
              className="text-primary block"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
            >
              {item.accent}
            </motion.span>
          </motion.span>
        </AnimatePresence>
      </h1>

      <AnimatePresence mode="wait">
        <motion.p
          key={`sub-${item.key}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
          className="text-muted-foreground min-h-[3.5em] max-w-xl text-lg leading-relaxed sm:min-h-[3em]"
        >
          {item.sub}
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-1.5" role="tablist" aria-label="Headline topics">
        {heroHeadlines.map((h, i) => (
          <button
            key={h.key}
            role="tab"
            aria-selected={i === index}
            aria-label={h.chip}
            onClick={() => setIndex(i)}
            className={
              i === index
                ? 'bg-primary h-1.5 w-7 rounded-full transition-all'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 h-1.5 w-1.5 rounded-full transition-all'
            }
          />
        ))}
      </div>
    </div>
  )
}
