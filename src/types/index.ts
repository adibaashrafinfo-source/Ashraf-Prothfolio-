export type ProjectCategory = 'Graphic Design' | 'Web Development' | 'Digital Marketing'

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
  name: string
  email: string
  subject: string
  message: string
}
