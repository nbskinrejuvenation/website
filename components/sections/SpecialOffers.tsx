import Link from 'next/link'

export function SpecialOffers() {
  return (
    <section className="bg-cream py-14 md:py-16">
      <div className="section-container">
        <div className="mx-auto max-w-4xl rounded-sm border border-brand-200 bg-white/90 px-6 py-9 text-center shadow-soft md:px-12 md:py-11">
          <p className="eyebrow mb-3">Limited-time offers</p>
          <h2 className="font-display text-3xl font-light tracking-tight text-ink md:text-4xl">
            Share the Glow
          </h2>
          <div className="mx-auto mt-7 grid max-w-3xl gap-6 text-left md:grid-cols-2">
            <div className="border-t border-brand-200 pt-5">
              <h3 className="font-display text-xl text-brand-600">Bring a Friend</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Book a treatment for yourself and a friend on the same day and receive 25% off for each of you.
              </p>
            </div>
            <div className="border-t border-brand-200 pt-5">
              <h3 className="font-display text-xl text-brand-600">Microneedling Special</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Book a facial microneedling treatment and receive a complimentary neck treatment.
              </p>
            </div>
          </div>
          <Link href="/book" className="mt-8 inline-flex items-center justify-center rounded-sm bg-brand-600 px-7 py-3 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-brand-700">
            Book your treatment
          </Link>
        </div>
      </div>
    </section>
  )
}
