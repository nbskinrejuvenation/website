import { Award } from 'lucide-react'

const CERTIFICATES = [
  'GentleMax Laser System',
  'Laser Safety',
  'Skin Penetration Treatments',
  'Laser Hair Removal',
  'Laser and Intense Pulsed Light',
]

export function AboutCertificates() {
  return (
    <section className="relative overflow-hidden bg-brand-800 py-20 md:py-28">
      {/* Subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, var(--color-brand-500) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-brand-600) 0%, transparent 40%)',
        }}
        aria-hidden="true"
      />

      <div className="section-container relative">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
            Personal
          </p>
          <h2 className="font-display text-3xl font-light text-white md:text-4xl">
            Courses &amp; Certificates
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-500" />
        </div>

        {/* Certificate cards — max 3 per row, centred when fewer */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {CERTIFICATES.map((cert) => (
            <div
              key={cert}
              className="flex w-44 flex-col items-center gap-4 rounded-xl bg-white/10 px-6 py-8 text-center backdrop-blur-sm ring-1 ring-white/10 md:w-52"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-brand-200">
                <Award className="h-7 w-7" strokeWidth={1.25} />
              </div>
              <p className="text-sm font-medium leading-snug text-white">{cert}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
