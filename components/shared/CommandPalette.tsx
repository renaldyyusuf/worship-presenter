'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Search, Music2, BookOpen, Play, Star, ChevronRight, Command } from 'lucide-react'
import { useSongsStore } from '@/stores/songs.store'
import { useBibleStore } from '@/stores/bible.store'
import { useServiceStore } from '@/stores/service.store'
import { usePresentationStore } from '@/stores/presentation.store'
import type { Song } from '@/types/song'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

type ResultType = 'song' | 'bible' | 'action'

interface Result {
  id: string
  type: ResultType
  label: string
  sublabel?: string
  icon: React.ReactNode
  onSelect: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery]         = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const listRef                   = useRef<HTMLDivElement>(null)

  const { songs, loadToPresentation } = useSongsStore()
  const { searchVerses }              = useBibleStore()
  const { activePlan, addItem }       = useServiceStore()
  const { setMode }                   = usePresentationStore()

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Build results list
  const results: Result[] = []
  const q = query.toLowerCase().trim()

  if (!q) {
    // Default actions when empty
    const actions: Result[] = [
      {
        id: 'black', type: 'action', label: 'Toggle Black Screen',
        sublabel: 'Press B', icon: <div className="h-3.5 w-3.5 rounded-sm bg-white/20" />,
        onSelect: () => { setMode('black'); onClose() },
      },
      {
        id: 'clear', type: 'action', label: 'Toggle Clear Screen',
        sublabel: 'Press C', icon: <div className="h-3.5 w-3.5 rounded-sm border border-white/20" />,
        onSelect: () => { setMode('clear'); onClose() },
      },
      {
        id: 'normal', type: 'action', label: 'Back to Normal',
        sublabel: 'Press Esc', icon: <Play className="h-3.5 w-3.5" />,
        onSelect: () => { setMode('normal'); onClose() },
      },
    ]
    results.push(...actions)

    // Recent / favorite songs
    const favSongs = songs.filter((s) => s.favorite).slice(0, 5)
    favSongs.forEach((song) => {
      results.push({
        id: `song-${song.id}`, type: 'song',
        label: song.title, sublabel: song.artist ?? `${song.slides?.length ?? 0} slides`,
        icon: <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />,
        onSelect: () => { loadToPresentation(song); onClose() },
      })
    })
  } else {
    // Song search
    const matched = songs
      .filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8)

    matched.forEach((song) => {
      results.push({
        id: `song-${song.id}`, type: 'song',
        label: song.title, sublabel: song.artist,
        icon: <Music2 className="h-3.5 w-3.5 text-indigo-400" />,
        onSelect: () => { loadToPresentation(song); onClose() },
      })
    })

    // Bible reference shortcut (looks like "John 3:16")
    const looksLikeBible = /^[1-3]?\s?[a-z]+\s+\d/i.test(q)
    if (looksLikeBible || q.startsWith('b ')) {
      const ref = q.startsWith('b ') ? q.slice(2) : q
      results.push({
        id: 'bible-search', type: 'bible',
        label: `Search Bible: "${ref}"`,
        sublabel: 'Opens Bible module',
        icon: <BookOpen className="h-3.5 w-3.5 text-blue-400" />,
        onSelect: () => {
          searchVerses(ref)
          window.location.href = '/bible'
          onClose()
        },
      })
    }

    // Add to service if plan active
    if (activePlan && matched.length > 0) {
      const song = matched[0]
      results.push({
        id: `add-service-${song.id}`, type: 'action',
        label: `Add "${song.title}" to service`,
        sublabel: activePlan.title,
        icon: <ChevronRight className="h-3.5 w-3.5 text-white/30" />,
        onSelect: async () => {
          await addItem({ type: 'song', refId: song.id, title: song.title })
          onClose()
        },
      })
    }
  }

  // Keyboard navigation
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[activeIdx]?.onSelect()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [results, activeIdx, onClose])

  // Reset active index on query change
  useEffect(() => setActiveIdx(0), [query])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-[20vh] -translate-x-1/2 z-50 w-[560px] rounded-xl border border-white/[0.12] bg-[#111] shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
          <Search className="h-4 w-4 text-white/30 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search songs, type a Bible reference, or run a command…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
          <kbd className="h-5 px-1.5 rounded border border-white/[0.12] text-[10px] text-white/30 font-mono">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Search className="h-8 w-8 text-white/10" />
              <p className="text-sm text-white/25">No results for &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              {/* Group headers */}
              {renderGroup(results, 'action', 'Actions', activeIdx)}
              {renderGroup(results, 'song', q ? 'Songs' : 'Favorites', activeIdx)}
              {renderGroup(results, 'bible', 'Bible', activeIdx)}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.06]">
          <span className="text-[11px] text-white/20 flex items-center gap-1">
            <kbd className="px-1 rounded border border-white/[0.10] font-mono">↑↓</kbd> navigate
          </span>
          <span className="text-[11px] text-white/20 flex items-center gap-1">
            <kbd className="px-1 rounded border border-white/[0.10] font-mono">↵</kbd> select
          </span>
          <span className="text-[11px] text-white/20 ml-auto flex items-center gap-1">
            <Command className="h-3 w-3" /><span>K to open</span>
          </span>
        </div>
      </div>
    </>
  )
}

function renderGroup(
  results: Result[],
  type: ResultType,
  label: string,
  activeIdx: number
) {
  const group = results.filter((r) => r.type === type)
  if (group.length === 0) return null

  return (
    <div key={type}>
      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/20">
        {label}
      </p>
      {group.map((result) => {
        const globalIdx = results.indexOf(result)
        return (
          <button
            key={result.id}
            onClick={result.onSelect}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
              globalIdx === activeIdx
                ? 'bg-indigo-500/15 text-white'
                : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
            )}
          >
            <span className="text-white/40 flex-shrink-0">{result.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{result.label}</p>
              {result.sublabel && (
                <p className="text-xs text-white/35 truncate">{result.sublabel}</p>
              )}
            </div>
            {globalIdx === activeIdx && (
              <ChevronRight className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Hook to wire up Cmd+K globally
// ─────────────────────────────────────────────
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen }
}
