import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

// ─── POST /api/service/[id]/items ────────────
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient()
  const body = await req.json()

  // Get current max sort_order
  const { data: existing } = await supabase
    .from('service_items')
    .select('sort_order')
    .eq('plan_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sortOrder = (existing?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('service_items')
    .insert({
      plan_id: id,
      type: body.type,
      ref_id: body.refId || null,
      title: body.title,
      subtitle: body.subtitle || null,
      notes: body.notes || null,
      sort_order: sortOrder,
      duration_min: body.durationMin || null,
      slides: body.slides || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id, planId: data.plan_id, type: data.type, refId: data.ref_id,
    title: data.title, subtitle: data.subtitle, notes: data.notes,
    sortOrder: data.sort_order, durationMin: data.duration_min,
    slides: data.slides, thumbnailUrl: data.thumbnail_url,
  }, { status: 201 })
}
