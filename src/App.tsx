import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Services } from '@/sections/Services'
import { Portfolio } from '@/sections/Portfolio'
import { Stats } from '@/sections/Stats'
import { Testimonials } from '@/sections/Testimonials'
import { Contact } from '@/sections/Contact'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Services />
        <Portfolio />
        <Stats />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Toaster />
    </>
  )
}

export default App
