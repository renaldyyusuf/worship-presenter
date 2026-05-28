'use client'

import { useState } from 'react'
import { X, Upload, FileText, Link, Check, AlertCircle, ChevronRight } from 'lucide-react'
import { useSongsStore } from '@/stores/songs.store'
import { parseLyricsToSections } from '@/lib/lyrics-parser'
import { cn } from '@/lib/utils'

type ImportMode = 'text' | 'file' | 'url'

interface ParsedSong {
  title: string
  artist: string
  lyrics: string
  sections: ReturnType<typeof parseLyricsToSections>
  slideCount: number
}

interface SongImportDialogProps {
  onClose: () => void
}

export function SongImportDialog({ onClose }: SongImportDialogProps) {
  const [mode, setMode] = useState<ImportMode>('text')
  const [rawText, setRawText] = useState('')
  const [url, setUrl]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parsed, setParsed]   = useState<ParsedSong | null>(null)
  const [error, setError]     = useState('')
  const [imported, setImported] = useState(false)

  const { createSong } = useSongsStore()

  // ── Parse raw text ─────────────────────────
  const parseText = (text: string): ParsedSong | null => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return null

    // Heuristic: first non-empty line is title, second might be artist
    let title  = ''
    let artist = ''
    let lyricsStart = 0

    const first  = lines[0].trim()
    const second = lines[1]?.trim() ?? ''

    // If first line looks like a title (no section headers)
    const isSectionHeader = /^(verse|chorus|bridge|tag|intro|outro|pre.?chorus)/i
    if (!isSectionHeader.test(first)) {
      title = first
      lyricsStart = 1
      // If second line looks like an artist (short, no section header)
      if (second && !isSectionHeader.test(second) && second.length < 60 && !second.includes('\n')) {
        // Could be artist or could be first lyric line — check if line 3 is a section header
        const third = lines[2]?.trim() ?? ''
        if (isSectionHeader.test(third) || second.startsWith('by ') || second.startsWith('By ')) {
          artist = second.replace(/^[Bb]y\s+/, '')
          lyricsStart = 2
        }
      }
    }

    const lyrics = lines.slice(lyricsStart).join('\n').trim()
    if (!lyrics) return null

    const sections   = parseLyricsToSections(lyrics)
    const slideCount = sections.reduce((n, s) => {
      const lines = s.content.split('\n').filter(Boolean).length
      return n + Math.ceil(lines / 4)
    }, 0)

    return { title: title || 'Untitled Song', artist, lyrics, sections, slideCount }
  }

  const handleParseText = () => {
    setError('')
    const result = parseText(rawText)
    if (!result) {
      setError('Could not parse lyrics. Make sure you have at least a title and some lyric lines.')
      return
    }
    setParsed(result)
  }

  // ── Import from URL (via server-side fetch) ─
  const handleFetchUrl = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/songs/import?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
      const result = parseText(data.text ?? '')
      if (!result) throw new Error('No parseable lyrics found at that URL')
      setParsed({ ...result, title: data.title ?? result.title, artist: data.artist ?? result.artist })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Import from file ───────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setRawText(text)
      setMode('text')
      const result = parseText(text)
      if (result) setParsed(result)
    }
    reader.readAsText(file)
  }

  // ── Save to library ────────────────────────
  const handleImport = async () => {
    if (!parsed) return
    setIsLoading(true)
    const result = await createSong({
      title:    parsed.title,
      artist:   parsed.artist || undefined,
      lyrics:   parsed.lyrics,
      tags:     [],
      favorite: false,
    })
    setIsLoading(false)
    if (result) {
      setImported(true)
      setTimeout(onClose, 1200)
    } else {
      setError('Failed to save song. Please try again.')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[520px] max-h-[80vh] flex flex-col rounded-xl border border-white/[0.09] bg-[#111] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-white">Import Song</h2>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Mode tabs */}
          {!parsed && (
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {([
                ['text', 'Paste Text', FileText],
                ['file', 'Upload File', Upload],
                ['url',  'From URL',   Link],
              ] as [ImportMode, string, any][]).map(([m, label, Icon]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-colors',
                    mode === m ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Text mode */}
          {!parsed && mode === 'text' && (
            <div className="space-y-3">
              <p className="text-xs text-white/35">
                Paste your song lyrics below. Start with the title on the first line, then use section headers (VERSE 1, CHORUS, BRIDGE) to structure the lyrics.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={PASTE_PLACEHOLDER}
                rows={12}
                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.07] px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 resize-none"
              />
            </div>
          )}

          {/* File mode */}
          {!parsed && mode === 'file' && (
            <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/20 cursor-pointer transition-colors">
              <Upload className="h-8 w-8 text-white/20 mb-3" />
              <p className="text-sm text-white/35 font-medium">Click to upload .txt file</p>
              <p className="text-xs text-white/20 mt-1">Plain text files supported</p>
              <input type="file" accept=".txt,.text" className="hidden" onChange={handleFile} />
            </label>
          )}

          {/* URL mode */}
          {!parsed && mode === 'url' && (
            <div className="space-y-3">
              <p className="text-xs text-white/35">
                Enter a URL to a lyrics page. The server will attempt to extract the lyrics automatically.
              </p>
              <div className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  placeholder="https://example.com/song-lyrics"
                  className="flex-1 h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={!url || isLoading}
                  className="h-9 px-4 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  Fetch
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Parsed preview */}
          {parsed && (
            <ParsedPreview
              parsed={parsed}
              imported={imported}
              onEdit={() => setParsed(null)}
              onChange={(field, val) => setParsed({ ...parsed, [field]: val })}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.07]">
          <button onClick={onClose} className="h-8 px-4 rounded-md border border-white/[0.07] text-sm text-white/40 hover:text-white/60 transition-colors">
            Cancel
          </button>
          {!parsed ? (
            <button
              onClick={handleParseText}
              disabled={!rawText.trim() || mode !== 'text'}
              className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              Preview
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={isLoading || imported}
              className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {imported ? (
                <><Check className="h-3.5 w-3.5" /> Imported!</>
              ) : isLoading ? (
                'Saving…'
              ) : (
                'Add to Library'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// Parsed preview with editable title/artist
// ─────────────────────────────────────────────
function ParsedPreview({ parsed, imported, onEdit, onChange }: {
  parsed: ParsedSong
  imported: boolean
  onEdit: () => void
  onChange: (field: string, val: string) => void
}) {
  return (
    <div className="space-y-4">
      {imported && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
          <Check className="h-4 w-4 text-emerald-400" />
          <p className="text-xs text-emerald-300 font-medium">Song imported successfully!</p>
        </div>
      )}

      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Preview</p>
          <button onClick={onEdit} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Edit text
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-white/30 block mb-1">Title</label>
            <input
              value={parsed.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full h-8 rounded bg-white/[0.05] px-2.5 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/30 block mb-1">Artist</label>
            <input
              value={parsed.artist}
              onChange={(e) => onChange('artist', e.target.value)}
              placeholder="Optional"
              className="w-full h-8 rounded bg-white/[0.05] px-2.5 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-1">
          <Stat label="Sections" value={parsed.sections.length} />
          <Stat label="Slides"   value={parsed.slideCount} />
          <Stat label="Lines"    value={parsed.lyrics.split('\n').filter(Boolean).length} />
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {parsed.sections.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/70 min-w-[80px] mt-0.5">{s.label}</span>
              <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{s.content.split('\n')[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white/80 tabular-nums">{value}</p>
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
    </div>
  )
}

const PASTE_PLACEHOLDER = `Amazing Grace
John Newton

VERSE 1
Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

CHORUS
My chains are gone I've been set free
My God my Savior has ransomed me`
