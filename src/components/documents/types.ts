import type { BusinessDocument } from '@/types'

export interface CompanyInfo {
  name: string
  tagline: string
  email: string
  phone: string
  address: string
  logoUrl: string | null
  logoText: string
}

export interface TemplateProps {
  doc: BusinessDocument
  company: CompanyInfo
}
