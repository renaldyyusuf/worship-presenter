import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { parseLyricsToSections, sectionsToSlides } from '@/lib/lyrics-parser'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const category = searchParams.get('category')
  const favorite = searchParams.get('favorite')
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)

  let query = supabase
    .from('songs')
    .select('*')
    .order('title', { ascending: true })

  if (q) {
    query = query.textSearch('search_vector', q, { type: 'websearch' })
  }
  if (category) query = query.eq('category', category)
  if (favorite === 'true') query = query.eq('favorite', true)
  if (tags?.length) query = query.overlaps('tags', tags)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map snake_case DB fields to camelCase
  const songs = (data ?? []).map(mapSong)
  return NextResponse.json(songs)
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const { title, artist, album, year, ccliNumber, copyright, lyrics, tags, category, favorite, themeId } = body

  // Parse lyrics → sections → slides
  const sections = parseLyricsToSections(lyrics ?? '')
  const slides = sectionsToSlides(sections, title)

  const { data, error } = await supabase
    .from('songs')
    .insert({
      title,
      artist: artist || null,
      album: album || null,
      year: year || null,
      ccli_number: ccliNumber || null,
      copyright: copyright || null,
      lyrics: lyrics ?? '',
      sections: sections as any,
      slides: slides as any,
      tags: tags ?? [],
      category: category || null,
      favorite: favorite ?? false,
      theme_id: themeId || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapSong(data), { status: 201 })
}

// ─────────────────────────────────────────────
// DB row → Song type mapper
// ─────────────────────────────────────────────
function mapSong(row: any) {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    year: row.year,
    ccliNumber: row.ccli_number,
    copyright: row.copyright,
    lyrics: row.lyrics,
    sections: row.sections ?? [],
    slides: row.slides ?? [],
    tags: row.tags ?? [],
    category: row.category,
    favorite: row.favorite,
    themeId: row.theme_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
