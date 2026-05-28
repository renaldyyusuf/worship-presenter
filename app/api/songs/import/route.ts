import { NextRequest, NextResponse } from 'next/server'

// POST /api/songs/import — fetch lyrics text from a remote URL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 })
  }

  // Validate URL
  let parsed: URL
  try {
    parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WorshipPresenter/1.0' },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Remote fetch failed: HTTP ${res.status}` }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') ?? ''

    // Plain text response — return directly
    if (contentType.includes('text/plain')) {
      const text = await res.text()
      return NextResponse.json({ text, title: '', artist: '' })
    }

    // HTML — extract text content (basic extraction)
    if (contentType.includes('text/html')) {
      const html = await res.text()
      const text = extractLyricsFromHtml(html)
      const title = extractMetaTitle(html)
      return NextResponse.json({ text, title, artist: '' })
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('timeout')) {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// Very basic HTML → text extraction
// ─────────────────────────────────────────────
function extractLyricsFromHtml(html: string): string {
  // Remove scripts, styles, nav, header, footer
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')

  // Look for common lyric containers
  const lyricPatterns = [
    /<div[^>]*class="[^"]*lyric[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*chorus[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
  ]

  for (const pattern of lyricPatterns) {
    const matches = [...clean.matchAll(pattern)]
    if (matches.length > 0) {
      const extracted = matches.map((m) => stripTags(m[1])).join('\n\n')
      if (extracted.split('\n').filter(Boolean).length > 3) {
        return extracted.trim()
      }
    }
  }

  // Fallback: strip all tags and clean up whitespace
  return stripTags(clean)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

function extractMetaTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1].trim().replace(/\s*[-|].*$/, '') : ''
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
}
