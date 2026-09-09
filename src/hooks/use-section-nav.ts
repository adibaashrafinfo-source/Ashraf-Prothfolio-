import { useNavigate, useLocation } from 'react-router-dom'

export function useSectionNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const goToSection = (href: string) => {
    if (location.pathname === '/') {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/${href}`)
    }
  }

  return { goToSection }
}
