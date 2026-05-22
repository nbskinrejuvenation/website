import type { Metadata } from 'next'
import { getAllServices } from '@/lib/data/services'
import { ServiceCard } from '@/components/treatment/ServiceCard'

export const metadata: Metadata = {
  title: 'Our Treatments',
  description:
    'Explore all face and body treatments at Naturally Beautiful Skin Rejuvenation — micro needling, HIFU, laser, and more. Northern Beaches, Sydney.',
  alternates: { canonical: '/services' },
}

export default async function ServicesPage() {
  const services = await getAllServices()

  const face = services.filter(s => s.category === 'face')
  const body = services.filter(s => s.category === 'body')

  return (
    <div className="section-container py-16">
      <h1 className="section-heading mb-12 text-center">Our Treatments</h1>

      {face.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-xl font-semibold uppercase tracking-widest text-brand-500">
            Face
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {face.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {body.length > 0 && (
        <section>
          <h2 className="mb-8 text-xl font-semibold uppercase tracking-widest text-brand-500">
            Body
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {body.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
