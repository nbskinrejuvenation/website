'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isToolUIPart, getToolName } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function StatusBubble({ label }: { label: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 select-none">NB</div>
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-xs text-ink-muted shadow-card">
        <span className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="block h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </span>
        {label}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  'What treatments do you offer?',
  'How much does HIFU cost?',
  'Best treatment for acne scars?',
  'Book a free consultation',
]

const DEFAULT_PHONE = '0404 203 800'

function toolStatusLabel(name: string): string {
  if (name === 'getAvailableSlots') return 'Checking availability…'
  if (name === 'createConsultation') return 'Creating your booking…'
  return 'Working on it…'
}

function getTextParts(parts: { type: string; text?: string }[]): string {
  return parts
    .filter(p => p.type === 'text' && typeof p.text === 'string')
    .map(p => p.text as string)
    .join('')
}

interface ChatWidgetProps {
  clinicPhone?: string | null
}

export function ChatWidget({ clinicPhone = DEFAULT_PHONE }: ChatWidgetProps) {
  const phone = clinicPhone?.trim() || DEFAULT_PHONE
  const phoneHref = `tel:${phone.replace(/\s/g, '')}`
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), [])
  const { messages, sendMessage, status } = useChat({ transport })

  const isLoading = status === 'submitted' || status === 'streaming'

  const activeToolName = useMemo(() => {
    if (!isLoading) return null
    for (const m of [...messages].reverse()) {
      if (m.role !== 'assistant') continue
      for (const part of (m.parts ?? []) as unknown[]) {
        if (
          isToolUIPart(part as Parameters<typeof isToolUIPart>[0]) &&
          (part as { state?: string }).state !== 'output-available'
        ) {
          return getToolName(part as Parameters<typeof getToolName>[0])
        }
      }
    }
    return null
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  function open() { setIsOpen(true); setHasOpened(true) }
  function close() { setIsOpen(false) }

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  const showSuggestions = messages.length === 0

  return (
    <>
      <div
        role="dialog"
        aria-label="Chat helper — ask questions or book a consultation"
        aria-modal="true"
        className={cn(
          'fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col',
          'overflow-hidden rounded-2xl bg-cream shadow-[0_8px_40px_-8px_rgba(42,38,36,0.18)]',
          'origin-bottom-right transition-all duration-300',
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none',
        )}
      >
        <div className="flex items-center justify-between gap-3 bg-brand-500 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-300/40">
              <span className="text-xs font-semibold text-white select-none">NB</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">Naturally Beautiful</p>
              <p className="text-xs leading-snug text-brand-100">Ask about treatments or book a free visit</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close chat" className="rounded-lg p-1.5 text-brand-100 transition-colors hover:bg-brand-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-[240px] max-h-[400px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 select-none">NB</div>
            <div className="max-w-[92%] space-y-3 rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 text-sm leading-relaxed text-ink shadow-card">
              <p className="font-medium text-ink">Hello — welcome to our website chat.</p>
              <p>You can ask about treatments, prices, or book a <strong>free 30-minute consultation</strong>.</p>
              <p className="text-ink-muted"><strong>How to use it:</strong> tap a suggestion below, or type your question in the box at the bottom and press Send.</p>
            </div>
          </div>

          {showSuggestions && (
            <p className="pl-9 text-xs leading-relaxed text-ink-muted">
              Prefer to speak to someone? Call{' '}
              <a href={phoneHref} className="font-medium text-brand-600 underline hover:no-underline">{phone}</a>.
            </p>
          )}

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pl-9">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => submit(s)} className="rounded-full border border-brand-200 bg-white px-3.5 py-2 text-sm text-brand-600 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map(m => {
            const textContent = getTextParts((m.parts ?? []) as { type: string; text?: string }[])
            return (
              <div key={m.id} className={cn('flex flex-col gap-1', m.role === 'user' && 'items-end')}>
                {textContent && (
                  <div className={cn('flex items-end gap-2', m.role === 'user' && 'flex-row-reverse')}>
                    {m.role === 'assistant' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700 select-none">NB</div>
                    )}
                    <div className={cn(
                      'max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      m.role === 'user' ? 'rounded-br-sm bg-brand-500 text-white' : 'rounded-bl-sm bg-white text-ink shadow-card',
                    )}>
                      {textContent}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {isLoading && <StatusBubble label={activeToolName ? toolStatusLabel(activeToolName) : ''} />}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={e => { e.preventDefault(); submit(input) }} className="flex items-center gap-2 border-t border-sand bg-white px-3 py-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question here…"
            disabled={isLoading}
            aria-label="Type your question"
            className="flex-1 rounded-xl bg-cream px-3.5 py-3 text-base text-ink placeholder:text-ink-faint outline-none transition-shadow focus:ring-2 focus:ring-brand-300 disabled:opacity-60"
          />
          <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
            <SendIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="fixed bottom-[3.75rem] right-4 z-50 flex flex-col items-end">
        <button
          onClick={isOpen ? close : open}
          aria-label={isOpen ? 'Close chat' : 'Open chat — ask about treatments, prices, or book a free consultation'}
          aria-expanded={isOpen}
          className={cn(
            'relative flex items-center justify-center rounded-full shadow-soft',
            'bg-brand-500 text-white transition-all duration-300 hover:bg-brand-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
            isOpen ? 'h-14 w-14' : 'h-16 gap-2 pl-3 pr-5',
          )}
        >
          {isOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <>
              <ChatIcon className="-ml-1 h-5 w-5 shrink-0" />
              <span className="text-left text-sm font-medium leading-tight">
                Questions?
                <br />
                Chat Now.
              </span>
            </>
          )}
          {!hasOpened && !isOpen && (
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 animate-pulse rounded-full bg-rose-400 ring-2 ring-white" />
          )}
        </button>
      </div>
    </>
  )
}
