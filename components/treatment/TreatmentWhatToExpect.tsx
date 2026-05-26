import {
  Sparkles,
  Zap,
  Sun,
  Star,
  Droplets,
  Shield,
  Smile,
  Eye,
  Heart,
} from 'lucide-react'

const ICONS = [Sparkles, Zap, Sun, Star, Droplets, Shield, Smile, Eye, Heart]

interface Props {
  items: string[]
}

export function TreatmentWhatToExpect({ items }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="section-container">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            Results
          </p>
          <h2 className="font-display text-3xl font-light text-ink md:text-4xl">
            What To Expect
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-300" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:gap-x-12 md:gap-y-14">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <div key={i} className="flex flex-col items-center text-center">
                {/* Icon circle */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium leading-snug text-ink/80">
                  {item}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
