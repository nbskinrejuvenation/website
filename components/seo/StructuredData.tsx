import type { SiteSettings, Treatment } from '@/types/database'
import { buildGoogleMapsSearchUrl } from '@/lib/google/maps'
import { formatFullAddress } from '@/lib/site/address'
import { absoluteUrl } from '@/lib/seo/metadata'

interface Faq {
  question: string
  answer: string
}

type Props =
  | { type: 'LocalBusiness'; settings: SiteSettings; treatment?: never; faqs?: never }
  | { type: 'Service'; treatment: Treatment; settings: SiteSettings; faqs?: never }
  | { type: 'FAQPage'; faqs: Faq[]; settings?: never; treatment?: never }

export function StructuredData(props: Props) {
  let schema: Record<string, unknown>

  switch (props.type) {
    case 'LocalBusiness': {
      const { settings } = props
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BeautySalon',
        name: settings.business_name,
        url: absoluteUrl('/'),
        telephone: settings.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressLocality: settings.suburb,
          addressRegion: settings.state,
          postalCode: settings.postcode,
          addressCountry: 'AU',
        },
        ...(settings.lat && settings.lng
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: settings.lat,
                longitude: settings.lng,
              },
            }
          : {}),
        hasMap: buildGoogleMapsSearchUrl(formatFullAddress(settings)),
        sameAs: [settings.facebook_url, settings.instagram_url].filter(Boolean),
        priceRange: '$$',
        currenciesAccepted: 'AUD',
        paymentAccepted: 'Cash, Credit Card',
      }
      break
    }

    case 'Service': {
      const { treatment, settings } = props
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: treatment.title,
        description: treatment.seo_description ?? treatment.subtitle ?? undefined,
        provider: {
          '@type': 'BeautySalon',
          name: settings.business_name,
          url: absoluteUrl('/'),
        },
        url: absoluteUrl(`/services/${treatment.slug}`),
        ...(treatment.hero_image ? { image: absoluteUrl(treatment.hero_image) } : {}),
        category: treatment.category,
      }
      break
    }

    case 'FAQPage': {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
      break
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
