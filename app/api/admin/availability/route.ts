import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  listAllAvailabilityRules,
  upsertAvailabilityRule,
} from '@/lib/data/availability-admin'

export async function GET() {
  try {
    const rules = await listAllAvailabilityRules()
    return NextResponse.json({ rules })
  } catch (err) {
    console.error('[admin/availability GET]', err)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}

const ruleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  is_active: z.boolean(),
})

export async function PUT(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = z.array(ruleSchema).safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  try {
    const rules = await Promise.all(
      result.data.map(r =>
        upsertAvailabilityRule({
          day_of_week: r.day_of_week,
          start_time: r.start_time.slice(0, 5),
          end_time: r.end_time.slice(0, 5),
          is_active: r.is_active,
        }),
      ),
    )
    return NextResponse.json({ rules })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed'
    console.error('[admin/availability PUT]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
