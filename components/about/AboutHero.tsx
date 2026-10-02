import Image from 'next/image'
import Link from 'next/link'
import { Blob, EucalyptusSprig, LeafBranch } from './AboutIllustrations'

interface Props {
  imageUrl: string
}

export function AboutHero({ imageUrl }: Props) {
  return (
    <section className="relative overflow-hidden bg-sage-200 pb-16 pt-12 md:pb-20 md:pt-16">
      <LeafBranch className="pointer-events-none absolute -left-6 bottom-0 hidden h-24 w-56 md:block" />
      <LeafBranch
        flip
        className="pointer-events-none absolute -right-6 top-6 hidden h-20 w-48 opacity-60 lg:block"
      />

      <div className="section-container relative grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div className="text-center md:text-left">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-sage-800/70">
            <Link href="/" className="hover:text-sage-900">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              ›
            </span>
            <span aria-current="page">About</span>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
            Our story
          </p>
          <h1 className="font-display text-4xl font-light leading-[1.1] text-sage-900 md:text-5xl lg:text-6xl">
            We believe in
            <br />
            natural beauty
          </h1>
          <div className="mx-auto mt-5 h-px w-10 bg-brand-400 md:mx-0" />
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-sage-800 md:mx-0">
            Naturally Beautiful was born from a desire to inspire, encourage and empower women to
            acknowledge and embrace their natural beauty.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/book"
              className="rounded bg-sage-600 px-7 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-sage-700"
            >
              Free Consultation
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-3 rounded border border-brand-600/40 px-6 py-3 text-xs font-medium text-brand-700 transition hover:bg-white/60"
            >
              Explore treatments <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[340px]">
          <Blob className="absolute -left-10 -top-8 h-[115%] w-[125%] text-sage-300/70" />
          <EucalyptusSprig className="pointer-events-none absolute -left-12 bottom-4 z-20 h-64 w-24 -rotate-12" />
          <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-b-2xl rounded-t-full bg-sage-100 shadow-[0_12px_32px_rgba(45,45,35,0.12)] ring-8 ring-sage-50">
            <Image
              src={imageUrl}
              alt="Lilian, founder and head therapist of Naturally Beautiful Skin Rejuvenation"
              fill
              priority
              sizes="340px"
              className="object-cover object-top"
            />
          </div>
          <div className="absolute -right-4 top-10 z-20 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-sage-500 text-center text-white shadow-md md:-right-10">
            <span className="px-3 text-[9px] font-medium uppercase leading-relaxed tracking-[0.2em]">
              Beauty comes from inside out
            </span>
            <span className="mt-1.5 h-px w-6 bg-white/70" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
