import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient()
  const body = await req.json()
  const update: Record<string, any> = {}
  if (body.name !== undefined)              update.name = body.name
  if (body.fontFamily !== undefined)        update.font_family = body.fontFamily
  if (body.fontSize !== undefined)          update.font_size = body.fontSize
  if (body.fontWeight !== undefined)        update.font_weight = body.fontWeight
  if (body.textAlign !== undefined)         update.text_align = body.textAlign
  if (body.textPosition !== undefined)      update.text_position = body.textPosition
  if (body.textColor !== undefined)         update.text_color = body.textColor
  if (body.textShadow !== undefined)        update.text_shadow = body.textShadow
  if (body.textStroke !== undefined)        update.text_stroke = body.textStroke
  if (body.backgroundOpacity !== undefined) update.background_opacity = body.backgroundOpacity
  if (body.lineHeight !== undefined)        update.line_height = body.lineHeight
  if (body.letterSpacing !== undefined)     update.letter_spacing = body.letterSpacing

  const { data, error } = await supabase
    .from('themes')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient()
  // Prevent deleting default theme
  const { data: theme } = await supabase.from('themes').select('is_default').eq('id', id).single()
  if (theme?.is_default) {
    return NextResponse.json({ error: 'Cannot delete the default theme' }, { status: 400 })
  }
  const { error } = await supabase.from('themes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
