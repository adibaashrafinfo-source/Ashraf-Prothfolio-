export interface ChatbotTopic {
  id: string
  label: string
  answer: string
  relatedIds?: string[]
}

export const chatbotTopics: ChatbotTopic[] = [
  {
    id: 'services',
    label: 'What services do you offer?',
    answer:
      "I build full-stack websites, admin dashboards, CRM/business tools and e-commerce stores — mainly React/Next.js on the frontend with PHP or Node on the backend. I also do UI/UX design and ongoing maintenance for existing sites.",
    relatedIds: ['process', 'pricing'],
  },
  {
    id: 'pricing',
    label: 'How does pricing work?',
    answer:
      "Pricing depends on scope — a landing page, a full business site, or a custom CRM/dashboard each cost differently. I usually quote a fixed project price after a short requirement chat, and most projects start with an advance payment, then milestone-based installments.",
    relatedIds: ['process', 'quote'],
  },
  {
    id: 'process',
    label: 'How does the project process work?',
    answer:
      "Requirement Analysis → UI/UX Design → Development → Content & Testing → Deployment. You get a private client dashboard where you can track every stage live, approve designs, and see payments — no guessing what's happening.",
    relatedIds: ['timeline', 'pricing'],
  },
  {
    id: 'timeline',
    label: 'How long does a project take?',
    answer:
      "A simple business website usually takes 1–2 weeks. A custom dashboard, CRM or e-commerce store typically takes 3–6 weeks depending on features. I'll give you an exact timeline once I know your requirements.",
    relatedIds: ['process', 'quote'],
  },
  {
    id: 'portfolio',
    label: 'Can I see your past work?',
    answer:
      "Of course — scroll down to the Portfolio section on this page to see recent projects with live links. If you'd like examples closer to your industry, tell me a bit about your project and I'll point you to the most relevant ones.",
    relatedIds: ['quote'],
  },
]

export const chatbotGreeting =
  "Hi! I'm Arif's assistant 👋 Ask me about services, pricing, or how projects work — or jump straight to getting a quote."

export const chatbotFallback =
  "I can only answer from the menu below for now — pick a topic, or tap \"Get a quote\" and I'll have Arif reply personally."
