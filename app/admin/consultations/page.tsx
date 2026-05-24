import { listConsultations } from '@/lib/data/consultations-admin'
import { ConsultationInbox } from '@/components/admin/ConsultationInbox'
import type { ConsultationStatus } from '@/types/database'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminConsultationsPage({ searchParams }: Props) {
  const { filter: filterParam } = await searchParams

  let filter: 'upcoming' | 'all' | ConsultationStatus = 'upcoming'
  if (filterParam === 'all') filter = 'all'
  else if (
    filterParam === 'confirmed' ||
    filterParam === 'cancelled' ||
    filterParam === 'completed' ||
    filterParam === 'no_show'
  ) {
    filter = filterParam
  }

  const consultations = await listConsultations({ status: filter })

  return <ConsultationInbox initialConsultations={consultations} filter={filter} />
}
