import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { parseBibleReference } from '@/lib/bible-api'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const translation = searchParams.get('translation') ?? 'NIV'
  const type = searchParams.get('type') ?? 'reference'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  if (!q.trim()) {
    return NextResponse.json({ verses: [], total: 0 })
  }

  try {
    if (type === 'reference') {
      const ref = parseBibleReference(q)
      if (!ref) {
        return NextResponse.json({ verses: [], total: 0, error: 'Could not parse reference' })
      }

      let query = supabase
        .from('bible_verses')
        .select('*')
        .eq('translation', translation)
        .eq('book', ref.book)
        .eq('chapter', ref.chapter)
        .order('verse', { ascending: true })

      if (ref.verseEnd) {
        query = query.gte('verse', ref.verseStart).lte('verse', ref.verseEnd)
      } else if (ref.verseStart > 1) {
        query = query.eq('verse', ref.verseStart)
      }
      // If no verse specified (e.g. "Psalm 23"), return whole chapter

      const { data, error } = await query
      if (error) throw error

      return NextResponse.json({ verses: data ?? [], total: data?.length ?? 0 })
    }

    // Keyword full-text search via Postgres function
    const { data, error } = await supabase.rpc('search_bible_fulltext', {
      query: q,
      translation,
      max_results: limit,
    })

    if (error) throw error
    return NextResponse.json({ verses: data ?? [], total: data?.length ?? 0 })

  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
