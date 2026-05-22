'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Faq {
  question: string
  answer: string
}

interface Props {
  faqs: Faq[]
  serviceName: string
}

export function TreatmentFAQ({ faqs, serviceName }: Props) {
  return (
    <section className="section-container py-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="section-heading mb-8">
        {serviceName} FAQs
      </h2>

      <Accordion.Root
        type="single"
        collapsible
        className="divide-y divide-neutral-200"
      >
        {faqs.map((faq, i) => (
          <Accordion.Item key={i} value={String(i)} className="py-1">
            <Accordion.Header>
              <Accordion.Trigger
                className={cn(
                  'group flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-neutral-800',
                  'hover:text-brand-500 transition-colors',
                  'data-[state=open]:text-brand-500',
                )}
              >
                {faq.question}
                <ChevronDown
                  className="h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden text-sm text-neutral-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="pb-5 pt-1 leading-relaxed">{faq.answer}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  )
}
