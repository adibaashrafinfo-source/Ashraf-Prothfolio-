import * as React from 'react'

import type { ToastActionElement } from '@/components/ui/toast'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToastVariant = 'default' | 'destructive'

export type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: ToastVariant
  open: boolean
}

type State = { toasts: ToasterToast[] }

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'REMOVE_TOAST'; id: string }

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case 'DISMISS_TOAST':
      return {
        toasts: state.toasts.map((t) => (t.id === action.id ? { ...t, open: false } : t)),
      }
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) }
  }
}

function scheduleRemoval(id: string) {
  setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), TOAST_REMOVE_DELAY)
}

type ToastInput = Omit<ToasterToast, 'id' | 'open'>

function toast(input: ToastInput) {
  const id = genId()
  dispatch({ type: 'ADD_TOAST', toast: { ...input, id, open: true } })
  scheduleRemoval(id)
  return id
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (id: string) => dispatch({ type: 'DISMISS_TOAST', id }),
  }
}

export { useToast, toast }
