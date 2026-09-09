import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { services } from '@/data/services'

export function Services() {
  return (
    <section id="services" className="container-px mx-auto max-w-6xl py-24">
      <SectionHeading
        eyebrow="Services"
        title="What I can do for your brand"
        description="From first sketch to shipped product — end-to-end design, development, and marketing services."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={(i % 3) * 0.1}>
            <Card className="group h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-2 flex size-12 items-center justify-center rounded-xl transition-colors">
                  <service.icon className="size-6" />
                </span>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
