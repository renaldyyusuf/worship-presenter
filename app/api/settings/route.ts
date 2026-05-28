import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/settings — return all settings as flat object
export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('church_settings')
    .select('key, value')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten: { profile: {...}, output: {...}, ... }
  const settings: Record<string, any> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }

  return NextResponse.json(settings)
}

// PATCH /api/settings — update one or more keys
// Body: { profile: { name: "..." }, output: { showProgressBar: true } }
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const updates = Object.entries(body).map(([key, value]) =>
    supabase
      .from('church_settings')
      .upsert({ key, value }, { onConflict: 'key' })
  )

  const results = await Promise.all(updates)
  const failed  = results.find((r) => r.error)
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
