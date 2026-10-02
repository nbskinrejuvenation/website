import { TreatmentsSettings } from '@/components/admin/TreatmentsSettings'
import { listTreatmentBookingSettings } from '@/lib/data/treatments-admin'
import { getStripeDepositPercent, isStripeConfigured } from '@/lib/stripe/config'

export default async function AdminTreatmentsPage() {
  const treatments = await listTreatmentBookingSettings()
  return (
    <TreatmentsSettings
      initialTreatments={treatments}
      stripeConfigured={isStripeConfigured()}
      defaultDepositPercent={getStripeDepositPercent()}
    />
  )
}
