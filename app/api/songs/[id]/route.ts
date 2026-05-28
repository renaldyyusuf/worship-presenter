import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { parseLyricsToSections, sectionsToSlides } from '@/lib/lyrics-parser'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(mapSong(data))
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()
  const { title, artist, album, year, ccliNumber, copyright, lyrics, tags, category, favorite, themeId } = body

  const update: Record<string, any> = {}
  if (title !== undefined)      update.title = title
  if (artist !== undefined)     update.artist = artist || null
  if (album !== undefined)      update.album = album || null
  if (year !== undefined)       update.year = year || null
  if (ccliNumber !== undefined) update.ccli_number = ccliNumber || null
  if (copyright !== undefined)  update.copyright = copyright || null
  if (tags !== undefined)       update.tags = tags
  if (category !== undefined)   update.category = category || null
  if (favorite !== undefined)   update.favorite = favorite
  if (themeId !== undefined)    update.theme_id = themeId || null

  // Re-parse slides if lyrics changed
  if (lyrics !== undefined) {
    update.lyrics = lyrics
    const sections = parseLyricsToSections(lyrics)
    const resolvedTitle = title ?? (await supabase.from('songs').select('title').eq('id', params.id).single()).data?.title ?? ''
    update.sections = sections as any
    update.slides = sectionsToSlides(sections, resolvedTitle) as any
  }

  const { data, error } = await supabase
    .from('songs')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapSong(data))
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase.from('songs').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

function mapSong(row: any) {
  return {
    id: row.id, title: row.title, artist: row.artist, album: row.album,
    year: row.year, ccliNumber: row.ccli_number, copyright: row.copyright,
    lyrics: row.lyrics, sections: row.sections ?? [], slides: row.slides ?? [],
    tags: row.tags ?? [], category: row.category, favorite: row.favorite,
    themeId: row.theme_id, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
