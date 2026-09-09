import { motion, useReducedMotion } from 'framer-motion'
import { Binary, Braces, Cpu, Database, Globe, Terminal, Zap } from 'lucide-react'

const icons = [
  { Icon: Braces, top: '14%', left: '6%', size: 28, duration: 7, delay: 0 },
  { Icon: Terminal, top: '68%', left: '10%', size: 24, duration: 8, delay: 0.6 },
  { Icon: Cpu, top: '22%', left: '92%', size: 30, duration: 9, delay: 0.3 },
  { Icon: Database, top: '78%', left: '88%', size: 22, duration: 6.5, delay: 1 },
  { Icon: Globe, top: '48%', left: '4%', size: 20, duration: 7.5, delay: 1.4 },
  { Icon: Binary, top: '8%', left: '58%', size: 22, duration: 8.5, delay: 0.8 },
  { Icon: Zap, top: '86%', left: '48%', size: 20, duration: 6, delay: 0.2 },
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
        className="text-primary absolute inset-0 size-full opacity-[0.12]"
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
            animate={reduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 + i * 0.15, ease: 'easeOut' }}
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
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          />
        ))}
      </svg>

      {!reduceMotion &&
        icons.map(({ Icon, top, left, size, duration, delay }, i) => (
          <motion.div
            key={i}
            className="text-primary absolute opacity-[0.14]"
            style={{ top, left }}
            animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon style={{ width: size, height: size }} />
          </motion.div>
        ))}
    </div>
  )
}
