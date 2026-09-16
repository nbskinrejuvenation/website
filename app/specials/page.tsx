import type { Metadata } from 'next'
import Link from 'next/link'
import { getSpecials } from '@/lib/data/specials'
import { getSiteSettings } from '@/lib/data/site-settings'
import { SpecialCard } from '@/components/sections/SpecialCard'
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const description = 'Exclusive offers and weekly specials at Naturally Beautiful Skin Rejuvenation.'
export const metadata: Metadata = { title: pageTitle('Specials & Offers'), description, openGraph: openGraphDefaults('Specials & Offers', description), alternates: { canonical: '/specials' } }

export default async function SpecialsPage() {
  const [specials, settings] = await Promise.all([getSpecials(), getSiteSettings()])
  return <>
    <section className="border-b border-[#d9ded1] bg-[#f3f5ef] py-4 md:py-5">
      <div className="section-container flex flex-col items-center justify-center gap-3 text-center md:flex-row md:gap-6">
        <p className="max-w-4xl text-sm leading-relaxed text-ink/75 md:text-[15px]">Start with a <strong className="font-semibold text-ink">FREE consultation</strong> to assess your skin and receive a professional recommendation. You can also refer a friend, enjoy our current specials and ask family and friends for gift vouchers on special occasions.</p>
        <Link href="/book" className="shrink-0 rounded-md bg-[#7f8f76] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#6f8067]">Free Consultation</Link>
      </div>
    </section>

    <section className="bg-[#fbfaf7] py-10 md:py-14">
      <div className="section-container text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#9b6c63]">Special Offers</p>
        <h1 className="font-display text-3xl font-light text-ink md:text-4xl">Our Gift To You</h1>
        <div className="mx-auto mt-4 h-px w-12 bg-[#c9a39b]" />
        <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[1.25rem] border border-[#ebe4dc] bg-white shadow-soft">
          <img src="/images/share-the-glow-special.svg" alt="Share the Glow specials: 25% off each when booking with a friend, and a complimentary neck treatment with facial microneedling." className="h-auto w-full" />
          <div className="bg-white px-6 py-6">
            <Link href="/book" className="inline-flex min-w-48 items-center justify-center rounded-md bg-[#9b6c63] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#875c54]">Book Appointment</Link>
          </div>
        </div>
      </div>
    </section>

    {specials.length > 0 && <section className="section-container py-12"><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{specials.map(special => <SpecialCard key={special.id} special={special} />)}</div></section>}
    <InstagramSection {...instagramSectionFromSettings(settings)} />
    <CTABanner heading="Book your free consultation" body="Ready to treat yourself? Book a free consultation and discover which treatment is right for you." ctaLabel="Book Now" ctaHref="/book" phone={settings.phone ?? undefined} />
  </>
}
