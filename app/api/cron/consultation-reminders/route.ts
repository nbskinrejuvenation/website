import { type NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cron/auth'
import { processAbandonedCheckouts } from '@/lib/cron/abandoned-checkouts'
import { processConsultationReminders } from '@/lib/cron/consultation-reminders'
import { processTreatmentReminders } from '@/lib/cron/treatment-reminders'
import { getSiteSettings } from '@/lib/data/site-settings'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getSiteSettings()
    const [reminders, treatmentReminders, abandonedCheckouts] = await Promise.all([
      processConsultationReminders(settings.phone),
      processTreatmentReminders(settings.phone),
      processAbandonedCheckouts(),
    ])
    return NextResponse.json({ ok: true, reminders, treatmentReminders, abandonedCheckouts })
  } catch (err) {
    console.error('[cron/consultation-reminders]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Reminder job failed' },
      { status: 500 },
    )
  }
}
