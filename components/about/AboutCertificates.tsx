import { IconBadge, IconRosette, LeafBranch } from './AboutIllustrations'

const CERTIFICATES = [
  'GentleMax Laser System',
  'Laser Safety',
  'Skin Penetration Treatments',
  'Laser Hair Removal',
  'Laser and Intense Pulsed Light',
]

export function AboutCertificates() {
  return (
    <section className="relative overflow-hidden bg-sage-100 py-16 md:py-24">
      <LeafBranch className="pointer-events-none absolute -left-6 bottom-0 hidden h-20 w-48 md:block" />
      <LeafBranch
        flip
        className="pointer-events-none absolute -right-6 bottom-0 hidden h-20 w-48 md:block"
      />

      <div className="section-container relative">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
            Personal
          </p>
          <h2 className="font-display text-3xl font-light text-sage-900 md:text-[38px]">
            Courses &amp; Certificates
          </h2>
          <div className="mx-auto mt-3 h-px w-7 bg-brand-400" />
        </div>

        <ul className="flex flex-wrap justify-center gap-5 md:gap-6" role="list">
          {CERTIFICATES.map(cert => (
            <li
              key={cert}
              className="flex w-40 flex-col items-center gap-4 rounded-xl bg-sage-50 px-5 py-8 text-center shadow-[0_8px_24px_rgba(45,45,35,0.07)] ring-1 ring-sage-300/70 md:w-48"
            >
              <IconBadge>
                <IconRosette />
              </IconBadge>
              <p className="font-display text-lg leading-snug text-sage-900">{cert}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
