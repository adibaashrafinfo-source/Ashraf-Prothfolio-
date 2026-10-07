import { useClientLogos } from '@/hooks/use-client-logos'
import { cn } from '@/lib/utils'
import type { ClientLogo } from '@/types'

function LogoTile({ logo, duplicate = false }: { logo: ClientLogo; duplicate?: boolean }) {
  const img = (
    <img
      src={logo.logo_url}
      alt={logo.name}
      title={logo.name}
      loading="lazy"
      /* object-contain keeps the whole logo visible whatever its source size or ratio */
      className="max-h-12 w-auto max-w-full object-contain"
    />
  )

  return (
    <li
      aria-hidden={duplicate}
      className={cn(
        'border-border bg-card flex h-20 w-40 shrink-0 items-center justify-center rounded-xl border px-5 shadow-sm',
        /* the seamless-loop clone is pointless once the marquee is stopped */
        duplicate && 'motion-reduce:hidden',
      )}
    >
      {logo.website_url ? (
        <a
          href={logo.website_url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex size-full items-center justify-center"
        >
          {img}
        </a>
      ) : (
        img
      )}
    </li>
  )
}

export function ClientLogos() {
  const { logos, loading } = useClientLogos()

  if (loading || logos.length === 0) return null

  return (
    <section
      id="clients"
      aria-label="Clients"
      className="border-border bg-secondary/20 border-y py-10"
    >
      <p className="text-muted-foreground container-px mx-auto mb-6 max-w-6xl text-center text-xs font-semibold tracking-[0.2em] uppercase">
        Trusted by
      </p>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max gap-5 pr-5 animate-[marquee_32s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {logos.map((logo) => (
            <LogoTile key={logo.id} logo={logo} />
          ))}
          {/* duplicate set makes the -50% translate loop seamless */}
          {logos.map((logo) => (
            <LogoTile key={`dup-${logo.id}`} logo={logo} duplicate />
          ))}
        </ul>
      </div>
    </section>
  )
}
