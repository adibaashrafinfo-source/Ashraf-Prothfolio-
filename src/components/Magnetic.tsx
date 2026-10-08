import * as React from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

/** Wraps interactive elements with a subtle cursor-pull effect, lifted within the wrapper's own bounds. */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
