import { Outlet } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { ScrollProgress } from '@/components/ScrollProgress'
import { useSmoothScroll } from '@/hooks/use-smooth-scroll'

export function Layout() {
  useSmoothScroll()

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </>
  )
}
