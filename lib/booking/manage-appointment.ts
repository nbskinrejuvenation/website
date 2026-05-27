import { BOOKING_MIN_NOTICE_HOURS } from '@/lib/booking/constants'
import {
  getRescheduleCalendar,
  rescheduleAppointment,
  type RescheduleKind,
} from '@/lib/booking/reschedule-appointment'
import { updateConsultation } from '@/lib/data/consultations-admin'
import { updateTreatmentBooking } from '@/lib/data/treatment-bookings-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ConsultationStatus, TreatmentBookingStatus } from '@/types/database'

export type ManageBookingKind = RescheduleKind

export interface ManageBookingView {
  kind: ManageBookingKind
  label: string
  startsAt: string
  endsAt: string
  status: ConsultationStatus | TreatmentBookingStatus
  canModify: boolean
  modifyBlockedReason: string | null
  amountCents: number | null
  treatmentSlug: string | null
}

interface ResolvedBooking {
  kind: ManageBookingKind
  id: string
  startsAt: Date
  status: ConsultationStatus | TreatmentBookingStatus
  label: string
  amountCents: number | null
  treatmentSlug: string | null
}

const TOKEN_PATTERN = /^[a-f0-9]{48}$/

export function isValidManagementToken(token: string): boolean {
  return TOKEN_PATTERN.test(token)
}

export function getClientModifyEligibility(
  startsAt: Date,
  status: string,
): { canModify: boolean; reason: string | null } {
  if (status !== 'confirmed') {
    if (status === 'cancelled') {
      return { canModify: false, reason: 'This appointment has been cancelled.' }
    }
    if (status === 'pending_payment') {
      return {
        canModify: false,
        reason: 'Complete payment first, or wait for the checkout session to expire.',
      }
    }
    return { canModify: false, reason: 'This appointment can no longer be changed online.' }
  }

  const now = Date.now()
  if (startsAt.getTime() <= now) {
    return { canModify: false, reason: 'This appointment has already passed.' }
  }

  const minNoticeMs = BOOKING_MIN_NOTICE_HOURS * 60 * 60 * 1000
  if (startsAt.getTime() - now < minNoticeMs) {
    return {
      canModify: false,
      reason: `Online changes must be made at least ${BOOKING_MIN_NOTICE_HOURS} hours before your appointment. Please call the clinic.`,
    }
  }

  return { canModify: true, reason: null }
}

async function resolveBookingByToken(token: string): Promise<ResolvedBooking | null> {
  if (!isValidManagementToken(token)) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const [consultationRes, treatmentRes] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select('id, starts_at, status')
      .eq('management_token', token)
      .maybeSingle(),
    supabase
      .from('treatment_bookings')
      .select(
        `
        id,
        starts_at,
        status,
        amount_cents,
        treatment:treatments (title, slug)
      `,
      )
      .eq('management_token', token)
      .maybeSingle(),
  ])

  const hasConsultation = Boolean(consultationRes.data)
  const hasTreatment = Boolean(treatmentRes.data)

  if (hasConsultation && hasTreatment) {
    throw new Error('Ambiguous management token — contact the clinic.')
  }

  if (consultationRes.data) {
    return {
      kind: 'consultation',
      id: consultationRes.data.id,
      startsAt: new Date(consultationRes.data.starts_at),
      status: consultationRes.data.status as ConsultationStatus,
      label: 'Free consultation',
      amountCents: null,
      treatmentSlug: null,
    }
  }

  if (treatmentRes.data) {
    const treatment = Array.isArray(treatmentRes.data.treatment)
      ? treatmentRes.data.treatment[0]
      : treatmentRes.data.treatment
    return {
      kind: 'treatment',
      id: treatmentRes.data.id,
      startsAt: new Date(treatmentRes.data.starts_at),
      status: treatmentRes.data.status as TreatmentBookingStatus,
      label: treatment?.title ?? 'Treatment',
      amountCents: treatmentRes.data.amount_cents,
      treatmentSlug: treatment?.slug ?? null,
    }
  }

  return null
}

function toView(resolved: ResolvedBooking): ManageBookingView {
  const { canModify, reason } = getClientModifyEligibility(resolved.startsAt, resolved.status)
  return {
    kind: resolved.kind,
    label: resolved.label,
    startsAt: resolved.startsAt.toISOString(),
    endsAt: '',
    status: resolved.status,
    canModify,
    modifyBlockedReason: reason,
    amountCents: resolved.amountCents,
    treatmentSlug: resolved.treatmentSlug,
  }
}

export async function getManageBookingByToken(token: string): Promise<ManageBookingView | null> {
  const resolved = await resolveBookingByToken(token)
  if (!resolved) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const table = resolved.kind === 'consultation' ? 'consultation_bookings' : 'treatment_bookings'
  const { data } = await supabase.from(table).select('ends_at').eq('id', resolved.id).single()

  const view = toView(resolved)
  if (data?.ends_at) view.endsAt = data.ends_at
  return view
}

export async function getManageRescheduleCalendar(token: string) {
  const resolved = await resolveBookingByToken(token)
  if (!resolved) return null

  const { canModify, reason } = getClientModifyEligibility(resolved.startsAt, resolved.status)
  if (!canModify) {
    throw new Error(reason ?? 'This appointment cannot be rescheduled online.')
  }

  return getRescheduleCalendar(resolved.kind, resolved.id, { adminOverride: false })
}

export async function cancelBookingByToken(token: string) {
  const resolved = await resolveBookingByToken(token)
  if (!resolved) return null

  const { canModify, reason } = getClientModifyEligibility(resolved.startsAt, resolved.status)
  if (!canModify) {
    throw new Error(reason ?? 'This appointment cannot be cancelled online.')
  }

  if (resolved.kind === 'consultation') {
    const result = await updateConsultation(resolved.id, { status: 'cancelled' })
    return {
      kind: resolved.kind,
      status: result.consultation.status,
      cancellationEmailSent: result.cancellationEmail?.sent ?? false,
      refundIssued: null as boolean | null,
    }
  }

  const result = await updateTreatmentBooking(resolved.id, {
    status: 'cancelled',
    refund: true,
  })
  return {
    kind: resolved.kind,
    status: result.booking.status,
    cancellationEmailSent: result.cancellationEmail?.sent ?? false,
    refundIssued: result.refund?.issued ?? false,
  }
}

export async function rescheduleBookingByToken(
  token: string,
  date: string,
  time: string,
) {
  const resolved = await resolveBookingByToken(token)
  if (!resolved) return null

  const { canModify, reason } = getClientModifyEligibility(resolved.startsAt, resolved.status)
  if (!canModify) {
    throw new Error(reason ?? 'This appointment cannot be rescheduled online.')
  }

  const outcome = await rescheduleAppointment(
    { kind: resolved.kind, id: resolved.id, date, time },
    { adminOverride: false },
  )

  return outcome
}
