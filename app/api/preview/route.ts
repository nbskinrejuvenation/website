import { type NextRequest, NextResponse } from 'next/server'

const PREVIEW_COOKIE = '__previewMode'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

/**
 * Preview mode toggle endpoint.
 *
 * Enable:  GET /api/preview?secret=TOKEN&redirect=/services/carbon-peel
 * Disable: GET /api/preview?disable=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // ── Disable preview ────────────────────────────────────────────────────────
  if (searchParams.get('disable') === 'true') {
    const response = NextResponse.redirect(
      new URL('/', request.url),
    )
    response.cookies.delete(PREVIEW_COOKIE)
    return response
  }

  // ── Enable preview — validate secret ──────────────────────────────────────
  const secret = searchParams.get('secret')
  if (!secret || secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Invalid preview token' }, { status: 401 })
  }

  // ── Determine redirect target ──────────────────────────────────────────────
  const redirectTo = searchParams.get('redirect') ?? '/'
  // Prevent open redirect attacks — only allow relative paths
  const safePath = redirectTo.startsWith('/')
    ? redirectTo
    : `/${redirectTo}`

  const response = NextResponse.redirect(new URL(safePath, request.url))

  response.cookies.set(PREVIEW_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}
