import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Health check endpoint for uptime monitoring.
 * Checks: app is reachable + Supabase is responsive.
 *
 * Used by: Vercel, UptimeRobot, or any synthetic monitor.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const [settingsResult, treatmentsResult] = await Promise.all([
      supabase.from('site_settings').select('id').maybeSingle(),
      supabase
        .from('treatments')
        .select('slug', { count: 'exact', head: true })
        .eq('status', 'published'),
    ])

    if (settingsResult.error) throw settingsResult.error
    if (treatmentsResult.error) throw treatmentsResult.error

    return NextResponse.json({
      status: 'ok',
      supabase: 'ok',
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
