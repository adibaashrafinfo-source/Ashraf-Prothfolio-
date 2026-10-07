export const PROJECT_CATEGORIES = [
  'E-Commerce',
  'SaaS Dashboard',
  'Business Website',
  'Apps',
  'Software',
] as const

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export interface Project {
  id: string
  title: string
  category: ProjectCategory
  description: string
  image_url: string
  project_url: string | null
  created_at: string
}

export interface ClientLogo {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  sort_order: number
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

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'in_progress',
  'confirmed',
  'converted',
  'important',
  'cancelled',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

/** A contact-form submission plus the CRM fields the admin fills in afterwards. */
export interface Lead extends ContactSubmission {
  status: LeadStatus
  phone: string | null
  company: string | null
  project_name: string | null
  project_type: string | null
  progress: number
  project_cost: number | null
  currency: string
  next_follow_up: string | null
  notes: string | null
  updated_at: string
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

export type DocumentKind = 'quotation' | 'invoice'

export const DOCUMENT_TEMPLATES = ['modern', 'minimal', 'bold'] as const
export type DocumentTemplate = (typeof DOCUMENT_TEMPLATES)[number]

export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const
export const INVOICE_STATUSES = ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'] as const
export type DocumentStatus =
  | (typeof QUOTATION_STATUSES)[number]
  | (typeof INVOICE_STATUSES)[number]

export interface DocumentItem {
  id: string
  title: string
  description: string
  quantity: number
  unit_price: number
}

export interface BusinessDocument {
  id: string
  kind: DocumentKind
  doc_number: string
  lead_id: string | null
  source_quotation_id: string | null
  client_name: string
  client_company: string | null
  client_email: string | null
  client_phone: string | null
  client_address: string | null
  project_title: string
  project_details: string | null
  items: DocumentItem[]
  currency: string
  discount: number
  tax_percent: number
  terms: string | null
  notes: string | null
  issue_date: string
  valid_until: string | null
  due_date: string | null
  paid_amount: number
  template: DocumentTemplate
  status: DocumentStatus
  created_at: string
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
