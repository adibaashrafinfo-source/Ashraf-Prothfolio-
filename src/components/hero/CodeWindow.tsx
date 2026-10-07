import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Token = { t: string; c?: string }

const COLORS = {
  key: 'text-[#c792ea]',
  str: 'text-[#c3e88d]',
  fn: 'text-[#82aaff]',
  tag: 'text-[#f78c6c]',
  com: 'text-[#5f7e97]',
  num: 'text-[#f78c6c]',
}

const SNIPPETS: { file: string; lines: Token[][] }[] = [
  {
    file: 'Landing.tsx',
    lines: [
      [{ t: '// conversion-focused landing page', c: COLORS.com }],
      [
        { t: 'export ', c: COLORS.key },
        { t: 'function ', c: COLORS.key },
        { t: 'Landing', c: COLORS.fn },
        { t: '() {' },
      ],
      [
        { t: '  return ', c: COLORS.key },
        { t: '<Hero', c: COLORS.tag },
        { t: ' cta=' },
        { t: '"Get a quote"', c: COLORS.str },
        { t: ' />', c: COLORS.tag },
      ],
      [{ t: '}' }],
      [{ t: '// Lighthouse 100 / 100', c: COLORS.com }],
    ],
  },
  {
    file: 'seo.config.ts',
    lines: [
      [{ t: '// technical SEO baseline', c: COLORS.com }],
      [
        { t: 'export const ', c: COLORS.key },
        { t: 'seo', c: COLORS.fn },
        { t: ' = {' },
      ],
      [{ t: '  schema: ' }, { t: '"LocalBusiness"', c: COLORS.str }, { t: ',' }],
      [
        { t: '  sitemap: ' },
        { t: 'true', c: COLORS.num },
        { t: ', vitals: ' },
        { t: '"pass"', c: COLORS.str },
      ],
      [{ t: '}' }],
    ],
  },
  {
    file: 'growth.ts',
    lines: [
      [{ t: '// campaign performance', c: COLORS.com }],
      [
        { t: 'const ', c: COLORS.key },
        { t: 'roas', c: COLORS.fn },
        { t: ' = revenue / adSpend' },
      ],
      [{ t: 'track', c: COLORS.fn }, { t: '(' }, { t: '"lead_converted"', c: COLORS.str }, { t: ')' }],
      [{ t: 'console', c: COLORS.fn }, { t: '.log(roas) ' }, { t: '// 4.8x', c: COLORS.com }],
      [{ t: '// cost per lead down 38%', c: COLORS.com }],
    ],
  },
]

const TYPE_SPEED_MS = 26
const HOLD_MS = 2200

export function CodeWindow() {
  const reduceMotion = useReducedMotion()
  const [snippet, setSnippet] = React.useState(0)
  const [typed, setTyped] = React.useState(0)

  const current = SNIPPETS[snippet]

  const { lineStarts, lineLengths, total } = React.useMemo(() => {
    const lengths = current.lines.map((line) => line.reduce((s, tok) => s + tok.t.length, 0))
    const starts: number[] = []
    let acc = 0
    lengths.forEach((len) => {
      starts.push(acc)
      acc += len
    })
    return { lineStarts: starts, lineLengths: lengths, total: acc }
  }, [current])

  React.useEffect(() => {
    if (reduceMotion) return
    if (typed < total) {
      const id = setTimeout(() => setTyped((n) => n + 1), TYPE_SPEED_MS)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => {
      setTyped(0)
      setSnippet((s) => (s + 1) % SNIPPETS.length)
    }, HOLD_MS)
    return () => clearTimeout(id)
  }, [typed, total, reduceMotion])

  const visible = reduceMotion ? total : typed
  const activeLine = lineStarts.findIndex(
    (start, i) => visible >= start && visible < start + lineLengths[i],
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-white/60">{current.file}</span>
      </div>

      <div className="min-h-[200px] px-4 py-4 font-mono text-[13px] leading-6 sm:min-h-[220px]">
        {current.lines.map((line, li) => {
          let remaining = Math.max(0, Math.min(lineLengths[li], visible - lineStarts[li]))

          return (
            <div key={li} className="flex gap-3">
              <span className="w-4 shrink-0 text-right text-white/25 select-none">{li + 1}</span>
              <span className="min-w-0 break-all">
                {line.map((tok, ti) => {
                  const take = Math.min(tok.t.length, remaining)
                  remaining -= take
                  if (take <= 0) return null
                  return (
                    <span key={ti} className={tok.c ?? 'text-[#d6deeb]'}>
                      {tok.t.slice(0, take)}
                    </span>
                  )
                })}
                {!reduceMotion && activeLine === li && (
                  <motion.span
                    aria-hidden
                    className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-[#82aaff]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
