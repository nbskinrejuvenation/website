import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import { getManageBookingUrl } from '@/lib/booking/management-url'
import { formatConsultationWhen } from '@/lib/email/layout'

export function buildConsultationReminderSms(input: {
  clientName: string
  startsAt: Date
  managementToken?: string | null
  clinicPhone?: string | null
}): string {
  const when = formatConsultationWhen(input.startsAt)
  const firstName = input.clientName.trim().split(/\s+/)[0] || 'there'
  const manage =
    input.managementToken != null
      ? ` Manage: ${getManageBookingUrl(input.managementToken)}`
      : input.clinicPhone
        ? ` Call ${input.clinicPhone} to reschedule.`
        : ''

  return `Hi ${firstName}, reminder: your ${CONSULTATION_DURATION_MINUTES}-min skin consultation at Naturally Beautiful is ${when}.${manage}`
}
