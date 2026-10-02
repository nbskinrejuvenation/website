import { LeafBranch } from './AboutIllustrations'

export function AboutStory() {
  return (
    <section className="relative overflow-hidden bg-sage-200 py-16 md:py-24">
      <div className="mx-auto max-w-[920px] px-4">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
            Meet the founder
          </p>
          <h2 className="font-display text-3xl font-light text-sage-900 md:text-[38px]">
            Lilian&apos;s story
          </h2>
          <div className="mx-auto mt-3 h-px w-7 bg-brand-400" />
        </div>

        <article className="relative mt-10 overflow-hidden rounded-xl bg-sage-50 px-6 py-10 shadow-[0_12px_32px_rgba(45,45,35,0.10)] md:px-14 md:py-14">
          <LeafBranch className="pointer-events-none absolute -right-8 -top-2 hidden h-20 w-48 rotate-180 opacity-50 md:block" />

          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:gap-12">
            <div className="space-y-4 text-[15px] leading-relaxed text-sage-800">
              <p>
                Lilian, NB&apos;s founder and head therapist, is a qualified nutritionist who
                discovered her love for Beauty Therapy in 2010 and never looked back.
              </p>
              <p>
                Lilian worked in some of the most recognised skin clinics in Australia for many
                years and completed several courses in various areas of beauty therapy.
              </p>
              <p>
                Her accrued knowledge and years of experience led her to pursue the dream of opening
                her own clinic, using only the best products and equipment in the market to achieve
                the best possible results for each individual.
              </p>
            </div>

            <figure className="flex flex-col justify-center border-t border-sage-300 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <span
                className="font-display text-6xl leading-none text-brand-400"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="-mt-4 font-display text-2xl font-light leading-snug text-sage-900 md:text-[26px]">
                Beauty comes from inside out.
              </blockquote>
              <figcaption className="mt-4 text-[13px] leading-relaxed text-sage-800">
                Knowing the importance of self-love, Lilian goes beyond the pursuit for the perfect
                skin, promoting a healthier and more balanced lifestyle. The treatments she offers
                only enhance your natural beauty.
              </figcaption>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-sage-700">
                Lilian · Founder &amp; head therapist
              </p>
            </figure>
          </div>
        </article>
      </div>
    </section>
  )
}
