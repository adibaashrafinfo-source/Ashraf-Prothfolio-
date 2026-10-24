import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  /** This modal contains a print-area and should print cleanly on its own, with the page behind it hidden. */
  printable?: boolean
}

export function Modal({ open, onClose, title, description, children, className, printable }: ModalProps) {
  const titleId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (printable) document.body.classList.add('modal-printing')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.classList.remove('modal-printing')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, printable])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 print:static print:block print:bg-transparent print:p-0 print:backdrop-blur-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-card border-border flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl border shadow-xl sm:rounded-2xl print:max-h-none print:w-auto print:max-w-none print:rounded-none print:border-0 print:shadow-none',
          className,
        )}
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 py-4 print:hidden">
          <div>
            <h2 id={titleId} className="font-display text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:bg-secondary hover:text-foreground -mr-2 rounded-full p-2"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 print:overflow-visible print:p-0">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
