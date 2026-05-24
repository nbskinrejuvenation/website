import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'nb_admin_session'
const SESSION_VALUE = 'authenticated'

export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET?.trim()
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SECRET is not set or too short. Add a random string (16+ chars) to .env.local and Vercel.',
    )
  }
  return secret
}

/** Signed token stored in the session cookie */
export function createAdminSessionToken(): string {
  return createHmac('sha256', getAdminSecret()).update(SESSION_VALUE).digest('hex')
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false
  try {
    const expected = createAdminSessionToken()
    const a = Buffer.from(token, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function setAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

export function isAdminLoginRoute(pathname: string): boolean {
  return pathname === '/admin/login'
}

export function isAdminApiLoginRoute(pathname: string): boolean {
  return pathname === '/api/admin/login' || pathname === '/api/admin/logout'
}

export function requestHasValidAdminSession(request: NextRequest): boolean {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}
