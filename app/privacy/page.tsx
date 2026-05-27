import type { Metadata } from 'next'
import Link from 'next/link'
import { pageTitle } from '@/lib/seo/metadata'

export const metadata: Metadata = {
  title: pageTitle('Privacy policy'),
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <section className="section-container max-w-3xl py-14 md:py-20">
      <p className="eyebrow mb-3">Legal</p>
      <h1 className="section-heading">Privacy policy</h1>
      <div className="prose prose-neutral mt-8 max-w-none text-ink-muted">
        <p>
          Naturally Beautiful Skin Rejuvenation (&quot;we&quot;, &quot;us&quot;) collects personal
          information you provide when booking online, contacting us, or completing a pre-visit form.
        </p>
        <h2 className="font-display text-xl font-light text-ink">What we collect</h2>
        <ul className="list-disc pl-5">
          <li>Name, email, phone number</li>
          <li>Appointment details and optional health-related notes you choose to share</li>
          <li>Payment status (processed by Stripe — we do not store card numbers)</li>
        </ul>
        <h2 className="font-display text-xl font-light text-ink">How we use it</h2>
        <p>
          To confirm appointments, send reminders, manage your booking, and provide skin
          rejuvenation services. We do not sell your data.
        </p>
        <h2 className="font-display text-xl font-light text-ink">Contact</h2>
        <p>
          Questions or requests to access or delete your data:{' '}
          <Link href="/contact" className="text-brand-600 hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
      <Link href="/" className="btn-outline mt-10 inline-flex">
        Back to home
      </Link>
    </section>
  )
}
