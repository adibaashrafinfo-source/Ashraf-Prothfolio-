import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { useToast } from '@/hooks/use-toast'
import { contactSchema, type ContactFormValues } from '@/lib/contactSchema'
import { supabase } from '@/lib/supabaseClient'
import { site } from '@/data/site'

const contactInfo = [
  { icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: 'Phone', value: site.phone, href: `tel:${site.phone.replace(/\s+/g, '')}` },
  { icon: MapPin, label: 'Location', value: site.location, href: null },
]

export function Contact() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) })

  const onSubmit = React.useCallback(
    async (values: ContactFormValues) => {
      if (!supabase) {
        toast({
          variant: 'destructive',
          title: 'Not configured',
          description:
            'Supabase is not connected yet — please try again later or email me directly.',
        })
        return
      }

      const { error } = await supabase.from('contact_submissions').insert(values)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: 'Your message could not be sent. Please try again in a moment.',
        })
        return
      }

      toast({
        title: 'Message sent!',
        description: "Thanks for reaching out — I'll get back to you soon.",
      })
      reset()
    },
    [reset, toast],
  )

  return (
    <section id="contact" className="container-px mx-auto max-w-6xl py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build something great together"
        description="Have a project in mind? Fill out the form or reach out directly — I usually reply within a day."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="What's this about?"
                {...register('subject')}
                aria-invalid={!!errors.subject}
              />
              {errors.subject && (
                <p className="text-destructive text-xs">{errors.subject.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell me about your project..."
                {...register('message')}
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <p className="text-destructive text-xs">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-fit gap-2">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-6 lg:col-span-2">
          <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6">
            {contactInfo.map((info) => (
              <div key={info.label} className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                  <info.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="hover:text-primary truncate text-sm font-medium">
                      {info.value}
                    </a>
                  ) : (
                    <p className="truncate text-sm font-medium">{info.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              {site.social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.name}
                  className="border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="border-border overflow-hidden rounded-2xl border shadow-sm">
            <iframe
              title="Location map"
              src={site.mapEmbedSrc}
              width="100%"
              height="220"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
