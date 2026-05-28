import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  const { data: plans, error } = await supabase
    .from('service_plans')
    .select('*, service_items(*)')
    .order('service_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((plans ?? []).map(mapPlan))
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { title, serviceDate, notes } = await req.json()

  const { data, error } = await supabase
    .from('service_plans')
    .insert({ title, service_date: serviceDate, notes: notes || null })
    .select('*, service_items(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapPlan(data), { status: 201 })
}

function mapPlan(row: any) {
  return {
    id: row.id,
    title: row.title,
    serviceDate: row.service_date,
    notes: row.notes,
    items: (row.service_items ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map(mapItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapItem(row: any) {
  return {
    id: row.id,
    planId: row.plan_id,
    type: row.type,
    refId: row.ref_id,
    title: row.title,
    subtitle: row.subtitle,
    notes: row.notes,
    sortOrder: row.sort_order,
    durationMin: row.duration_min,
    slides: row.slides ?? null,
    thumbnailUrl: row.thumbnail_url,
  }
}
