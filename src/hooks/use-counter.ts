import * as React from 'react'

export function useCounter(target: number, isActive: boolean, duration = 1600) {
  const [value, setValue] = React.useState(0)
  const startedRef = React.useRef(false)

  React.useEffect(() => {
    if (!isActive || startedRef.current) return
    startedRef.current = true

    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isActive, target, duration])

  return value
}
