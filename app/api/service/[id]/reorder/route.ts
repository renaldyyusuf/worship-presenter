import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

type Params = { params: { id: string } }

// POST /api/service/[id]/reorder
// Body: { items: [{ id: string, sortOrder: number }] }
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { items } = await req.json()

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'items must be array' }, { status: 400 })
  }

  // Batch update sort_order for each item
  const updates = items.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
    supabase
      .from('service_items')
      .update({ sort_order: sortOrder })
      .eq('id', id)
      .eq('plan_id', params.id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
