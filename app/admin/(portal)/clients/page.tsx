import { ClientsDirectory } from '@/components/admin/ClientsDirectory'
import { getClientDetail, listClients } from '@/lib/data/clients-admin'

interface Props {
  searchParams: Promise<{ id?: string; q?: string }>
}

export default async function AdminClientsPage({ searchParams }: Props) {
  const { id, q } = await searchParams
  const search = q?.trim() ?? ''
  const clients = await listClients(search || undefined)
  const detail = id ? await getClientDetail(id) : null

  return (
    <ClientsDirectory
      initialClients={clients}
      initialDetail={detail}
      selectedId={id ?? null}
      search={search}
    />
  )
}
