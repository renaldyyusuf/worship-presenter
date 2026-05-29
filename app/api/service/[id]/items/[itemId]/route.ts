import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, itemId } = await params;
  const supabase = createServerClient()
  const body = await req.json()
  const update: any = {}
  if (body.title !== undefined)       update.title = body.title
  if (body.notes !== undefined)       update.notes = body.notes
  if (body.durationMin !== undefined) update.duration_min = body.durationMin
  if (body.subtitle !== undefined)    update.subtitle = body.subtitle

  const { data, error } = await supabase
    .from('service_items')
    .update(update)
    .eq('id', itemId)
    .eq('plan_id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, itemId } = await params;
  const supabase = createServerClient()
  const { error } = await supabase
    .from('service_items')
    .delete()
    .eq('id', itemId)
    .eq('plan_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
