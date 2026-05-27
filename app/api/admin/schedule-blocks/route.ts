import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createScheduleBlock,
  listUpcomingScheduleBlocks,
} from '@/lib/data/schedule-blocks-admin'

export async function GET() {
  try {
    const blocks = await listUpcomingScheduleBlocks()
    return NextResponse.json({ blocks })
  } catch (err) {
    console.error('[admin/schedule-blocks GET]', err)
    return NextResponse.json({ error: 'Failed to load blocks' }, { status: 500 })
  }
}

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  all_day: z.boolean(),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  title: z.string().max(200).optional().nullable(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  try {
    const block = await createScheduleBlock(result.data)
    return NextResponse.json({ block }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create block'
    console.error('[admin/schedule-blocks POST]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
