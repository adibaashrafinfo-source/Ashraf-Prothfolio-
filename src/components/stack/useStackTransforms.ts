import * as React from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

import { useStackContext } from '@/components/stack/StackContext'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  MAX_ROTATE_X,
  MIN_BRIGHTNESS,
  MIN_CONTENT_OPACITY,
  MIN_SCALE,
  MIN_SCALE_MOBILE,
  SPRING_CONFIG,
} from '@/components/stack/constants'

export function useStackTransforms(index: number) {
  const { scrollYProgress, total } = useStackContext()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isLast = index === total - 1

  const segStart = index / total
  const segEnd = (index + 1) / total
  const enterStart = index === 0 ? 0 : (index - 1) / total
  const enterEnd = index === 0 ? 0.5 / total : segStart

  const targetScale = isLast ? 1 : isDesktop ? MIN_SCALE : MIN_SCALE_MOBILE
  const targetRotateX = isLast || !isDesktop ? 0 : MAX_ROTATE_X
  const targetBrightness = isLast ? 1 : MIN_BRIGHTNESS
  const targetContentOpacity = isLast ? 1 : MIN_CONTENT_OPACITY

  // "Enter" phase — this card sliding into place as the previous one is used up.
  const rawCardY = useTransform(scrollYProgress, [enterStart, enterEnd], [60, 0])
  const rawCardOpacity = useTransform(scrollYProgress, [enterStart, enterEnd], [0.6, 1])
  const rawCoverScale = useTransform(scrollYProgress, [enterStart, enterEnd], [1.15, 1])
  const rawCoverY = useTransform(scrollYProgress, [enterStart, enterEnd], [40, 0])

  // "Covered" phase — scoped to exactly the scroll range the *next* card uses to
  // slide in (segStart → segEnd), so this card fully settles into its receded
  // state right as the next one finishes covering it, instead of drifting for
  // the rest of the page.
  const rawCardScale = useTransform(scrollYProgress, [segStart, segEnd], [1, targetScale])
  const rawCardRotateX = useTransform(scrollYProgress, [segStart, segEnd], [0, targetRotateX])
  const rawBrightness = useTransform(scrollYProgress, [segStart, segEnd], [1, targetBrightness])
  const rawContentOpacity = useTransform(scrollYProgress, [segStart, segEnd], [1, targetContentOpacity])

  const cardY = useSpring(rawCardY, SPRING_CONFIG)
  const cardOpacity = useSpring(rawCardOpacity, SPRING_CONFIG)
  const coverScale = useSpring(rawCoverScale, SPRING_CONFIG)
  const coverY = useSpring(rawCoverY, SPRING_CONFIG)
  const cardScale = useSpring(rawCardScale, SPRING_CONFIG)
  const cardRotateX = useSpring(rawCardRotateX, SPRING_CONFIG)
  const brightness = useSpring(rawBrightness, SPRING_CONFIG)
  const contentOpacity = useSpring(rawContentOpacity, SPRING_CONFIG)

  const filter = useTransform(brightness, (b) => `brightness(${b})`)

  // Stable identity fallbacks for the prefers-reduced-motion render path, so
  // StackCard never needs to skip calling this hook or any of the above.
  const one = useMotionValue(1)
  const zero = useMotionValue(0)

  return React.useMemo(
    () => ({
      cardY,
      cardOpacity,
      coverScale,
      coverY,
      cardScale,
      cardRotateX,
      filter,
      contentOpacity,
      identity: { one, zero },
    }),
    [cardY, cardOpacity, coverScale, coverY, cardScale, cardRotateX, filter, contentOpacity, one, zero],
  )
}
