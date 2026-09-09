import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/SectionHeading'
import { useProjects } from '@/hooks/use-projects'
import type { ProjectCategory } from '@/types'

const filters: Array<ProjectCategory | 'All'> = [
  'All',
  'Graphic Design',
  'Web Development',
  'Digital Marketing',
]

export function Portfolio() {
  const { projects } = useProjects()
  const [filter, setFilter] = React.useState<(typeof filters)[number]>('All')

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section id="portfolio" className="container-px mx-auto max-w-6xl py-24">
      <SectionHeading
        eyebrow="Portfolio"
        title="Selected work"
        description="A snapshot of recent projects across design, development, and marketing."
      />

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.article
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="border-border bg-card group overflow-hidden rounded-2xl border shadow-sm"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="m-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black"
                    >
                      View project <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 p-5">
                <Badge>{project.category}</Badge>
                <h3 className="font-display text-lg font-semibold">{project.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <p className="text-muted-foreground mt-10 text-center">No projects in this category yet.</p>
      )}
    </section>
  )
}
