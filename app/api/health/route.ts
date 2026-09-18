import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isGoogleCalendarConfigured, checkGoogleCalendarAccess } from '@/lib/google/calendar'

/**
 * Health check endpoint for uptime monitoring.
 * Checks: app is reachable + Supabase is responsive + Google Calendar token is usable.
 *
 * Used by: Vercel, UptimeRobot, or any synthetic monitor.
 *
 * Google Calendar is included because its failure mode is silent: bookings still
 * succeed with google_calendar_synced=false, so an expired refresh token can sit
 * unnoticed for months. Only a coarse status is public; pass ?secret=CRON_SECRET
 * to see the underlying error.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const showDetail =
    Boolean(process.env.CRON_SECRET) && searchParams.get('secret') === process.env.CRON_SECRET

  try {
    const supabase = await createClient()
    const [settingsResult, treatmentsResult, google] = await Promise.all([
      supabase.from('site_settings').select('id').maybeSingle(),
      supabase
        .from('treatments')
        .select('slug', { count: 'exact', head: true })
        .eq('status', 'published'),
      isGoogleCalendarConfigured()
        ? checkGoogleCalendarAccess()
        : Promise.resolve({ ok: false as const, error: 'not configured' }),
    ])

    if (settingsResult.error) throw settingsResult.error
    if (treatmentsResult.error) throw treatmentsResult.error

    const googleStatus = !isGoogleCalendarConfigured()
      ? 'not_configured'
      : google.ok
        ? 'ok'
        : 'error'

    return NextResponse.json({
      // Google problems do not make the site unhealthy: bookings still work.
      status: 'ok',
      supabase: 'ok',
      google_calendar: googleStatus,
      ...(showDetail && !google.ok ? { google_calendar_error: google.error } : {}),
      published_treatments: treatmentsResult.count ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        supabase: 'unreachable',
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
