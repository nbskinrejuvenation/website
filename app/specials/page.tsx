import type { Metadata } from 'next'
import Link from 'next/link'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const description = 'Exclusive offers and weekly specials at Naturally Beautiful Skin Rejuvenation.'
export const metadata: Metadata = { title: pageTitle('Specials & Offers'), description, openGraph: openGraphDefaults('Specials & Offers', description), alternates: { canonical: '/specials' } }

const flyer = 'https://chatgpt.com/backend-api/estuary/content?id=file_00000000242881faa533ce83965e4f80&ts=497102&p=fs&cid=1&sig=3a746b6b8bd9803f11fead2f7de0873a57c2f1fff18c326f03eb4155b89f9a51&v=0'

function BotanicalLeaves({ side }: { side: 'left' | 'right' }) {
  return <svg aria-hidden="true" viewBox="0 0 180 70" className={`h-full w-full ${side === 'right' ? '-scale-x-100' : ''}`}>
    <g fill="none" stroke="#7d896f" strokeWidth="1.25" opacity=".72">
      <path d="M-8 68C32 55 66 37 104 2" />
      <path d="M19 58C4 45 1 29 7 17c18 7 25 22 12 41ZM45 45C32 31 34 17 42 7c17 8 20 22 3 38ZM72 29C64 16 69 5 80-2c12 10 9 23-8 31ZM99 11C96 1 102-7 114-10c7 11 1 19-15 21Z" fill="#98a28c" stroke="none" />
    </g>
  </svg>
}

export default function SpecialsPage() {
  return <>
    <section className="relative overflow-hidden border-b border-[#dde0d5] bg-[#f3f4ee] py-4 md:py-[17px]">
      <div className="pointer-events-none absolute -left-2 bottom-0 hidden h-[70px] w-[180px] md:block"><BotanicalLeaves side="left" /></div>
      <div className="pointer-events-none absolute -right-2 bottom-0 hidden h-[70px] w-[180px] md:block"><BotanicalLeaves side="right" /></div>
      <div className="section-container relative z-10 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#aab2a0] md:flex" aria-hidden="true">
          <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="#6f7d68" strokeWidth="1.4"><path d="M25 5C14 6 7 12 7 21c6 1 14-2 18-16Z"/><path d="M8 23c4-6 8-9 14-13M14 15c-1-3-1-5 0-7M17 13c3 0 5 1 7 2"/></svg>
        </div>
        <p className="max-w-[690px] text-center text-[12px] leading-[1.65] text-[#4f5650] md:text-left">Start with a <strong className="font-semibold text-[#26342e]">FREE consultation</strong> to assess your skin and receive a professional recommendation.<br className="hidden lg:block" />You can also refer a friend, enjoy our current specials and ask family and friends for gift vouchers on special occasions.</p>
        <Link href="/book" className="shrink-0 rounded-[4px] bg-[#7e8c72] px-7 py-3 text-[11px] font-semibold text-white transition hover:bg-[#6f7d65]">Free Consultation</Link>
      </div>
    </section>

    <main className="bg-white px-4 pb-20 pt-7 md:pt-8">
      <div className="mx-auto max-w-[900px] text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-[#a56f66]">Special Offers</p>
        <h1 className="mt-2 font-display text-[32px] font-light leading-tight text-[#272523] md:text-[36px]">Our Gift To You</h1>
        <div className="mx-auto mt-3 h-px w-7 bg-[#cfa49c]" />

        <div className="relative mx-auto mt-4 w-full max-w-[560px] overflow-hidden rounded-[10px] shadow-[0_10px_30px_rgba(43,46,39,0.10)]">
          <img src={flyer} alt="Share the Glow special offers — bring a friend and receive 25% off each, plus complimentary neck treatment with facial microneedling." className="block h-auto w-full" />
          <Link href="/book" className="absolute bottom-[2.2%] right-[9%] inline-flex items-center gap-5 rounded-[4px] bg-[#a66e63] px-5 py-2.5 text-[10px] font-medium text-white shadow-sm transition hover:bg-[#925e55] sm:px-6 sm:py-3 sm:text-[11px]">Book Appointment <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </main>
  </>
}
