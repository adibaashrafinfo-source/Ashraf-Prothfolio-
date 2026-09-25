import * as React from 'react'
import { useScroll } from 'framer-motion'

import { StackContextProvider } from '@/components/stack/StackContext'

interface StackSectionProps {
  /** Number of <StackCard> children this stack contains. */
  total: number
  children: React.ReactNode
  className?: string
}

/**
 * Wraps a run of <StackCard> sections and tracks one shared scroll progress
 * (0 → 1) across the whole stack, via context. Each StackCard derives its own
 * enter/cover animation ranges from its index against that shared progress.
 */
export function StackSection({ total, children, className }: StackSectionProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <div ref={containerRef} className={className}>
      <StackContextProvider value={{ scrollYProgress, total }}>{children}</StackContextProvider>
    </div>
  )
}
