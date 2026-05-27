import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ManageAppointment } from '@/components/booking/ManageAppointment'
import {
  getManageBookingByToken,
  isValidManagementToken,
} from '@/lib/booking/manage-appointment'
import { getSiteSettings } from '@/lib/data/site-settings'
import { pageTitle } from '@/lib/seo/metadata'

interface Props {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: pageTitle('Manage appointment'),
  robots: { index: false, follow: false },
}

export default async function ManageBookingPage({ params }: Props) {
  const { token } = await params

  if (!isValidManagementToken(token)) {
    notFound()
  }

  const booking = await getManageBookingByToken(token)
  if (!booking) {
    notFound()
  }

  const settings = await getSiteSettings()

  return (
    <>
      <section className="border-b border-sand-dark/50 bg-cream-dark py-10 md:py-12">
        <div className="section-container text-center">
          <p className="eyebrow mb-2">Manage booking</p>
          <h1 className="section-heading">Your appointment</h1>
        </div>
      </section>

      <section className="section-container py-10 md:py-14">
        <ManageAppointment
          token={token}
          initialBooking={booking}
          clinicPhone={settings.phone ?? undefined}
        />
        <p className="mx-auto mt-10 max-w-lg text-center text-xs text-ink-faint">
          This link is private. Do not share it.{' '}
          <Link href="/" className="text-brand-600 hover:underline">
            Back to website
          </Link>
        </p>
      </section>
    </>
  )
}
