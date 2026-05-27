/** E.164 for Australia (+61…) */
export function normalizeAuPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('61') && digits.length === 11) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+61${digits.slice(1)}`
  if (digits.length === 9 && !digits.startsWith('0')) return `+61${digits}`
  return null
}

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim(),
  )
}
