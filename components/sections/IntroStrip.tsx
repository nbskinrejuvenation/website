interface Props {
  heading?: string
  body: string
}

export function IntroStrip({
  heading = 'We see your natural beauty',
  body,
}: Props) {
  return (
    <section className="section-container py-20 text-center md:py-24">
      <h2 className="section-heading mx-auto max-w-2xl">{heading}</h2>
      <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
        {body}
      </p>
    </section>
  )
}
