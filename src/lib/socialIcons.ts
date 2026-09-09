import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Youtube,
} from 'lucide-react'

import type { SocialIconKey } from '@/types'

export const socialIconMap: Record<SocialIconKey, typeof Facebook> = {
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  whatsapp: MessageCircle,
  twitter: Twitter,
  youtube: Youtube,
  mail: Mail,
  globe: Globe,
}

export const socialIconOptions: Array<{ value: SocialIconKey; label: string }> = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'github', label: 'GitHub' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'mail', label: 'Email' },
  { value: 'globe', label: 'Website' },
]
