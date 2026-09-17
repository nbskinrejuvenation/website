import type { Metadata } from 'next'
import Link from 'next/link'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const description = 'Exclusive offers and weekly specials at Naturally Beautiful Skin Rejuvenation.'
export const metadata: Metadata = { title: pageTitle('Specials & Offers'), description, openGraph: openGraphDefaults('Specials & Offers', description), alternates: { canonical: '/specials' } }

function Leaves({ flip = false }: { flip?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 240 105" className={`h-full w-full ${flip ? '-scale-x-100' : ''}`}><g stroke="#596958" strokeWidth="1.2"><path d="M-8 102C62 80 111 49 183-7" fill="none"/><path d="M30 83C6 61 6 34 17 13c29 13 38 39 13 70ZM70 62C49 40 54 17 70 1c25 16 25 40 0 61ZM112 39C97 20 106 1 125-9c18 18 12 37-13 48ZM151 16c-7-17 5-30 25-34 10 19-2 31-25 34Z" fill="#7f8d78"/></g></svg>
}

function PeopleIcon() { return <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="23" cy="22" r="8"/><circle cx="42" cy="22" r="8"/><path d="M8 50c2-12 8-18 15-18s13 6 15 18M31 50c2-12 6-18 12-18 7 0 12 6 14 18"/></svg> }
function FaceIcon() { return <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M30 9c-9 4-14 12-14 23 0 12 7 20 17 23M22 30c3 2 6 2 9 0M25 42c4 3 8 3 12 0"/><path d="M47 20l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"/></svg> }

export default function SpecialsPage() {
  return <>
    <section className="relative overflow-hidden border-b border-[#d9ddd2] bg-[#f1f2eb] py-5">
      <div className="pointer-events-none absolute -left-4 bottom-0 hidden h-24 w-52 md:block"><Leaves /></div>
      <div className="pointer-events-none absolute -right-4 bottom-0 hidden h-24 w-52 md:block"><Leaves flip /></div>
      <div className="section-container relative z-10 flex flex-col items-center justify-center gap-5 md:flex-row md:gap-10">
        <div className="text-center md:text-left"><p className="text-[11px] font-semibold uppercase tracking-[.36em] text-[#31473d]">Beautiful skin starts with a conversation</p><p className="mt-2 text-sm text-[#59615c]">Start with a <strong>FREE consultation</strong> to assess your skin and receive a professional recommendation.</p></div>
        <Link href="/book" className="rounded-full bg-[#315544] px-8 py-3 text-[11px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#294839]">Free Consultation</Link>
      </div>
    </section>

    <main className="relative overflow-hidden bg-[#fbfaf6]">
      <div className="mx-auto grid max-w-[1180px] md:min-h-[860px] md:grid-cols-[54%_46%]">
        <div className="relative z-10 px-7 py-12 md:px-16 md:py-14">
          <p className="text-[12px] font-semibold uppercase tracking-[.48em] text-[#263d34]">Specials</p><div className="mt-5 h-px w-16 bg-[#365348]" />
          <h1 className="mt-8 font-display text-[70px] font-light leading-[.82] text-[#0d3328] sm:text-[92px] md:text-[108px]">Special<br/>Offers</h1>
          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.42em] text-[#30463d]">Treat yourself. Bring a friend.</p><div className="mt-5 h-px w-14 bg-[#365348]" />
          <div className="mt-12 space-y-11">
            <div className="grid grid-cols-[90px_1fr] items-center gap-5"><div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#efede6] text-[#18372e]"><PeopleIcon /></div><div><h2 className="font-display text-3xl text-[#16372d]">Bring a Friend</h2><p className="mt-2 max-w-[350px] text-[17px] leading-6 text-[#46544e]">Book a treatment for yourself and a friend on the same day and receive <strong className="text-[#173b30]">25% off</strong> for each of you.</p></div></div>
            <div className="grid grid-cols-[90px_1fr] items-center gap-5"><div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#efede6] text-[#18372e]"><FaceIcon /></div><div><h2 className="font-display text-3xl text-[#16372d]">Microneedling Special</h2><p className="mt-2 max-w-[365px] text-[17px] leading-6 text-[#46544e]">Book a facial microneedling treatment and receive a <strong className="text-[#173b30]">complimentary neck treatment.</strong></p></div></div>
          </div>
          <div className="mt-11 h-px w-12 bg-[#365348]" /><p className="mt-6 text-[10px] font-semibold uppercase tracking-[.38em] text-[#365348]">Beautiful skin together</p>
        </div>

        <div className="relative min-h-[600px] overflow-hidden md:min-h-full">
          <div className="absolute -left-16 -top-24 h-[116%] w-[125%] overflow-hidden rounded-bl-[48%] bg-[#e8ebe1]">
            <img src="/images/specials-friends.jpg" alt="Two friends enjoying glowing skin" className="h-full w-full object-cover object-center" />
          </div>
          <div className="absolute left-[7%] top-[14%] z-10 flex h-40 w-40 items-center justify-center rounded-full bg-[#aab5a4]/95 text-center text-[10px] font-medium uppercase leading-6 tracking-[.28em] text-white">Skin<br/>looks better<br/>together</div>
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-48 w-64"><Leaves flip /></div>
          <div className="absolute -bottom-28 -left-28 h-64 w-[125%] rotate-[-10deg] rounded-[50%] bg-[#c8d0c2]/80" />
        </div>
      </div>
      <div className="relative z-20 -mt-4 flex justify-center pb-12 md:-mt-20"><Link href="/book" className="rounded-full bg-[#315544] px-16 py-4 text-[11px] font-semibold uppercase tracking-[.3em] text-white transition hover:bg-[#294839]">Book Appointment</Link></div>
    </main>

    <section className="relative overflow-hidden border-t border-[#ecebe5] bg-[#f5f5ef] py-10 text-center"><div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-48"><Leaves /></div><p className="font-display text-3xl italic text-[#40584e]">Healthy Skin&nbsp;&nbsp; Brighter You</p><div className="mx-auto mt-4 h-px w-14 bg-[#607267]" /></section>
  </>
}
