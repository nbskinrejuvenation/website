import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createTreatmentPackageAdmin,
  listTreatmentPackagesAdmin,
} from '@/lib/data/promotions-admin'

const createSchema = z.object({
  treatment_id: z.string().uuid(),
  label: z.string().min(2).max(120),
  session_count: z.number().int().min(2).max(20),
  price_cents: z.number().int().min(50),
  sort_order: z.number().int().optional(),
})

export async function GET() {
  try {
    const packages = await listTreatmentPackagesAdmin()
    return NextResponse.json({ packages })
  } catch (err) {
    console.error('[admin/treatment-packages GET]', err)
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed', issues: result.error.issues }, { status: 422 })
  }

  try {
    const pkg = await createTreatmentPackageAdmin(result.data)
    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (err) {
    console.error('[admin/treatment-packages POST]', err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
