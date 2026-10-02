import { PriceOptionsSettings } from '@/components/admin/PriceOptionsSettings'
import { listPriceOptionsAdmin } from '@/lib/data/price-options-admin'
import { listTreatmentBookingSettings } from '@/lib/data/treatments-admin'
import { getStripeDepositPercent } from '@/lib/stripe/config'

export default async function AdminPricesPage() {
  const [options, treatments] = await Promise.all([
    listPriceOptionsAdmin(),
    listTreatmentBookingSettings(),
  ])

  return (
    <PriceOptionsSettings
      initialOptions={options}
      treatments={treatments.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        depositPercent: t.deposit_percent ?? getStripeDepositPercent(),
      }))}
    />
  )
}
