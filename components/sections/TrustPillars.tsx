import { Award, Heart, MapPin, Sparkles } from 'lucide-react'

const pillars = [
  {
    icon: Award,
    title: 'Accredited professionals',
    description: 'Qualified beauty therapists with advanced laser and skin qualifications.',
  },
  {
    icon: Sparkles,
    title: 'Premium equipment',
    description: 'Top-of-the-line devices for face and body rejuvenation treatments.',
  },
  {
    icon: Heart,
    title: 'Holistic approach',
    description: 'Nutrition-informed care that enhances your natural beauty — never overwhelms it.',
  },
  {
    icon: MapPin,
    title: 'Northern Beaches',
    description: 'Boutique clinic in Dee Why — personalised care, by appointment.',
  },
]

export function TrustPillars() {
  return (
    <section className="border-y border-sand-dark/60 bg-cream-dark py-14" aria-label="Why choose us">
      <div className="section-container">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 lg:mx-0">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-medium tracking-wide text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
