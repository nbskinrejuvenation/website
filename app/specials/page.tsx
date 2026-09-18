import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const description = 'Exclusive offers and weekly specials at Naturally Beautiful Skin Rejuvenation.'
export const metadata: Metadata = { title: pageTitle('Specials & Offers'), description, openGraph: openGraphDefaults('Specials & Offers', description), alternates: { canonical: '/specials' } }

function Leaf({ flip = false }: { flip?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 220 95" className={`h-full w-full ${flip ? '-scale-x-100' : ''}`}><g fill="none" stroke="#7e8c73" strokeWidth="2" opacity=".65"><path d="M0 82C60 70 106 46 166 6"/><path d="M42 68C26 44 26 24 35 8c20 14 27 34 7 60ZM78 54C65 30 70 12 84 0c15 18 14 38-6 54ZM115 37c-7-22 2-35 18-42 8 19 2 34-18 42ZM149 20c0-17 10-27 25-29 3 16-6 27-25 29Z" fill="#9eaa95" stroke="none"/></g></svg>
}

export default function SpecialsPage() {
  return <>
    <section className="relative overflow-hidden border-b border-[#dfe2d8] bg-[#f3f4ed] py-4 md:py-5">
      <div className="pointer-events-none absolute -left-5 bottom-0 hidden h-20 w-48 md:block"><Leaf /></div>
      <div className="pointer-events-none absolute -right-5 bottom-0 hidden h-20 w-48 md:block"><Leaf flip /></div>
      <div className="section-container relative z-10 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#a8b19e] text-[#74816c] md:flex" aria-hidden="true">♧</div>
        <p className="max-w-3xl text-center text-[13px] leading-6 text-[#4f554f] md:text-left">Start with a <strong className="font-semibold text-[#28332d]">FREE consultation</strong> to assess your skin and receive a professional recommendation.<br className="hidden lg:block" /> You can also refer a friend, enjoy our current specials and ask family and friends for gift vouchers on special occasions.</p>
        <Link href="/book" className="shrink-0 rounded bg-[#7d8b72] px-7 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6e7d64]">Free Consultation</Link>
      </div>
    </section>

    <main className="bg-[#eef1e8] px-4 pb-16 pt-7 md:pb-20 md:pt-8">
      <div className="mx-auto max-w-[920px] text-center">
        {/* No "Special Offers" eyebrow here: the flyer below opens with that line itself. */}
        <h1 className="font-display text-3xl font-light text-[#252523] md:text-[38px]">Our Gift To You</h1>
        <div className="mx-auto mt-3 h-px w-7 bg-[#c99a90]" />
        {/* The flyer artwork carries the offer copy, so the alt text has to state
            both offers in full: they exist nowhere else on the page. */}
        <figure className="mx-auto mt-5 max-w-[640px] overflow-hidden rounded-xl bg-[#f8f7ef] shadow-[0_12px_32px_rgba(45,45,35,0.10)]">
          <Image
            src="/images/specials-share-the-glow.png"
            alt="Share the Glow. Treat yourself, bring a friend. Bring a Friend: book a treatment for yourself and a friend on the same day and receive 25% off for each of you. Microneedling Special: book a facial microneedling treatment and receive a complimentary neck treatment."
            width={1254}
            height={1254}
            priority
            sizes="(max-width: 700px) 100vw, 640px"
            className="h-auto w-full"
          />
          {/* Only the CTA: the flyer already signs off with "Beautiful Skin Together". */}
          <figcaption className="flex justify-center px-7 pb-7">
            <Link href="/book" className="inline-flex items-center gap-5 rounded bg-[#a36d63] px-6 py-3 text-xs font-medium text-white transition hover:bg-[#8f5e55]">Book Appointment <span aria-hidden="true">→</span></Link>
          </figcaption>
        </figure>
      </div>
    </main>
  </>
}
