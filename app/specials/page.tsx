import type { Metadata } from 'next'
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-[#a36e65]">Special Offers</p>
        <h1 className="mt-3 font-display text-3xl font-light text-[#252523] md:text-[38px]">Our Gift To You</h1>
        <div className="mx-auto mt-3 h-px w-7 bg-[#c99a90]" />
        <div className="mx-auto mt-5 max-w-[640px] overflow-hidden rounded-xl bg-[#f8f7ef] text-left shadow-[0_12px_32px_rgba(45,45,35,0.10)]">
          <div className="relative overflow-hidden px-7 pb-6 pt-7 md:min-h-[530px] md:px-9 md:pt-8">
            <div className="relative z-10 max-w-[58%]">
              <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#31443c]">Special Offers</p>
              <h2 className="mt-2 font-display text-[48px] font-light leading-[.82] text-[#15372f] md:text-[61px]">Share the<br />Glow</h2>
              <p className="mt-5 border-b border-[#354e46] pb-4 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#30443e]">Treat yourself. Bring a friend.</p>
              <div className="mt-5 grid grid-cols-[54px_1fr] gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9e8de] text-2xl text-[#405149]">♧</div><div><h3 className="font-display text-xl text-[#243b34]">Bring a Friend</h3><p className="mt-1 text-[13px] leading-[1.25] text-[#4e5752]">Book a treatment for yourself and a friend on the same day and receive <strong className="text-[#243b34]">25% off</strong> for each of you.</p></div></div>
              <div className="mt-5 grid grid-cols-[54px_1fr] gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9e8de] text-xl text-[#405149]">✧</div><div><h3 className="font-display text-xl text-[#243b34]">Microneedling Special</h3><p className="mt-1 text-[13px] leading-[1.25] text-[#4e5752]">Book a facial microneedling treatment and receive a <strong className="text-[#243b34]">complimentary neck treatment.</strong></p></div></div>
            </div>
            <div className="absolute -right-16 top-0 hidden h-full w-[48%] overflow-hidden rounded-bl-[55%] bg-[#dfe4d6] md:block">
              <img src="/images/specials-friends.jpg" alt="Two friends enjoying a skincare treatment together" className="absolute inset-0 h-full w-full scale-[1.32] object-cover object-[50%_76%]" />
              <div className="absolute left-3 top-2 h-24 w-24 rounded-full bg-[#9da993]/95 text-center text-[8px] font-semibold uppercase leading-[1.15rem] tracking-[.23em] text-white"><span className="flex h-full items-center justify-center px-4">Skin<br/>Looks Better<br/>Together</span></div>
            </div>
            <div className="relative z-20 mt-7 flex flex-col items-start justify-between gap-4 border-t border-[#53635b] pt-5 sm:flex-row sm:items-center"><p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#334940]">Beautiful Skin Together</p><Link href="/book" className="inline-flex items-center gap-5 rounded bg-[#a36d63] px-6 py-3 text-xs font-medium text-white transition hover:bg-[#8f5e55]">Book Appointment <span aria-hidden="true">→</span></Link></div>
          </div>
        </div>
      </div>
    </main>
  </>
}
