import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/SectionHeading'
import { useTestimonials } from '@/hooks/use-testimonials'
import { cn } from '@/lib/utils'

export function Testimonials() {
  const { testimonials } = useTestimonials()
  const [index, setIndex] = React.useState(0)

  const go = React.useCallback(
    (dir: 1 | -1) => {
      setIndex((prev) => (prev + dir + testimonials.length) % testimonials.length)
    },
    [testimonials.length],
  )

  React.useEffect(() => {
    if (testimonials.length <= 1) return
    const id = setInterval(() => go(1), 6000)
    return () => clearInterval(id)
  }, [go, testimonials.length])

  if (testimonials.length === 0) return null

  const current = testimonials[index]

  return (
    <section id="testimonials" className="bg-secondary/40 py-24">
      <div className="container-px mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="What clients say"
          description="Real feedback from the founders and teams I've worked with."
        />

        <div className="relative mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="border-border bg-card flex flex-col items-center gap-5 rounded-2xl border p-8 text-center shadow-sm sm:p-10"
            >
              <Quote className="text-primary/40 size-10" />
              <p className="text-balance text-lg leading-relaxed sm:text-xl">
                &ldquo;{current.message}&rdquo;
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-4',
                      i < current.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30',
                    )}
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold">{current.client_name}</p>
                <p className="text-muted-foreground text-sm">{current.client_role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((t, i) => (
                  <button
                    key={t.id}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === index ? 'bg-primary w-6' : 'bg-muted-foreground/30 w-2',
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(1)}
                aria-label="Next testimonial"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
