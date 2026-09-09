import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/Reveal'
import { useProjects } from '@/hooks/use-projects'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { projects, loading } = useProjects()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="container-px mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 pt-24 text-center">
        {!loading && (
          <>
            <p className="text-muted-foreground text-sm">Project not found.</p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/#portfolio">
                <ArrowLeft className="size-4" />
                Back to portfolio
              </Link>
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <article className="pt-24 pb-24">
      <div className="container-px mx-auto max-w-4xl">
        <Reveal className="flex flex-col items-start gap-4">
          <Link
            to="/#portfolio"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            Back to portfolio
          </Link>

          <div className="flex flex-col gap-3">
            <Badge>{project.category}</Badge>
            <h1 className="font-display text-3xl font-bold text-balance sm:text-4xl">
              {project.title}
            </h1>
          </div>
        </Reveal>

        <Reveal
          delay={0.1}
          className="border-border bg-card mt-8 overflow-hidden rounded-2xl border shadow-sm"
        >
          <img
            src={project.image_url}
            alt={project.title}
            loading="eager"
            className="aspect-16/9 w-full object-cover"
          />
        </Reveal>

        <Reveal
          delay={0.15}
          className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
        >
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            {project.description}
          </p>
          {project.project_url && (
            <Button asChild className="w-fit gap-2">
              <a href={project.project_url} target="_blank" rel="noreferrer noopener">
                Visit live site
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
        </Reveal>
      </div>
    </article>
  )
}
