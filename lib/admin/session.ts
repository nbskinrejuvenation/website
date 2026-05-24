import type { NextRequest, NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'nb_admin_session'
const SESSION_VALUE = 'authenticated'
const encoder = new TextEncoder()

export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET?.trim()
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SECRET is not set or too short. Add a random string (16+ chars) to .env.local and Vercel.',
    )
  }
  return secret
}

/** HMAC-SHA256 hex — works in Edge middleware and Node.js route handlers */
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/** Signed token stored in the session cookie */
export async function createAdminSessionToken(): Promise<string> {
  return hmacSha256Hex(getAdminSecret(), SESSION_VALUE)
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const expected = await createAdminSessionToken()
    return timingSafeEqualHex(token, expected)
  } catch {
    return false
  }
}

export async function setAdminSessionCookie(response: NextResponse) {
  const token = await createAdminSessionToken()
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
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

export async function requestHasValidAdminSession(request: NextRequest): Promise<boolean> {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}
