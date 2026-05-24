export interface EmailSendResult {
  sent: boolean
  error: string | null
}

export function emailSkipped(reason: string): EmailSendResult {
  return { sent: false, error: reason }
}

export function emailSent(): EmailSendResult {
  return { sent: true, error: null }
}
