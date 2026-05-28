import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map(mapTheme))
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('themes')
    .insert({
      name: body.name,
      font_family: body.fontFamily ?? 'Inter',
      font_size: body.fontSize ?? 52,
      font_weight: body.fontWeight ?? 600,
      text_align: body.textAlign ?? 'center',
      text_position: body.textPosition ?? 'middle',
      text_color: body.textColor ?? '#ffffff',
      text_shadow: body.textShadow ?? { enabled: true, x: 2, y: 2, blur: 8, color: 'rgba(0,0,0,0.8)' },
      text_stroke: body.textStroke ?? { enabled: false, width: 0, color: '#000000' },
      background_opacity: body.backgroundOpacity ?? 0.5,
      line_height: body.lineHeight ?? 1.4,
      letter_spacing: body.letterSpacing ?? 0,
      is_default: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapTheme(data), { status: 201 })
}

function mapTheme(row: any) {
  return {
    id: row.id, name: row.name,
    fontFamily: row.font_family, fontSize: row.font_size,
    fontWeight: row.font_weight, textAlign: row.text_align,
    textPosition: row.text_position, textColor: row.text_color,
    textShadow: row.text_shadow, textStroke: row.text_stroke,
    backgroundOpacity: row.background_opacity,
    lineHeight: row.line_height, letterSpacing: row.letter_spacing,
    isDefault: row.is_default,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
