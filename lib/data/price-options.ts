import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { formatAudFromCents } from '@/lib/stripe/config'
import type { PricingGroup } from '@/lib/treatment/parse-pricing'
import type { TreatmentPriceOption } from '@/types/database'

/** Active price rows for a treatment page, in display order. */
export const getPriceOptionsForTreatment = unstable_cache(
  async (treatmentId: string): Promise<TreatmentPriceOption[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createPublicClient() as any
    const { data, error } = await supabase
      .from('treatment_price_options')
      .select('*')
      .eq('treatment_id', treatmentId)
      .eq('active', true)
      .order('sort_order', { ascending: true })

    // Before 20261002_treatment_price_options.sql is applied the table doesn't
    // exist; the page then shows its older display-only price list.
    if (error) {
      console.error('[getPriceOptionsForTreatment]', error.message)
      return []
    }
    return (data ?? []) as TreatmentPriceOption[]
  },
  ['price-options-by-treatment'],
  { tags: ['services', 'price-options'], revalidate: 3600 },
)

/** "Full face" for a single session, "Pack of 3: Full face" for a pack. */
export function priceOptionLabel(option: { group_name: string; label: string; session_count: number }): string {
  return option.session_count > 1 ? `${option.group_name}: ${option.label}` : option.label
}

/**
 * Group price rows under their headings for TreatmentPricing. With a slug,
 * each row links to booking that exact row.
 */
export function priceOptionsToGroups(
  options: TreatmentPriceOption[],
  bookingSlug: string | null,
): PricingGroup[] {
  const groups: PricingGroup[] = []
  for (const option of options) {
    let group = groups.find(g => g.name === option.group_name)
    if (!group) {
      group = { name: option.group_name, items: [] }
      groups.push(group)
    }
    group.items.push({
      label: option.label,
      price: formatAudFromCents(option.price_cents),
      subtitle: option.subtitle ?? undefined,
      bookHref: bookingSlug ? `/book/treatment/${bookingSlug}?option=${option.id}` : undefined,
    })
  }
  return groups
}
