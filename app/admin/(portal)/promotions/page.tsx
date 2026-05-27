import { PromotionsSettings } from '@/components/admin/PromotionsSettings'
import { listPromoCodesAdmin, listTreatmentPackagesAdmin } from '@/lib/data/promotions-admin'
import { listTreatmentBookingSettings } from '@/lib/data/treatments-admin'

export default async function AdminPromotionsPage() {
  const [promos, packages, treatments] = await Promise.all([
    listPromoCodesAdmin(),
    listTreatmentPackagesAdmin(),
    listTreatmentBookingSettings(),
  ])

  return (
    <PromotionsSettings
      initialPromos={promos}
      initialPackages={packages}
      treatments={treatments.map(t => ({ id: t.id, title: t.title }))}
    />
  )
}
