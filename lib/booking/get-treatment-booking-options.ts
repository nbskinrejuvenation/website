import { getActivePackagesForTreatment } from '@/lib/packages/credits'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { getActivePriceOption } from '@/lib/data/price-options-admin'
import { priceOptionLabel } from '@/lib/data/price-options'
import {
  calculateChargeCents,
  formatAudFromCents,
  resolveDepositPercent,
} from '@/lib/stripe/config'

export interface TreatmentBookingOption {
  kind: 'single'
  label: string
  priceCents: number
  chargeLabel: string
  depositPercent: number
  balanceLabel: string | null
}

export interface TreatmentPackageOption {
  kind: 'package'
  id: string
  label: string
  sessionCount: number
  priceCents: number
  chargeLabel: string
  /** Left to pay at the clinic; null when paid in full. */
  balanceLabel: string | null
  savingsCents: number | null
}

/** The price-list row being booked, when the client came from a "Book" button. */
export interface SelectedPriceOption {
  id: string
  label: string
  priceLabel: string
  sessionCount: number
}

export async function getTreatmentBookingOptions(
  slug: string,
  priceOptionId?: string,
): Promise<{
  treatment: NonNullable<Awaited<ReturnType<typeof getBookableTreatmentBySlug>>>
  single: TreatmentBookingOption
  packages: TreatmentPackageOption[]
  priceOption: SelectedPriceOption | null
} | null> {
  const treatment = await getBookableTreatmentBySlug(slug)
  if (!treatment) return null

  // An unknown or retired row falls back to the treatment's standard booking.
  const option = priceOptionId ? await getActivePriceOption(priceOptionId, treatment.id) : null

  const depositPercent = resolveDepositPercent(treatment.deposit_percent)
  const basePriceCents = option?.price_cents ?? treatment.price_cents!
  const singleCharge = calculateChargeCents(basePriceCents, depositPercent)
  const singleBalance = basePriceCents - singleCharge
  // A chosen row is the whole purchase, so the separate package picker is hidden.
  const packages = option ? [] : await getActivePackagesForTreatment(treatment.id)

  return {
    treatment,
    single: {
      kind: 'single',
      label: option ? priceOptionLabel(option) : 'Single session',
      priceCents: basePriceCents,
      chargeLabel: formatAudFromCents(singleCharge),
      depositPercent,
      balanceLabel: singleBalance > 0 ? formatAudFromCents(singleBalance) : null,
    },
    packages: packages.map(pkg => {
      const charge = calculateChargeCents(pkg.price_cents, depositPercent)
      const balance = pkg.price_cents - charge
      const perSessionIfSingle = treatment.price_cents! * pkg.session_count
      return {
        kind: 'package' as const,
        id: pkg.id,
        label: pkg.label,
        sessionCount: pkg.session_count,
        priceCents: pkg.price_cents,
        chargeLabel: formatAudFromCents(charge),
        balanceLabel: balance > 0 ? formatAudFromCents(balance) : null,
        savingsCents:
          perSessionIfSingle > pkg.price_cents ? perSessionIfSingle - pkg.price_cents : null,
      }
    }),
    priceOption: option
      ? {
          id: option.id,
          label: priceOptionLabel(option),
          priceLabel: formatAudFromCents(option.price_cents),
          sessionCount: option.session_count,
        }
      : null,
  }
}
