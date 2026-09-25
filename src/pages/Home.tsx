import * as React from 'react'
import { useLocation } from 'react-router-dom'

import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Services } from '@/sections/Services'
import { Portfolio } from '@/sections/Portfolio'
import { Stats } from '@/sections/Stats'
import { Testimonials } from '@/sections/Testimonials'
import { Contact } from '@/sections/Contact'

export function Home() {
  const location = useLocation()

  React.useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Services />
      <Portfolio />
      <Stats />
      <Testimonials />
      <Contact />
    </>
  )
}
