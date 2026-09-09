import type { SiteSettings, SocialLink } from '@/types'

export const defaultSiteSettings: Omit<SiteSettings, 'id' | 'updated_at'> = {
  name: 'Ashraful Islam',
  short_name: 'Arif',
  title: 'Founder & CEO, Abrar IT',
  tagline: 'I help brands grow with design, code, and marketing that convert.',
  about:
    "I'm Ashraful Islam, founder and CEO of Abrar IT — a creative technology studio based in Dhaka. Over the past several years I've helped startups and local businesses turn ideas into polished brands, fast websites, and marketing campaigns that actually move the needle. My work sits at the intersection of graphic design, web development, and digital marketing, which means every project I touch is built to look great, run fast, and grow on purpose.",
  years_experience: 10,
  projects_completed: 300,
  happy_clients: 200,
  awards_won: 5,
  location: 'Dhaka, Bangladesh',
  email: 'asrafulislam2000@gmail.com',
  phone: '01719-686459',
  resume_url: '/cv.pdf',
  map_embed_src:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d234550.7!2d90.35!3d23.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8aac6bc0e51%3A0x8fdb2782f04ff859!2sDhaka!5e0!3m2!1sen!2sbd',
  logo_text: 'Arif',
  logo_image_url: null,
}

export const defaultSocialLinks: Array<Pick<SocialLink, 'name' | 'icon' | 'href' | 'sort_order'>> =
  [
    {
      name: 'Facebook',
      icon: 'facebook',
      href: 'https://www.facebook.com/ashraf.arif2000',
      sort_order: 0,
    },
    { name: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/', sort_order: 1 },
    { name: 'Instagram', icon: 'instagram', href: 'https://instagram.com/', sort_order: 2 },
    { name: 'GitHub', icon: 'github', href: 'https://github.com/', sort_order: 3 },
    { name: 'WhatsApp', icon: 'whatsapp', href: 'https://wa.me/8801719686459', sort_order: 4 },
  ]

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]
