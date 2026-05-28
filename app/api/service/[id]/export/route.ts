import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { exportServicePlanHtml, exportServicePlanText } from '@/lib/export'
import type { ServicePlan, ServiceItem } from '@/types'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const format   = new URL(req.url).searchParams.get('format') ?? 'html'

  const { data, error } = await supabase
    .from('service_plans')
    .select('*, service_items(*)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const plan: ServicePlan = {
    id:          data.id,
    title:       data.title,
    serviceDate: data.service_date,
    notes:       data.notes ?? undefined,
    items:       (data.service_items ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((row: any): ServiceItem => ({
        id:           row.id,
        planId:       row.plan_id,
        type:         row.type,
        refId:        row.ref_id,
        title:        row.title,
        subtitle:     row.subtitle,
        notes:        row.notes,
        sortOrder:    row.sort_order,
        durationMin:  row.duration_min,
        slides:       row.slides ?? undefined,
        thumbnailUrl: row.thumbnail_url,
      })),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  if (format === 'text') {
    const text = exportServicePlanText(plan)
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${sanitize(plan.title)}.txt"`,
      },
    })
  }

  // Default: HTML
  const html = exportServicePlanHtml(plan)
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function sanitize(str: string): string {
  return str.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-').toLowerCase()
}
