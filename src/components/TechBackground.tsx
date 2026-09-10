import { motion, useReducedMotion } from 'framer-motion'
import {
  Binary,
  Braces,
  Cloud,
  Cpu,
  Database,
  Globe,
  Layers,
  Rocket,
  Terminal,
  Zap,
} from 'lucide-react'

const icons = [
  { Icon: Braces, top: '14%', left: '6%', size: 28, duration: 7, delay: 0 },
  { Icon: Terminal, top: '68%', left: '10%', size: 24, duration: 8, delay: 0.6 },
  { Icon: Cpu, top: '22%', left: '92%', size: 30, duration: 9, delay: 0.3 },
  { Icon: Database, top: '78%', left: '88%', size: 22, duration: 6.5, delay: 1 },
  { Icon: Globe, top: '48%', left: '4%', size: 20, duration: 7.5, delay: 1.4 },
  { Icon: Binary, top: '8%', left: '58%', size: 22, duration: 8.5, delay: 0.8 },
  { Icon: Zap, top: '86%', left: '48%', size: 20, duration: 6, delay: 0.2 },
  { Icon: Rocket, top: '34%', left: '80%', size: 22, duration: 7.8, delay: 1.8 },
  { Icon: Layers, top: '58%', left: '94%', size: 20, duration: 8.2, delay: 0.5 },
  { Icon: Cloud, top: '4%', left: '32%', size: 22, duration: 9.4, delay: 1.1 },
]

const nodes = [
  { x: 60, y: 80 },
  { x: 220, y: 40 },
  { x: 380, y: 120 },
  { x: 520, y: 60 },
  { x: 680, y: 140 },
  { x: 140, y: 220 },
  { x: 460, y: 240 },
]

const links: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [2, 6],
]

export function TechBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="text-primary absolute inset-0 size-full opacity-[0.14]"
        viewBox="0 0 760 320"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {links.map(([a, b], i) => (
          <motion.line
            key={`${a}-${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="6 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              reduceMotion
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 1, opacity: [0, 1, 0.45, 0.9, 0.45] }
            }
            transition={{
              pathLength: { duration: 1.2, delay: 0.4 + i * 0.15, ease: 'easeOut' },
              opacity: reduceMotion
                ? { duration: 1.2, delay: 0.4 + i * 0.15 }
                : {
                    duration: 3.6,
                    delay: 1.2 + i * 0.15,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  },
            }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={4}
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.6, 1] }}
            transition={{
              duration: reduceMotion ? 0.5 : 2.6,
              delay: reduceMotion ? i * 0.12 : 0.8 + i * 0.12,
              repeat: reduceMotion ? 0 : Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {!reduceMotion &&
        icons.map(({ Icon, top, left, size, duration, delay }, i) => (
          <motion.div
            key={i}
            className="text-primary absolute opacity-[0.16]"
            style={{ top, left }}
            animate={{ y: [0, -16, 0], rotate: [0, 8, 0], opacity: [0.1, 0.22, 0.1] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon style={{ width: size, height: size }} />
          </motion.div>
        ))}
    </div>
  )
}
