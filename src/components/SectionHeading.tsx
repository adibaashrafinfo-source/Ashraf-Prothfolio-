import { cn } from '@/lib/utils'
import { Reveal } from '@/components/Reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <span className="text-primary text-sm font-semibold tracking-widest uppercase">
        {eyebrow}
      </span>
      <h2 className="font-display text-balance max-w-2xl text-3xl font-bold sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl text-base text-balance sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  )
}
