interface Props {
  conditions: string[]
}

export function TreatmentRecommendedFor({ conditions }: Props) {
  return (
    <section className="bg-ink py-16">
      <div className="section-container">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
            Is this right for you?
          </p>
          <h2 className="font-display text-3xl font-light text-white md:text-4xl">
            Recommended for
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-500" />
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="rounded-full border border-brand-600/40 bg-brand-800/60 px-5 py-2 text-sm font-medium text-brand-100 backdrop-blur-sm"
            >
              {condition}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
