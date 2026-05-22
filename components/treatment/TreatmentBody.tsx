interface Props {
  bodyHtml: string
}

export function TreatmentBody({ bodyHtml }: Props) {
  return (
    <section className="section-container py-16">
      <div
        className="prose prose-neutral mx-auto max-w-3xl prose-headings:font-display prose-headings:font-light prose-h2:text-2xl prose-h3:text-xl prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </section>
  )
}
