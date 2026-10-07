import { BoldTemplate } from '@/components/documents/templates/BoldTemplate'
import { MinimalTemplate } from '@/components/documents/templates/MinimalTemplate'
import { ModernTemplate } from '@/components/documents/templates/ModernTemplate'
import { useSiteSettings } from '@/hooks/use-site-settings'
import type { CompanyInfo } from '@/components/documents/types'
import type { BusinessDocument } from '@/types'

export function useCompanyInfo(): CompanyInfo {
  const { settings } = useSiteSettings()
  return {
    name: settings.name,
    tagline: settings.title,
    email: settings.email,
    phone: settings.phone,
    address: settings.location,
    logoUrl: settings.logo_image_url,
    logoText: settings.logo_text,
  }
}

export function DocumentPreview({ doc }: { doc: BusinessDocument }) {
  const company = useCompanyInfo()

  if (doc.template === 'minimal') return <MinimalTemplate doc={doc} company={company} />
  if (doc.template === 'bold') return <BoldTemplate doc={doc} company={company} />
  return <ModernTemplate doc={doc} company={company} />
}
