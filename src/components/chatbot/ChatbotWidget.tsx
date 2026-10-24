import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ApiError, apiGet, apiPost, isApiConfigured } from '@/lib/apiClient'
import { chatbotFallback, chatbotGreeting, chatbotTopics, type ChatbotTopic } from '@/data/chatbot'
import { cn } from '@/lib/utils'

type Turn =
  | { kind: 'bot'; id: string; text: string }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'thinking'; id: string }
  | { kind: 'menu'; id: string; topicIds: string[] }
  | { kind: 'lead-form'; id: string; prefill: string }
  | { kind: 'lead-sent'; id: string }

let turnCounter = 0
function nextId() {
  turnCounter += 1
  return `t${turnCounter}`
}

const ALL_TOPIC_IDS = chatbotTopics.map((t) => t.id)

function topicById(id: string): ChatbotTopic | undefined {
  return chatbotTopics.find((t) => t.id === id)
}

export function ChatbotWidget() {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = React.useState(false)
  const [aiEnabled, setAiEnabled] = React.useState<boolean | null>(null)
  const [draft, setDraft] = React.useState('')
  const [asking, setAsking] = React.useState(false)
  const [turns, setTurns] = React.useState<Turn[]>(() => [
    { kind: 'bot', id: nextId(), text: chatbotGreeting },
    { kind: 'menu', id: nextId(), topicIds: ALL_TOPIC_IDS },
  ])
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [open, turns])

  React.useEffect(() => {
    if (!isApiConfigured()) {
      setAiEnabled(false)
      return
    }
    let cancelled = false
    apiGet<{ enabled: boolean }>('/chatbot/status')
      .then((res) => {
        if (!cancelled) setAiEnabled(res.enabled)
      })
      .catch(() => {
        if (!cancelled) setAiEnabled(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = () => {
    setOpen((v) => !v)
    setHasOpenedOnce(true)
  }

  const askTopic = (topic: ChatbotTopic) => {
    setTurns((prev) => [
      ...prev,
      { kind: 'user', id: nextId(), text: topic.label },
      { kind: 'bot', id: nextId(), text: topic.answer },
      {
        kind: 'menu',
        id: nextId(),
        topicIds: topic.relatedIds?.length ? topic.relatedIds : ALL_TOPIC_IDS,
      },
    ])
  }

  const showFallback = () => {
    setTurns((prev) => [...prev, { kind: 'bot', id: nextId(), text: chatbotFallback }])
  }

  const openLeadForm = (topicLabel?: string) => {
    setTurns((prev) => [
      ...prev,
      { kind: 'user', id: nextId(), text: 'Get a quote' },
      {
        kind: 'lead-form',
        id: nextId(),
        prefill: topicLabel ? `I'm interested in: ${topicLabel}. ` : '',
      },
    ])
  }

  const askAi = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = draft.trim()
    if (!question || asking) return
    setDraft('')

    const history = turns
      .filter((t): t is Extract<Turn, { kind: 'bot' | 'user' }> => t.kind === 'bot' || t.kind === 'user')
      .slice(-8)
      .map((t) => ({ role: t.kind === 'user' ? 'user' : 'assistant', content: t.text }))

    const thinkingId = nextId()
    setTurns((prev) => [
      ...prev,
      { kind: 'user', id: nextId(), text: question },
      { kind: 'thinking', id: thinkingId },
    ])
    setAsking(true)
    try {
      const res = await apiPost<{ reply: string }>('/chatbot/ask', { message: question, history })
      setTurns((prev) =>
        prev.map((t) => (t.id === thinkingId ? { kind: 'bot', id: thinkingId, text: res.reply } : t)),
      )
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Sorry, I couldn't reach the AI assistant. Please try again or get a quote below."
      setTurns((prev) => prev.map((t) => (t.id === thinkingId ? { kind: 'bot', id: thinkingId, text: message } : t)))
    } finally {
      setAsking(false)
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Close chat' : 'Chat with us'}
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2, ease: 'easeOut' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed right-5 bottom-24 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 sm:right-8 sm:bottom-28"
      >
        {!hasOpenedOnce && (
          <motion.span
            aria-hidden
            className="bg-primary absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.6, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-5 bottom-[9.5rem] z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:right-8 sm:bottom-48"
            role="dialog"
            aria-label="Chat assistant"
          >
            <div className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-3.5">
              <Sparkles className="size-4.5" />
              <div>
                <p className="text-sm font-semibold">Ask Arif's assistant</p>
                <p className="text-xs opacity-80">
                  {aiEnabled ? 'Ask anything, or pick a topic below' : 'Usually replies within a day'}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {turns.map((turn) => (
                <ChatTurn
                  key={turn.id}
                  turn={turn}
                  onPickTopic={(id) => {
                    const topic = topicById(id)
                    if (topic) askTopic(topic)
                    else showFallback()
                  }}
                  onGetQuote={() => openLeadForm()}
                  onSubmitLead={async (values) => {
                    if (!isApiConfigured()) {
                      toast({
                        variant: 'destructive',
                        title: 'Not connected',
                        description: 'Please WhatsApp or email me directly for now.',
                      })
                      return false
                    }
                    try {
                      await apiPost('/contact', {
                        name: values.name,
                        email: values.email,
                        phone: values.phone || undefined,
                        subject: 'Chatbot inquiry',
                        message: values.message,
                      })
                      setTurns((prev) => [...prev, { kind: 'lead-sent', id: nextId() }])
                      return true
                    } catch (err) {
                      toast({
                        variant: 'destructive',
                        title: 'Could not send',
                        description: err instanceof ApiError ? err.message : 'Please try again.',
                      })
                      return false
                    }
                  }}
                />
              ))}
            </div>

            {aiEnabled ? (
              <form onSubmit={askAi} className="flex items-center gap-2 border-t px-3 py-2.5">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask me anything…"
                  maxLength={600}
                  disabled={asking}
                  aria-label="Ask a question"
                  className="h-9 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  className="size-9 shrink-0"
                  disabled={asking || !draft.trim()}
                >
                  {asking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </form>
            ) : (
              <div className="border-t px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => openLeadForm()}
                  className="text-primary hover:text-primary/80 w-full text-center text-xs font-semibold"
                >
                  Skip the chat — get a quote directly →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ChatTurn({
  turn,
  onPickTopic,
  onGetQuote,
  onSubmitLead,
}: {
  turn: Turn
  onPickTopic: (id: string) => void
  onGetQuote: () => void
  onSubmitLead: (values: {
    name: string
    email: string
    phone: string
    message: string
  }) => Promise<boolean>
}) {
  if (turn.kind === 'bot') {
    return (
      <div className="bg-secondary text-foreground max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-snug">
        {turn.text}
      </div>
    )
  }

  if (turn.kind === 'user') {
    return (
      <div className="bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm leading-snug">
        {turn.text}
      </div>
    )
  }

  if (turn.kind === 'thinking') {
    return (
      <div className="bg-secondary flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
        <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" />
      </div>
    )
  }

  if (turn.kind === 'menu') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {turn.topicIds.map((id) => {
          const topic = topicById(id)
          if (!topic) return null
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPickTopic(id)}
              className="border-primary/30 text-primary hover:bg-primary/10 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              {topic.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={onGetQuote}
          className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold"
        >
          Get a quote →
        </button>
      </div>
    )
  }

  if (turn.kind === 'lead-form') {
    return <LeadForm prefill={turn.prefill} onSubmit={onSubmitLead} />
  }

  return (
    <div className="bg-secondary text-foreground max-w-[90%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-snug">
      Thanks! I've sent this to Arif — he'll reply at the email you gave within a day. 🎉
    </div>
  )
}

function LeadForm({
  prefill,
  onSubmit,
}: {
  prefill: string
  onSubmit: (values: {
    name: string
    email: string
    phone: string
    message: string
  }) => Promise<boolean>
}) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [message, setMessage] = React.useState(prefill)
  const [submitting, setSubmitting] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || sent) return
    setSubmitting(true)
    const ok = await onSubmit({ name, email, phone, message })
    setSubmitting(false)
    if (ok) setSent(true)
  }

  if (sent) return null

  return (
    <form
      onSubmit={submit}
      className="bg-secondary/60 flex flex-col gap-2.5 rounded-2xl rounded-bl-sm border p-3.5"
    >
      <p className="text-xs font-semibold">Tell me a bit about your project</p>
      <div className="flex flex-col gap-1">
        <Label htmlFor="bot-name" className="text-xs">
          Name
        </Label>
        <Input
          id="bot-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="bot-email" className="text-xs">
            Email
          </Label>
          <Input
            id="bot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="bot-phone" className="text-xs">
            Phone (optional)
          </Label>
          <Input
            id="bot-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="bot-message" className="text-xs">
          What do you need?
        </Label>
        <Textarea
          id="bot-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          className={cn('min-h-20 text-sm')}
        />
      </div>
      <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
        {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        Send
      </Button>
    </form>
  )
}
