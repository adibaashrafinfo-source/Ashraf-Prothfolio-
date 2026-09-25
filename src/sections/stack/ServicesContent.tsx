import { services } from '@/data/services'

export function ServicesContent() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {services.map((service) => (
        <div
          key={service.title}
          className="border-border bg-background/60 flex items-start gap-3 rounded-xl border p-3"
        >
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <service.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{service.title}</p>
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
