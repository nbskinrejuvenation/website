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
    const { error } = await supabase
      .from('site_settings')
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      supabase: 'ok',
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
