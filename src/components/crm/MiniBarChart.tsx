import { cn } from '@/lib/utils'

/**
 * Single-series column chart (one hue, so no legend — the card title names it).
 * Hover/focus shows each value; a visually hidden table carries the data for screen readers.
 */
export function MiniBarChart({
  data,
  format,
  label,
  highlightLast = true,
  height = 160,
}: {
  data: { label: string; value: number }[]
  format: (v: number) => string
  label: string
  highlightLast?: boolean
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.value), 0)

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative flex items-end gap-2 border-b border-border" style={{ height }} aria-hidden>
        {data.map((d, i) => {
          const pct = max > 0 ? (d.value / max) * 100 : 0
          const isLast = highlightLast && i === data.length - 1
          return (
            <div key={d.label} className="group relative flex h-full flex-1 items-end justify-center" tabIndex={0}>
              <span className="bg-foreground text-background pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                {d.label}: {format(d.value)}
              </span>
              <div
                className={cn(
                  'w-full max-w-12 rounded-t-[4px] transition-colors',
                  isLast ? 'bg-primary' : 'bg-primary/35 group-hover:bg-primary/60',
                )}
                style={{ height: `${Math.max(pct, d.value > 0 ? 2 : 0)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-2" aria-hidden>
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              'text-muted-foreground flex-1 text-center text-[11px]',
              highlightLast && i === data.length - 1 && 'text-foreground font-semibold',
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
