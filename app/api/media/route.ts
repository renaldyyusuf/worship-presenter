import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET_MEDIA ?? 'media'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)

  let query = supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (tags?.length) query = query.overlaps('tags', tags)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data ?? []).map(mapMedia))
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const tagsRaw = formData.get('tags') as string | null
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Determine type from mime
  const mime = file.type
  const mediaType = mime.startsWith('video/') ? 'video' : 'image'

  // Build storage path
  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  // Upload to Supabase Storage
  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: mime, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  const cdnUrl = urlData.publicUrl

  // Save metadata to DB
  const { data, error } = await supabase
    .from('media')
    .insert({
      name,
      type: mediaType,
      storage_path: storagePath,
      cdn_url: cdnUrl,
      mime_type: mime,
      size_bytes: file.size,
      tags,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapMedia(data), { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient()
  const { id } = await req.json()

  // Get storage path first
  const { data: item } = await supabase.from('media').select('storage_path').eq('id', id).single()
  if (item?.storage_path) {
    await supabase.storage.from(BUCKET).remove([item.storage_path])
  }

  const { error } = await supabase.from('media').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

function mapMedia(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    storagePath: row.storage_path,
    cdnUrl: row.cdn_url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    tags: row.tags ?? [],
    thumbnailUrl: row.thumbnail_url,
    width: row.width,
    height: row.height,
    durationSec: row.duration_sec,
    createdAt: row.created_at,
  }
}
