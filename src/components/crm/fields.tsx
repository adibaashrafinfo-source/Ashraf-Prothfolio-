import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const selectClass =
  'border-input bg-background h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'

interface BaseProps {
  label: string
  className?: string
  hint?: string
}

export function TextField({
  label,
  className,
  hint,
  ...props
}: BaseProps & React.ComponentProps<typeof Input>) {
  const id = React.useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

export function AreaField({
  label,
  className,
  hint,
  ...props
}: BaseProps & React.ComponentProps<typeof Textarea>) {
  const id = React.useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} {...props} />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

export function SelectField({
  label,
  className,
  hint,
  options,
  ...props
}: BaseProps &
  React.ComponentProps<'select'> & { options: readonly { value: string; label: string }[] }) {
  const id = React.useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={selectClass} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

export function InlineSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return <select className={cn(selectClass, 'h-9 w-auto', className)} {...props} />
}

export function toOptions<T extends string>(values: readonly T[], meta?: Record<T, { label: string }>) {
  return values.map((v) => ({ value: v, label: meta ? meta[v].label : v }))
}
