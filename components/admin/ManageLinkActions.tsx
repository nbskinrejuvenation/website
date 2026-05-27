'use client'

import { useState } from 'react'
import { getManageBookingUrl } from '@/lib/booking/management-url'

interface Props {
  managementToken: string
  clientPhone?: string | null
}

export function ManageLinkActions({ managementToken, clientPhone }: Props) {
  const [copied, setCopied] = useState(false)
  const manageUrl = getManageBookingUrl(managementToken)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(manageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copy this manage link:', manageUrl)
    }
  }

  const whatsappHref = (() => {
    const digits = clientPhone?.replace(/\D/g, '') ?? ''
    const waNumber = digits.startsWith('61')
      ? digits
      : digits.startsWith('0')
        ? `61${digits.slice(1)}`
        : digits
    if (!waNumber) return null
    const text = encodeURIComponent(
      `Hi! Here is your link to reschedule or cancel your Naturally Beautiful appointment: ${manageUrl}`,
    )
    return `https://wa.me/${waNumber}?text=${text}`
  })()

  return (
    <div className="rounded-sm border border-sand-dark/60 bg-cream-dark/50 p-4">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
        Client self-service link
      </p>
      <p className="mt-2 break-all font-mono text-xs text-ink-muted">{manageUrl}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copyLink} className="btn-outline text-sm">
          {copied ? 'Copied' : 'Copy link'}
        </button>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-sm"
          >
            Send via WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}
