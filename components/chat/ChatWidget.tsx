'use client'

import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

// ── Icons (inline SVG — no extra deps) ───────────────────────────────────────

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="h-7 w-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700 select-none">
        NB
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-card">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What treatments do you offer?',
  "How much does HIFU cost?",
  'Best treatment for acne scars?',
  'How do I book a consultation?',
]

// ── Helper: extract plain text from a UIMessage ───────────────────────────────

function getMessageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter(p => p.type === 'text' && typeof p.text === 'string')
    .map(p => p.text as string)
    .join('')
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Stable transport instance — avoids re-creating on every render
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: '/api/chat' }),
    [],
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Auto-scroll on new content
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  function open() {
    setIsOpen(true)
    setHasOpened(true)
  }

  function close() {
    setIsOpen(false)
  }

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit(input)
  }

  function handleSuggestion(text: string) {
    submit(text)
  }

  const showSuggestions = messages.length === 0

  return (
    <>
      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="Chat with us"
        aria-modal="true"
        className={cn(
          'fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col',
          'rounded-2xl bg-cream shadow-[0_8px_40px_-8px_rgba(42,38,36,0.18)] overflow-hidden',
          'transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-95 opacity-0 pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-brand-500 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-brand-300/40 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-white select-none">NB</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">
                Naturally Beautiful
              </p>
              <p className="text-[11px] leading-tight text-brand-100">
                Ask me anything about our treatments
              </p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close chat"
            className="rounded-lg p-1.5 text-brand-100 transition-colors hover:bg-brand-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 min-h-[240px] max-h-[380px]">
          {/* Welcome message */}
          <div className="flex items-end gap-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700 select-none">
              NB
            </div>
            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-card text-sm text-ink leading-relaxed">
              Hi! I&apos;m here to help with questions about our treatments, pricing, or
              booking. What would you like to know? ✨
            </div>
          </div>

          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pl-9">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs text-brand-600 transition-colors hover:bg-brand-50 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Conversation */}
          {messages.map(m => {
            const text = getMessageText(
              (m.parts ?? []) as { type: string; text?: string }[],
            )
            if (!text) return null
            return (
              <div
                key={m.id}
                className={cn(
                  'flex items-end gap-2',
                  m.role === 'user' && 'flex-row-reverse',
                )}
              >
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700 select-none">
                    NB
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-500 text-white'
                      : 'rounded-bl-sm bg-white text-ink shadow-card',
                  )}
                >
                  {text}
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-sand bg-white px-3 py-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={isLoading}
            aria-label="Chat message"
            className="flex-1 rounded-xl bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-60 transition-shadow"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ── Floating trigger button ────────────────────────────────────── */}
      <button
        onClick={isOpen ? close : open}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        className={cn(
          'fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-soft',
          'bg-brand-500 text-white transition-all duration-300 hover:bg-brand-600 hover:scale-105',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        )}
      >
        <span
          className={cn(
            'absolute transition-all duration-200',
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
          )}
        >
          <CloseIcon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            'absolute transition-all duration-200',
            isOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100',
          )}
        >
          <ChatIcon className="h-5 w-5" />
        </span>

        {/* Pulse dot — shown until user opens chat for the first time */}
        {!hasOpened && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rose-400 ring-2 ring-white animate-pulse" />
        )}
      </button>
    </>
  )
}
