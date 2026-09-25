import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTestimonials } from '@/hooks/use-testimonials'
import { cn } from '@/lib/utils'

export function TestimonialsContent() {
  const { testimonials } = useTestimonials()
  const [index, setIndex] = React.useState(0)

  const go = React.useCallback(
    (dir: 1 | -1) => {
      setIndex((prev) => (prev + dir + testimonials.length) % testimonials.length)
    },
    [testimonials.length],
  )

  if (testimonials.length === 0) return null

  const current = testimonials[index]

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="border-border bg-background/60 flex flex-col gap-3 rounded-xl border p-4"
        >
          <Quote className="text-primary/40 size-6" />
          <p className="text-sm leading-relaxed">&ldquo;{current.message}&rdquo;</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-3.5',
                  i < current.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30',
                )}
              />
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold">{current.client_name}</p>
            <p className="text-muted-foreground text-xs">{current.client_role}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous testimonial">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex gap-1.5">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'bg-primary w-5' : 'bg-muted-foreground/30 w-1.5',
                )}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next testimonial">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
