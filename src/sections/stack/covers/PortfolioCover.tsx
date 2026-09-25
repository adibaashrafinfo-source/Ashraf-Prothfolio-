import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { useProjects } from '@/hooks/use-projects'

export function PortfolioCover() {
  const { projects } = useProjects()
  const reduceMotion = useReducedMotion()
  const images = React.useMemo(
    () =>
      projects
        .slice(0, 4)
        .map((p) => p.image_url)
        .filter((src): src is string => Boolean(src)),
    [projects],
  )
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (reduceMotion || images.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 3200)
    return () => clearInterval(id)
  }, [reduceMotion, images.length])

  if (images.length === 0) {
    return <div className="liquid-mesh liquid-blue size-full" />
  }

  return (
    <div className="relative size-full overflow-hidden bg-black">
      <AnimatePresence>
        <motion.img
          key={images[index]}
          src={images[index]}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  )
}
