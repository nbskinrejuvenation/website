const PLACEHOLDER_ANSWER = /contact us for more information/i

export type FaqItem = { question: string; answer: string }

/** FAQ JSON-LD only when answers are real (not seed placeholders). */
export function getIndexableFaqs(faqs: FaqItem[] | null | undefined): FaqItem[] {
  if (!faqs?.length) return []

  return faqs.filter(
    faq =>
      faq.question?.trim() &&
      faq.answer?.trim() &&
      !PLACEHOLDER_ANSWER.test(faq.answer),
  )
}
