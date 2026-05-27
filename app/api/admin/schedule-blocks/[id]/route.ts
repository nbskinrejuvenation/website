import { NextResponse } from 'next/server'
import { deleteScheduleBlock } from '@/lib/data/schedule-blocks-admin'

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params
  try {
    await deleteScheduleBlock(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/schedule-blocks DELETE]', err)
    return NextResponse.json({ error: 'Failed to remove block' }, { status: 500 })
  }
}
