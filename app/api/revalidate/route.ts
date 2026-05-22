import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * On-demand ISR revalidation endpoint.
 *
 * Called by a Supabase Database Webhook after any content change.
 * The webhook sends a POST with a secret header and a JSON body
 * describing which table changed.
 *
 * Webhook configuration (set in Supabase Dashboard → Database → Webhooks):
 *   URL:    https://nbskinrejuvenation.com.au/api/revalidate
 *   Method: POST
 *   Secret header: x-revalidation-secret: <REVALIDATION_SECRET>
 *   Payload: { table: string, type: string, record: { slug?: string } }
 */
export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const secret = request.headers.get('x-revalidation-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse payload ──────────────────────────────────────────────────────────
  let body: { table?: string; record?: { slug?: string } } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const table = body.table ?? 'unknown'
  const slug = body.record?.slug

  // ── Revalidate by table ────────────────────────────────────────────────────
  try {
    switch (table) {
      case 'services':
        revalidateTag('services')
        revalidateTag('homepage')
        if (slug) revalidatePath(`/services/${slug}`)
        revalidatePath('/services')
        revalidatePath('/')
        break

      case 'service_pricing':
      case 'service_faqs':
        // These join onto services — revalidate the whole services tag
        revalidateTag('services')
        break

      case 'pages':
        revalidateTag('pages')
        if (slug) revalidatePath(`/${slug === 'home' ? '' : slug}`)
        break

      case 'specials':
        revalidateTag('specials')
        revalidatePath('/specials')
        break

      case 'testimonials':
        revalidateTag('testimonials')
        revalidatePath('/')
        revalidatePath('/about')
        break

      case 'site_settings':
        revalidateTag('site-settings')
        revalidatePath('/', 'layout') // Revalidate root layout (header, footer)
        break

      case 'homepage_featured_services':
        revalidateTag('homepage')
        revalidatePath('/')
        break

      case 'value_props':
      case 'founders':
        revalidateTag('pages')
        revalidatePath('/about')
        revalidatePath('/')
        break

      default:
        // Unknown table — revalidate everything
        revalidatePath('/', 'layout')
    }

    return NextResponse.json({
      revalidated: true,
      table,
      slug: slug ?? null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[revalidate] Error:', error)
    return NextResponse.json(
      { error: 'Revalidation failed', detail: String(error) },
      { status: 500 },
    )
  }
}
