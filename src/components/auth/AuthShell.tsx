import * as React from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Lock } from 'lucide-react'

import { ParticleNetwork } from '@/components/hero/ParticleNetwork'
import { cn } from '@/lib/utils'

/** Input styling that sits well on the glass card. */
export const glassInput =
  'h-12 rounded-xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus-visible:border-primary/70 focus-visible:ring-primary/25 focus-visible:bg-white/[0.07]'

const CHIPS = [
  { text: 'git push origin main ✓', className: 'top-[12%] left-[6%]', delay: 0 },
  { text: 'GET /api/projects 200 OK', className: 'top-[22%] right-[7%]', delay: 1.2 },
  { text: '<Website status="live" />', className: 'bottom-[24%] left-[8%]', delay: 0.6 },
  { text: 'SEO traffic ↑ 248%', className: 'bottom-[14%] right-[10%]', delay: 1.8 },
  { text: 'npm run build — 1.2s', className: 'top-[48%] left-[3%]', delay: 2.4 },
  { text: 'deploy: success', className: 'top-[58%] right-[4%]', delay: 3 },
]

function TechBackdrop() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#05070c]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.18),transparent_55%)]" />

      {/* aurora */}
      {[
        { c: 'bg-orange-500/30', p: 'top-[-10%] left-[-8%] size-[34rem]', x: [0, 60, -20, 0], y: [0, 40, 80, 0], d: 18 },
        { c: 'bg-violet-600/25', p: 'bottom-[-15%] right-[-10%] size-[38rem]', x: [0, -70, 10, 0], y: [0, -50, 20, 0], d: 22 },
        { c: 'bg-cyan-500/15', p: 'top-[35%] left-[40%] size-[26rem]', x: [0, 40, -60, 0], y: [0, -60, 30, 0], d: 26 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className={cn('absolute rounded-full blur-[110px]', b.c, b.p)}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* grid fading out from the centre */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      {/* orbit rings behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[520, 720, 920].map((size, i) => (
          <motion.div
            key={size}
            className="absolute top-1/2 left-1/2 rounded-full border border-white/[0.06]"
            style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
            animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
            transition={{ duration: 60 + i * 30, repeat: Infinity, ease: 'linear' }}
          >
            <span className="bg-primary absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_14px_4px] shadow-orange-500/60" />
            {i === 1 && (
              <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_3px] shadow-cyan-400/50" />
            )}
          </motion.div>
        ))}
      </div>

      {/* floating code chips */}
      {CHIPS.map((chip) => (
        <motion.div
          key={chip.text}
          className={cn(
            'absolute hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/45 backdrop-blur-md lg:block',
            chip.className,
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 1, 0.6, 1], y: [10, 0, -10, 0] }}
          transition={{ duration: 9, delay: chip.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400" />
          {chip.text}
        </motion.div>
      ))}
    </div>
  )
}

/** Liquid-glass card: frosted panel, rotating light edge, cursor sheen and a gentle 3D tilt. */
function GlassCard({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.3)
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 150, damping: 20 })
  const sheenX = useTransform(mx, (v) => `${v * 100}%`)
  const sheenY = useTransform(my, (v) => `${v * 100}%`)
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.13), transparent 60%)`

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    mx.set(0.5)
    my.set(0.3)
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full rounded-[28px]"
    >
      {/* rotating light around the edge */}
      <div
        className="absolute -inset-px overflow-hidden rounded-[29px]"
        style={{
          padding: 1,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(251,146,60,0.9) 60deg, transparent 120deg, transparent 200deg, rgba(103,232,249,0.6) 260deg, transparent 320deg)',
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent" />
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
        <div className="relative p-7 sm:p-9">{children}</div>
      </div>
    </motion.div>
  )
}

export function AuthShell({
  logo,
  badge,
  badgeIcon: BadgeIcon = Lock,
  title,
  subtitle,
  children,
  footer,
}: {
  logo: React.ReactNode
  badge: string
  badgeIcon?: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    // `dark` scopes the dark theme tokens to this screen so the glass reads the same in both site themes.
    <div className="dark text-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0">
        <TechBackdrop />
        <ParticleNetwork />
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-white"
        >
          {logo}
        </motion.div>

        <GlassCard>
          <div className="mb-6 flex flex-col items-start gap-4">
            <span className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <BadgeIcon className="size-3.5" />
              {badge}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-[1.7rem]">{title}</h1>
              <p className="mt-1.5 text-sm text-white/55">{subtitle}</p>
            </div>
          </div>
          {children}
        </GlassCard>

        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  )
}
