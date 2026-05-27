import { type NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cron/auth'
import { processAbandonedCheckouts } from '@/lib/cron/abandoned-checkouts'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processAbandonedCheckouts()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/abandoned-checkouts]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Job failed' },
      { status: 500 },
    )
  }
}
