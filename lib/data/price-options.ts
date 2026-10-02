import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { formatAudFromCents } from '@/lib/stripe/config'
import type { PricingGroup } from '@/lib/treatment/parse-pricing'
import type { TreatmentPriceOption } from '@/types/database'

const getCachedPriceOptions = unstable_cache(
  async (treatmentId: string): Promise<TreatmentPriceOption[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createPublicClient() as any
    const { data, error } = await supabase
      .from('treatment_price_options')
      .select('*')
      .eq('treatment_id', treatmentId)
      .eq('active', true)
      .order('sort_order', { ascending: true })

    // Throwing keeps a failed read out of the cache.
    if (error) throw new Error(`getPriceOptionsForTreatment: ${error.message}`)
    return (data ?? []) as TreatmentPriceOption[]
  },
  ['price-options-by-treatment-v2'],
  { tags: ['services', 'price-options'], revalidate: 3600 },
)

/**
 * Active price rows for a treatment page, in display order. If they can't be
 * read (e.g. the table is missing) the page shows its older display-only list.
 */
export async function getPriceOptionsForTreatment(
  treatmentId: string,
): Promise<TreatmentPriceOption[]> {
  try {
    return await getCachedPriceOptions(treatmentId)
  } catch (err) {
    console.error('[getPriceOptionsForTreatment]', err)
    return []
  }
}

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
