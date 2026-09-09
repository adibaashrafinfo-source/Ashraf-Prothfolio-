import { Megaphone, Palette, Code2 } from 'lucide-react'

export const skillPillars = [
  {
    title: 'Graphic Design',
    icon: Palette,
    description:
      'Crafting brand identities, print, and digital design that communicate clearly and leave a lasting impression.',
    tools: [
      { name: 'Adobe Photoshop', level: 95 },
      { name: 'Adobe Illustrator', level: 92 },
      { name: 'Figma', level: 90 },
      { name: 'Brand Identity', level: 88 },
      { name: 'Canva', level: 85 },
    ],
  },
  {
    title: 'Web Development',
    icon: Code2,
    description:
      'Building fast, accessible, and responsive websites and web apps with modern tooling and clean code.',
    tools: [
      { name: 'React / TypeScript', level: 92 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'Supabase / SQL', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'WordPress', level: 78 },
    ],
  },
  {
    title: 'Digital Marketing',
    icon: Megaphone,
    description:
      'Driving measurable growth through SEO, paid ads, and social strategy tailored to each brand.',
    tools: [
      { name: 'SEO', level: 88 },
      { name: 'Meta & Google Ads', level: 90 },
      { name: 'Social Media Strategy', level: 87 },
      { name: 'Email Marketing', level: 82 },
      { name: 'Analytics', level: 85 },
    ],
  },
]
