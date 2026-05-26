import Image from 'next/image'
import Link from 'next/link'

interface Props {
  imageUrl?: string
}

export function AboutStory({ imageUrl }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="section-container">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">

          {/* Left: photo */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Lilian, founder of Naturally Beautiful Skin Rejuvenation"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="hero-placeholder h-full w-full opacity-50" aria-hidden="true" />
            )}
          </div>

          {/* Right: text */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              Why us
            </p>
            <h2 className="font-display text-3xl font-light leading-snug text-ink md:text-4xl lg:text-5xl">
              We believe in natural beauty
            </h2>
            <div className="mt-5 h-px w-16 bg-brand-300" />

            <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/70">
              <p>
                Naturally Beautiful was born from a desire to inspire, encourage and empower women
                to acknowledge and embrace their natural beauty.
              </p>
              <p>
                Lilian, NB's founder and head therapist, is a qualified nutritionist who
                discovered her love for Beauty Therapy in 2010 and never looked back.
              </p>
              <p>
                Lilian worked in some of the most recognised skin clinics in Australia for many
                years and completed several courses in various areas of beauty therapy.
              </p>
              <p>
                Her accrued knowledge and years of experience led her to pursue the dream of
                opening her own clinic, using only the best products and equipment in the market to
                achieve the best possible results for each individual.
              </p>
              <p>
                Lilian believes in taking a holistic approach when assisting her clients. Knowing
                the importance of self-love, she goes beyond the pursuit for the perfect skin,
                promoting a healthier and more balanced lifestyle, always reminding her clients
                that beauty comes from inside out, and that the treatments she offers only enhance
                their natural beauty.
              </p>
              <p>
                Located in Dee Why, at the beautiful Northern Beaches, we offer a FREE consultation
                where we assess your skin type, main concerns and most suitable treatments. Give
                yourself this gift, it's free and only takes 30 minutes.
              </p>
            </div>

            <div className="mt-10">
              <Link href="/book" className="btn-primary">
                Book a free consultation
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
