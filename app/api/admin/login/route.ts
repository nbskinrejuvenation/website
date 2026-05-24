import { timingSafeEqual } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { setAdminSessionCookie } from '@/lib/admin/session'

function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim()
  if (!expected) return false
  try {
    const a = Buffer.from(input, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return NextResponse.json(
      { error: 'Admin login is not configured. Set ADMIN_PASSWORD in environment.' },
      { status: 503 },
    )
  }

  if (!body.password || !verifyPassword(body.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  if (!process.env.ADMIN_SECRET?.trim()) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET is not configured on the server.' },
      { status: 503 },
    )
  }

  const response = NextResponse.json({ success: true })
  await setAdminSessionCookie(response)
  return response
}
