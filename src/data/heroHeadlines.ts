import { Code2, Megaphone, Palette, Search } from 'lucide-react'

export const heroHeadlines = [
  {
    key: 'web',
    chip: 'Web Development',
    icon: Code2,
    lead: 'Websites that turn',
    accent: 'visitors into customers',
    sub: 'Fast, responsive, conversion-focused sites built with modern tooling and clean code.',
  },
  {
    key: 'marketing',
    chip: 'Digital Marketing',
    icon: Megaphone,
    lead: 'Campaigns that drive',
    accent: 'real business growth',
    sub: 'Paid ads, funnels, and social strategy tuned to the metrics that actually matter.',
  },
  {
    key: 'seo',
    chip: 'SEO',
    icon: Search,
    lead: 'Search rankings that put you',
    accent: 'on page one',
    sub: 'Technical and on-page SEO that earns durable organic traffic, not quick spikes.',
  },
  {
    key: 'design',
    chip: 'Graphics Design',
    icon: Palette,
    lead: 'Brand design that makes you',
    accent: 'impossible to forget',
    sub: 'Logos, identity systems, and visuals crafted to look sharp everywhere they land.',
  },
]

export const HEADLINE_INTERVAL_MS = 3000
