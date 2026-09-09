import { Link } from 'react-router-dom'
import { Briefcase, Mail, MessageSquareQuote, Share2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminTable } from '@/hooks/use-admin-table'
import type { ContactSubmission, Project, SocialLink, Testimonial } from '@/types'

const cards = [
  { key: 'projects', label: 'Portfolio Projects', icon: Briefcase, to: '/admin/portfolio' },
  {
    key: 'testimonials',
    label: 'Testimonials',
    icon: MessageSquareQuote,
    to: '/admin/testimonials',
  },
  { key: 'social', label: 'Social Links', icon: Share2, to: '/admin/social' },
  { key: 'messages', label: 'Messages', icon: Mail, to: '/admin/messages' },
] as const

export function Dashboard() {
  const projects = useAdminTable<Project>('projects')
  const testimonials = useAdminTable<Testimonial>('testimonials')
  const social = useAdminTable<SocialLink>('social_links')
  const messages = useAdminTable<ContactSubmission>('contact_submissions')

  const counts: Record<(typeof cards)[number]['key'], number> = {
    projects: projects.rows.length,
    testimonials: testimonials.rows.length,
    social: social.rows.length,
    messages: messages.rows.length,
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A quick overview of your site's content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.key} to={c.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                  <c.icon className="size-5" />
                </span>
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold">{counts[c.key]}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
