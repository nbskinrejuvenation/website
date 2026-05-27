import { notFound } from 'next/navigation'
import { TreatmentBookingSuccess } from '@/components/booking/TreatmentBookingSuccess'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ session_id?: string; booking_id?: string }>
}

export default async function BookTreatmentSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { session_id: sessionId, booking_id: bookingId } = await searchParams

  const treatment = await getBookableTreatmentBySlug(slug)
  if (!treatment) notFound()
  if (!sessionId && !bookingId) notFound()

  return (
    <section className="section-container py-16 md:py-20">
      <TreatmentBookingSuccess
        treatmentTitle={treatment.title}
        sessionId={sessionId}
        bookingId={bookingId}
      />
    </section>
  )
}
