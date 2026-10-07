import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/SectionHeading'
import { useProjects } from '@/hooks/use-projects'
import { projectThumbnail } from '@/lib/siteThumbnail'
import { PROJECT_CATEGORIES } from '@/types'
import type { Project, ProjectCategory } from '@/types'

function ProjectCard({ project }: { project: Project }) {
  const thumbnail = projectThumbnail(project)
  const live = project.project_url

  const cover = (
    <div className="relative aspect-16/10 overflow-hidden">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={project.title}
          loading="lazy"
          className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="bg-secondary text-muted-foreground flex size-full items-center justify-center text-xs">
          No preview
        </div>
      )}
      <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="m-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black">
          {live ? 'Visit live site' : 'View case study'}
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </div>
  )

  const cardClass =
    'border-border bg-card group focus-visible:ring-ring block overflow-hidden rounded-2xl border shadow-sm outline-none focus-visible:ring-2'

  return (
    <div className="flex h-full flex-col">
      {live ? (
        <a href={live} target="_blank" rel="noreferrer noopener" className={cardClass}>
          {cover}
        </a>
      ) : (
        <Link to={`/portfolio/${project.id}`} className={cardClass}>
          {cover}
        </Link>
      )}

      <div className="flex flex-1 flex-col gap-2 px-1 pt-4">
        <Badge className="w-fit">{project.category}</Badge>
        <h3 className="font-display text-lg font-semibold">{project.title}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {project.description}
        </p>
        <div className="mt-auto flex items-center gap-4 pt-2">
          <Link
            to={`/portfolio/${project.id}`}
            className="text-primary text-sm font-medium hover:underline"
          >
            Case study
          </Link>
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
            >
              Live site <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function Portfolio() {
  const { projects } = useProjects()
  const [filter, setFilter] = React.useState<ProjectCategory | 'All'>('All')

  // Only offer filters that actually have work behind them.
  const filters: Array<ProjectCategory | 'All'> = [
    'All',
    ...PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c)),
  ]

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section id="portfolio" className="container-px mx-auto max-w-6xl py-24">
      <SectionHeading
        eyebrow="Portfolio"
        title="Selected work"
        description="E-Commerce stores, SaaS dashboards, business websites, and apps. Open any card to see it live."
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

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <p className="text-muted-foreground mt-10 text-center">No projects in this category yet.</p>
      )}
    </section>
  )
}
