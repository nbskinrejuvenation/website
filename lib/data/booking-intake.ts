import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingIntake, BookingIntakeKind } from '@/types/database'

export async function getBookingIntake(
  kind: BookingIntakeKind,
  bookingId: string,
): Promise<BookingIntake | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('booking_intake')
    .select('*')
    .eq('booking_kind', kind)
    .eq('booking_id', bookingId)
    .maybeSingle()

  if (error) throw new Error(`getBookingIntake: ${error.message}`)
  return (data as BookingIntake) ?? null
}

export async function upsertBookingIntake(input: {
  kind: BookingIntakeKind
  bookingId: string
  skin_concerns?: string | null
  medications?: string | null
  allergies?: string | null
  notes?: string | null
}): Promise<BookingIntake> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('booking_intake')
    .upsert(
      {
        booking_kind: input.kind,
        booking_id: input.bookingId,
        skin_concerns: input.skin_concerns?.trim() || null,
        medications: input.medications?.trim() || null,
        allergies: input.allergies?.trim() || null,
        notes: input.notes?.trim() || null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'booking_kind,booking_id' },
    )
    .select('*')
    .single()

  if (error) throw new Error(`upsertBookingIntake: ${error.message}`)
  return data as BookingIntake
}
