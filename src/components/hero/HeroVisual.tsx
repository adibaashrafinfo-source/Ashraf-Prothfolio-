import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Search, TrendingUp } from 'lucide-react'

import { CodeWindow } from '@/components/hero/CodeWindow'

const BARS = [38, 55, 44, 72, 61, 88]

export function HeroVisual() {
  const reduceMotion = useReducedMotion()

  const float = (delay: number) =>
    reduceMotion
      ? undefined
      : {
          animate: { y: [0, -10, 0] },
          transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay },
        }

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <motion.div
        aria-hidden
        className="from-primary/40 via-accent/30 to-primary/40 absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br blur-3xl"
        animate={reduceMotion ? undefined : { rotate: 360, scale: [1, 1.08, 1] }}
        transition={{
          rotate: { duration: 26, repeat: Infinity, ease: 'linear' },
          scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
      >
        <CodeWindow />
      </motion.div>

      {/* Growth chart card */}
      <motion.div
        className="border-border bg-card absolute -bottom-16 -left-5 w-44 rounded-2xl border p-4 shadow-xl sm:-left-16 sm:w-52"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div {...float(0.2)}>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-medium">Traffic growth</p>
            <TrendingUp className="text-primary size-3.5" />
          </div>
          <p className="font-display mt-1 text-xl font-bold">+248%</p>
          <div className="mt-3 flex h-12 items-end gap-1.5">
            {BARS.map((h, i) => (
              <motion.span
                key={i}
                className="bg-primary/70 flex-1 rounded-sm"
                style={{ height: `${h}%` }}
                animate={reduceMotion ? undefined : { height: [`${h}%`, `${Math.min(100, h + 22)}%`, `${h}%`] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* SEO rank card */}
      <motion.div
        className="border-border bg-card absolute -top-6 -right-2 flex items-center gap-2.5 rounded-2xl border p-3 shadow-xl sm:-right-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        <motion.div className="flex items-center gap-2.5" {...float(1.1)}>
          <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
            <Search className="size-4" />
          </span>
          <div>
            <p className="text-muted-foreground text-[11px]">Google rank</p>
            <p className="text-sm font-bold">#1 · 3 keywords</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Conversion pill */}
      <motion.div
        className="border-border bg-card absolute top-1/2 -right-3 flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-lg sm:-right-12"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div className="flex items-center gap-1.5" {...float(1.8)}>
          <ArrowUpRight className="size-3.5 text-emerald-500" />
          <span className="text-xs font-semibold">4.8x ROAS</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
