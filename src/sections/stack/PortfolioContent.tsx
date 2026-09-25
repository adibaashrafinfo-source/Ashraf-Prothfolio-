import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { useProjects } from '@/hooks/use-projects'

export function PortfolioContent() {
  const { projects } = useProjects()
  const featured = projects.slice(0, 4)

  return (
    <div className="flex flex-col gap-2.5">
      {featured.map((project) => (
        <Link
          key={project.id}
          to={`/portfolio/${project.id}`}
          className="border-border bg-background/60 hover:border-primary/40 group flex items-center gap-3 rounded-xl border p-3 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <Badge className="mb-1">{project.category}</Badge>
            <p className="truncate text-sm font-semibold">{project.title}</p>
          </div>
          <ArrowUpRight className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-colors" />
        </Link>
      ))}
      {featured.length === 0 && (
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      )}
    </div>
  )
}
