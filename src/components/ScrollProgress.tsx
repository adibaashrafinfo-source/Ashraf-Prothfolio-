import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 40,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden
      className="from-primary via-accent to-primary fixed inset-x-0 top-0 z-[60] h-[2.5px] origin-left bg-gradient-to-r"
      style={{ scaleX }}
    />
  )
}
