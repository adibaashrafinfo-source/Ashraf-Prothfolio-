import * as React from 'react'
import type { MotionValue } from 'framer-motion'

interface StackContextValue {
  scrollYProgress: MotionValue<number>
  total: number
}

const StackContext = React.createContext<StackContextValue | null>(null)

export const StackContextProvider = StackContext.Provider

export function useStackContext(): StackContextValue {
  const ctx = React.useContext(StackContext)
  if (!ctx) {
    throw new Error('StackCard must be rendered inside a <StackSection>.')
  }
  return ctx
}
