import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useStackTransforms } from '@/components/stack/useStackTransforms'
import {
  BASE_TOP,
  CARD_SCROLL_HEIGHT,
  MAX_PEEK_STEPS,
  PEEK_OFFSET,
  PEEK_OFFSET_MOBILE,
} from '@/components/stack/constants'

export interface StackCardCover {
  type: 'image' | 'video' | 'gradient'
  src?: string
  /** For type "gradient": one of the `.liquid-*` utility classes in index.css. */
  className?: string
  alt?: string
}

interface StackCardProps {
  id: string
  index: number
  meta: string
  title: string
  tag?: string
  cover: StackCardCover
  onMore?: () => void
  children?: React.ReactNode
}

function CoverVisual({ cover, coverScale, coverY, reduceMotion }: {
  cover: StackCardCover
  coverScale: ReturnType<typeof useStackTransforms>['coverScale']
  coverY: ReturnType<typeof useStackTransforms>['coverY']
  reduceMotion: boolean
}) {
  const inner =
    cover.type === 'image' ? (
      <img
        src={cover.src}
        alt={cover.alt ?? ''}
        loading="lazy"
        className="size-full object-cover"
      />
    ) : cover.type === 'video' ? (
      <video
        src={cover.src}
        autoPlay
        muted
        loop
        playsInline
        className="size-full object-cover"
      />
    ) : (
      <div className={cn('size-full', cover.className)} />
    )

  return (
    <div className="border-border bg-muted relative h-[220px] w-full shrink-0 overflow-hidden rounded-[20px] border md:h-full md:w-[45%]">
      <motion.div
        className="size-full"
        style={reduceMotion ? undefined : { scale: coverScale, y: coverY }}
      >
        {inner}
      </motion.div>
    </div>
  )
}

export function StackCard({ id, index, meta, title, tag, cover, onMore, children }: StackCardProps) {
  const reduceMotion = useReducedMotion() ?? false
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const t = useStackTransforms(index)

  const peekOffset = isDesktop ? PEEK_OFFSET : PEEK_OFFSET_MOBILE
  const top = BASE_TOP + Math.min(index, MAX_PEEK_STEPS) * peekOffset
  const headingId = `${id}-heading`

  if (reduceMotion) {
    return (
      <section
        id={id}
        aria-labelledby={headingId}
        className="container-px mx-auto max-w-6xl py-12"
        style={{ scrollMarginTop: BASE_TOP }}
      >
        <div className="border-border bg-card flex flex-col gap-6 rounded-[28px] border p-6 shadow-sm md:flex-row md:gap-10 md:p-10">
          <CoverVisual cover={cover} coverScale={t.identity.one} coverY={t.identity.zero} reduceMotion />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="text-muted-foreground text-sm">{meta}</p>
            <h2 id={headingId} className="font-display text-2xl font-medium md:text-3xl">
              {title}
            </h2>
            <div className="min-w-0 flex-1">{children}</div>
            <CardFooterRow tag={tag} onMore={onMore} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="relative"
      style={{ height: CARD_SCROLL_HEIGHT, scrollMarginTop: BASE_TOP }}
    >
      <motion.div
        className="container-px mx-auto flex max-w-6xl items-start"
        style={{
          position: 'sticky',
          top,
          zIndex: 10 + index,
          y: t.cardY,
          opacity: t.cardOpacity,
          scale: t.cardScale,
          rotateX: t.cardRotateX,
          filter: t.filter,
          transformPerspective: 1200,
          transformOrigin: 'top center',
          willChange: 'transform',
        }}
      >
        <div className="border-border bg-card flex h-[calc(100svh-120px)] w-full flex-col gap-6 overflow-hidden rounded-[28px] border p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] md:h-[min(78vh,640px)] md:flex-row md:gap-10 md:p-10">
          <CoverVisual cover={cover} coverScale={t.coverScale} coverY={t.coverY} reduceMotion={false} />

          <motion.div
            className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ opacity: t.contentOpacity }}
          >
            <p className="text-muted-foreground text-sm">{meta}</p>
            <h2 className="font-display text-foreground text-2xl font-medium md:text-3xl" id={headingId}>
              {title}
            </h2>
            <div className="min-w-0 flex-1">{children}</div>
            <CardFooterRow tag={tag} onMore={onMore} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function CardFooterRow({ tag, onMore }: { tag?: string; onMore?: () => void }) {
  if (!tag && !onMore) return null

  return (
    <div className="mt-auto flex items-center justify-between pt-2">
      {tag ? (
        <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium">
          {tag}
        </span>
      ) : (
        <span />
      )}
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          aria-label={`More about ${tag ?? 'this section'}`}
          className="bg-muted-foreground hover:bg-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors"
        >
          <Plus className="size-4" />
        </button>
      )}
    </div>
  )
}
