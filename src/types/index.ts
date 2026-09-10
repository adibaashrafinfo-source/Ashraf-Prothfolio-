export type ProjectCategory = 'E-Commerce' | 'Software'

export interface Project {
  id: string
  title: string
  category: ProjectCategory
  description: string
  image_url: string
  project_url: string | null
  created_at: string
}

export interface Testimonial {
  id: string
  client_name: string
  client_role: string
  client_avatar_url: string | null
  message: string
  rating: number
  created_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export type ContactSubmissionInput = Pick<
  ContactSubmission,
  'name' | 'email' | 'subject' | 'message'
>

export interface SiteSettings {
  id: string
  name: string
  short_name: string
  title: string
  tagline: string
  short_bio: string
  about: string
  years_experience: number
  projects_completed: number
  happy_clients: number
  awards_won: number
  location: string
  email: string
  phone: string
  resume_url: string
  map_embed_src: string
  logo_text: string
  logo_image_url: string | null
  updated_at: string
}

export type SocialIconKey =
  | 'facebook'
  | 'linkedin'
  | 'instagram'
  | 'github'
  | 'whatsapp'
  | 'twitter'
  | 'youtube'
  | 'mail'
  | 'globe'

export interface SocialLink {
  id: string
  name: string
  icon: SocialIconKey
  href: string
  sort_order: number
  created_at: string
}
