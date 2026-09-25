import * as React from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

import { Hero } from '@/sections/Hero'
import { Contact } from '@/sections/Contact'
import { StackSection } from '@/components/stack/StackSection'
import { StackCard } from '@/components/stack/StackCard'
import { AboutContent } from '@/sections/stack/AboutContent'
import { SkillsContent } from '@/sections/stack/SkillsContent'
import { ServicesContent } from '@/sections/stack/ServicesContent'
import { PortfolioContent } from '@/sections/stack/PortfolioContent'
import { StatsContent } from '@/sections/stack/StatsContent'
import { TestimonialsContent } from '@/sections/stack/TestimonialsContent'
import { SkillsCover } from '@/sections/stack/covers/SkillsCover'
import { ServicesCover } from '@/sections/stack/covers/ServicesCover'
import { PortfolioCover } from '@/sections/stack/covers/PortfolioCover'

const STACK_CARDS = [
  { id: 'about', title: 'Design-minded builder, growth-focused thinker', tag: 'About' },
  { id: 'skills', title: 'Three disciplines, one focused outcome', tag: 'Skills' },
  { id: 'services', title: 'What I can do for your brand', tag: 'Services' },
  { id: 'portfolio', title: 'Selected work', tag: 'Portfolio' },
  { id: 'stats', title: 'Results that speak for themselves', tag: 'Stats' },
  { id: 'testimonials', title: 'What clients say', tag: 'Testimonials' },
] as const

export function Home() {
  const location = useLocation()
  const heroRef = React.useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['end end', 'end start'],
  })
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.95])
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0.4])

  const scrollToNext = React.useCallback(() => {
    window.scrollBy({ top: window.innerHeight * 0.92, behavior: 'smooth' })
  }, [])

  React.useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <>
      <motion.div ref={heroRef} style={reduceMotion ? undefined : { scale: heroScale, opacity: heroOpacity }}>
        <Hero />
      </motion.div>

      <StackSection total={STACK_CARDS.length}>
        <StackCard
          id="about"
          index={0}
          meta="Section 01 · About"
          title={STACK_CARDS[0].title}
          tag={STACK_CARDS[0].tag}
          cover={{ type: 'image', src: '/profile-about.jpg', alt: 'Portrait' }}
          onMore={scrollToNext}
        >
          <AboutContent />
        </StackCard>

        <StackCard
          id="skills"
          index={1}
          meta="Section 02 · Skills"
          title={STACK_CARDS[1].title}
          tag={STACK_CARDS[1].tag}
          cover={{ type: 'custom', render: <SkillsCover /> }}
          onMore={scrollToNext}
        >
          <SkillsContent />
        </StackCard>

        <StackCard
          id="services"
          index={2}
          meta="Section 03 · Services"
          title={STACK_CARDS[2].title}
          tag={STACK_CARDS[2].tag}
          cover={{ type: 'custom', render: <ServicesCover /> }}
          onMore={scrollToNext}
        >
          <ServicesContent />
        </StackCard>

        <StackCard
          id="portfolio"
          index={3}
          meta="Section 04 · Portfolio"
          title={STACK_CARDS[3].title}
          tag={STACK_CARDS[3].tag}
          cover={{ type: 'custom', render: <PortfolioCover /> }}
          onMore={scrollToNext}
        >
          <PortfolioContent />
        </StackCard>

        <StackCard
          id="stats"
          index={4}
          meta="Section 05 · Stats"
          title={STACK_CARDS[4].title}
          tag={STACK_CARDS[4].tag}
          cover={{ type: 'gradient', className: 'liquid-mesh liquid-warm' }}
          onMore={scrollToNext}
        >
          <StatsContent />
        </StackCard>

        <StackCard
          id="testimonials"
          index={5}
          meta="Section 06 · Testimonials"
          title={STACK_CARDS[5].title}
          tag={STACK_CARDS[5].tag}
          cover={{ type: 'gradient', className: 'liquid-mesh liquid-rose' }}
          onMore={scrollToNext}
        >
          <TestimonialsContent />
        </StackCard>
      </StackSection>

      <Contact />
    </>
  )
}
