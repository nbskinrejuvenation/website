import { getActivePackagesForTreatment } from '@/lib/packages/credits'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
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
  savingsCents: number | null
}

export async function getTreatmentBookingOptions(slug: string): Promise<{
  treatment: NonNullable<Awaited<ReturnType<typeof getBookableTreatmentBySlug>>>
  single: TreatmentBookingOption
  packages: TreatmentPackageOption[]
} | null> {
  const treatment = await getBookableTreatmentBySlug(slug)
  if (!treatment) return null

  const depositPercent = resolveDepositPercent(treatment.deposit_percent)
  const singleCharge = calculateChargeCents(treatment.price_cents!, depositPercent)
  const singleBalance = treatment.price_cents! - singleCharge
  const packages = await getActivePackagesForTreatment(treatment.id)

  return {
    treatment,
    single: {
      kind: 'single',
      label: 'Single session',
      priceCents: treatment.price_cents!,
      chargeLabel: formatAudFromCents(singleCharge),
      depositPercent,
      balanceLabel: singleBalance > 0 ? formatAudFromCents(singleBalance) : null,
    },
    packages: packages.map(pkg => {
      const charge = calculateChargeCents(pkg.price_cents, 100)
      const perSessionIfSingle = treatment.price_cents! * pkg.session_count
      return {
        kind: 'package' as const,
        id: pkg.id,
        label: pkg.label,
        sessionCount: pkg.session_count,
        priceCents: pkg.price_cents,
        chargeLabel: formatAudFromCents(charge),
        savingsCents:
          perSessionIfSingle > pkg.price_cents ? perSessionIfSingle - pkg.price_cents : null,
      }
    }),
  }
}
