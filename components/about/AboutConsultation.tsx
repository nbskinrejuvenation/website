import Link from 'next/link'
import { Phone } from 'lucide-react'
import { EucalyptusSprig, IconBadge, IconGift } from './AboutIllustrations'

interface Props {
  phone?: string
}

export function AboutConsultation({ phone }: Props) {
  return (
    <section className="bg-sage-100 px-4 py-16 md:py-24">
      <div className="relative mx-auto max-w-[760px] overflow-hidden rounded-xl bg-sage-50 px-6 py-12 text-center shadow-[0_12px_32px_rgba(45,45,35,0.10)] md:px-16">
        <EucalyptusSprig className="pointer-events-none absolute -left-4 -top-6 hidden h-56 w-20 rotate-[200deg] opacity-80 md:block" />
        <EucalyptusSprig
          flip
          className="pointer-events-none absolute -bottom-10 -right-4 hidden h-56 w-20 rotate-12 opacity-80 md:block"
        />

        <div className="relative">
          <div className="flex justify-center">
            <IconBadge>
              <IconGift />
            </IconBadge>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
            Free consultation
          </p>
          <h2 className="mt-3 font-display text-3xl font-light text-sage-900 md:text-[38px]">
            Give yourself this gift
          </h2>
          <div className="mx-auto mt-3 h-px w-7 bg-brand-400" />
          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-sage-800">
            Located in Dee Why, at the beautiful Northern Beaches, we offer a{' '}
            <strong className="font-semibold text-sage-900">FREE consultation</strong> where we
            assess your skin type, main concerns and most suitable treatments. It&apos;s free and
            only takes 30 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex items-center gap-5 rounded bg-brand-600 px-6 py-3 text-xs font-medium text-white transition hover:bg-brand-700"
            >
              Book Free Consultation <span aria-hidden="true">→</span>
            </Link>
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-3 text-xs font-medium text-sage-800 hover:text-sage-900"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
