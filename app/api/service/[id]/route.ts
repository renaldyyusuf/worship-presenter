import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

type Params = { params: { id: string } }

// ─── GET /api/service/[id] ───────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('service_plans')
    .select('*, service_items(*)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({
    id: data.id,
    title: data.title,
    serviceDate: data.service_date,
    notes: data.notes,
    items: (data.service_items ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map(mapItem),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

// ─── PATCH /api/service/[id] ─────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()
  const update: any = {}
  if (body.title !== undefined) update.title = body.title
  if (body.serviceDate !== undefined) update.service_date = body.serviceDate
  if (body.notes !== undefined) update.notes = body.notes

  const { data, error } = await supabase
    .from('service_plans')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ─── DELETE /api/service/[id] ────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase.from('service_plans').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

function mapItem(row: any) {
  return {
    id: row.id, planId: row.plan_id, type: row.type, refId: row.ref_id,
    title: row.title, subtitle: row.subtitle, notes: row.notes,
    sortOrder: row.sort_order, durationMin: row.duration_min,
    slides: row.slides, thumbnailUrl: row.thumbnail_url,
  }
}
