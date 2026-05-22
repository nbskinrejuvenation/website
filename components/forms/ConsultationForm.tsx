'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  treatment_interest: z.string().optional(),
  message: z.string().max(2000).optional(),
})

type FormData = z.infer<typeof schema>

const TREATMENT_OPTIONS = [
  'Face treatments',
  'Body treatments',
  'Tattoo removal',
  'Not sure — need advice',
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ConsultationForm() {
  const [status, setStatus] = useState<Status>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source_page: window.location.pathname,
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-sm bg-brand-50 p-8 text-center">
        <p className="text-lg font-semibold text-brand-600">Thank you!</p>
        <p className="mt-2 text-sm text-neutral-600">
          We've received your message and will be in touch shortly to confirm
          your free consultation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field label="Your name *" error={errors.full_name?.message}>
        <input
          {...register('full_name')}
          type="text"
          autoComplete="name"
          placeholder="Lilian Smith"
          className={inputClass(!!errors.full_name)}
        />
      </Field>

      <Field label="Email address *" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field label="Phone number" error={errors.phone?.message}>
        <input
          {...register('phone')}
          type="tel"
          autoComplete="tel"
          placeholder="0400 000 000"
          className={inputClass(!!errors.phone)}
        />
      </Field>

      <Field label="Interested in" error={undefined}>
        <select {...register('treatment_interest')} className={inputClass(false)}>
          <option value="">Select a category…</option>
          {TREATMENT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register('message')}
          rows={4}
          placeholder="Tell us about your skin concerns or questions…"
          className={inputClass(!!errors.message)}
        />
      </Field>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again or call us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return [
    'w-full border px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400',
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
    hasError ? 'border-red-400' : 'border-neutral-300',
  ].join(' ')
}
