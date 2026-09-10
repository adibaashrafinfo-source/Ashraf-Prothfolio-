import { motion } from 'framer-motion'

import { useSocialLinks } from '@/hooks/use-social-links'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.699 4.61 1.902 6.48L4 29l7.72-1.86A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818a9.76 9.76 0 0 1-4.98-1.363l-.357-.212-4.58 1.104 1.13-4.463-.233-.367A9.77 9.77 0 0 1 5.273 15c0-5.912 4.815-10.727 10.73-10.727 5.913 0 10.727 4.815 10.727 10.727 0 5.913-4.814 10.818-10.726 10.818Zm5.89-8.05c-.322-.161-1.906-.94-2.202-1.048-.295-.108-.51-.161-.725.161-.214.323-.832 1.048-1.02 1.263-.187.215-.375.242-.696.08-.322-.16-1.36-.501-2.591-1.598-.958-.854-1.605-1.908-1.793-2.23-.187-.323-.02-.497.14-.658.145-.144.322-.375.483-.563.161-.187.214-.322.322-.537.107-.215.053-.403-.027-.564-.08-.161-.725-1.749-.994-2.396-.262-.63-.528-.545-.725-.555l-.618-.011c-.215 0-.564.08-.86.403-.295.322-1.127 1.102-1.127 2.688 0 1.586 1.154 3.118 1.315 3.333.161.215 2.272 3.47 5.505 4.866.769.332 1.369.53 1.837.679.772.246 1.474.211 2.03.128.619-.093 1.906-.78 2.175-1.533.268-.752.268-1.397.187-1.532-.08-.134-.294-.215-.616-.376Z" />
    </svg>
  )
}

export function WhatsAppButton() {
  const { links } = useSocialLinks()
  const whatsapp = links.find((l) => l.icon === 'whatsapp')

  if (!whatsapp) return null

  return (
    <motion.a
      href={whatsapp.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1, ease: 'easeOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 sm:right-8 sm:bottom-8"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{ scale: [1, 1.6, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />
      <WhatsAppIcon className="relative size-7" />
    </motion.a>
  )
}
