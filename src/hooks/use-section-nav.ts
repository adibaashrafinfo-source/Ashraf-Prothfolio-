import { useNavigate, useLocation } from 'react-router-dom'

import { getLenis } from '@/hooks/use-smooth-scroll'

export function useSectionNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const goToSection = (href: string) => {
    if (location.pathname === '/') {
      const target = document.querySelector<HTMLElement>(href)
      if (!target) return
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.2 })
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      navigate(`/${href}`)
    }
  }

  return { goToSection }
}
