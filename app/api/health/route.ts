import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const start = Date.now()

  // Check Supabase connection
  let dbOk     = false
  let dbMs     = 0
  let songCount = 0

  try {
    const t0        = Date.now()
    const supabase  = createServerClient()
    const { count } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })
    dbMs     = Date.now() - t0
    dbOk     = true
    songCount = count ?? 0
  } catch { /* db unreachable */ }

  const status = dbOk ? 200 : 503

  return NextResponse.json(
    {
      status:  dbOk ? 'ok' : 'degraded',
      version: '0.1.0',
      uptime:  process.uptime(),
      db: {
        ok:        dbOk,
        latencyMs: dbMs,
        songs:     songCount,
      },
      responseMs: Date.now() - start,
      timestamp:  new Date().toISOString(),
    },
    { status }
  )
}
