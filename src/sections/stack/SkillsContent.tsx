import { skillPillars } from '@/data/skills'

export function SkillsContent() {
  return (
    <div className="flex flex-col gap-3">
      {skillPillars.map((pillar) => (
        <div
          key={pillar.title}
          className="border-border bg-background/60 flex flex-col gap-2 rounded-xl border p-3"
        >
          <div className="flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <pillar.icon className="size-4" />
            </span>
            <p className="text-sm font-semibold">{pillar.title}</p>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">{pillar.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {pillar.tools.map((tool) => (
              <span
                key={tool.name}
                className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[11px]"
              >
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
