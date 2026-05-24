import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  isAdminApiLoginRoute,
  isAdminLoginRoute,
  isAdminRoute,
  requestHasValidAdminSession,
} from '@/lib/admin/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin area (password-protected) ─────────────────────────────────────────
  if (isAdminRoute(pathname) || pathname.startsWith('/api/admin/')) {
    const isPublicAdminPath =
      isAdminLoginRoute(pathname) || isAdminApiLoginRoute(pathname)

    if (!isPublicAdminPath && !(await requestHasValidAdminSession(request))) {
      if (pathname.startsWith('/api/admin/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const login = new URL('/admin/login', request.url)
      login.searchParams.set('next', pathname)
      return NextResponse.redirect(login)
    }

    const response = NextResponse.next()
    response.headers.set('x-admin-route', '1')
    return response
  }

  // ── 1. Preview mode cookie passthrough ─────────────────────────────────────
  // The /api/preview route sets/clears the __previewMode cookie.
  // Here we forward an x-preview-mode header to RSC pages so they can
  // conditionally skip the published_at filter.
  const isPreview = request.cookies.has('__previewMode')
  const response = await updateSession(request)

  if (isPreview) {
    response.headers.set('x-preview-mode', '1')
  }

  // ── 2. Handle database-driven redirects ────────────────────────────────────
  // For high-traffic redirect performance, redirects are kept in next.config.ts.
  // Dynamic/user-managed redirects from the `redirects` table are handled by
  // the catch-all in app/not-found.tsx querying Supabase at miss time.

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
