import { ContactInbox } from '@/components/admin/ContactInbox'
import { listContactSubmissions } from '@/lib/data/contact-submissions-admin'

interface Props {
  searchParams: Promise<{ id?: string; filter?: string }>
}

export default async function AdminMessagesPage({ searchParams }: Props) {
  const { id, filter } = await searchParams
  const unreadOnly = filter === 'unread'
  const submissions = await listContactSubmissions({ unreadOnly })

  return (
    <ContactInbox
      initialSubmissions={submissions}
      selectedId={id ?? submissions[0]?.id ?? null}
      unreadOnly={unreadOnly}
    />
  )
}
