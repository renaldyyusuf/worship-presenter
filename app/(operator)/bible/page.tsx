'use client'

import { useState, useRef } from 'react'
import { Search, BookOpen, Send, X, ChevronDown } from 'lucide-react'
import { useBibleStore } from '@/stores/bible.store'
import { BIBLE_TRANSLATIONS, BIBLE_BOOKS } from '@/types/bible'
import type { BibleVerse, BibleTranslation } from '@/types/bible'
import { AddToServiceButton } from '@/components/bible/AddToServiceButton'
import { ChapterNavigator } from '@/components/bible/ChapterNavigator'
import { cn } from '@/lib/utils'

export default function BiblePage() {
  const {
    translation, setTranslation,
    searchQuery, searchVerses,
    results, isSearching, searchType,
    selectedVerses, selectVerse, deselectVerse, clearSelection,
    generatedSlides, loadToPresentation,
  } = useBibleStore()

  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (q: string) => {
    if (!q.trim()) return
    searchVerses(q.trim(), translation)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Search ─────────────────────────── */}
      <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-white/[0.06] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] bg-[#0d0d0d]">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <h1 className="text-sm font-semibold text-white">Bible</h1>
          </div>

          {/* Translation selector */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/30">Translation</span>
            <div className="relative">
              <select
                value={translation}
                onChange={(e) => setTranslation(e.target.value as BibleTranslation)}
                className="h-7 rounded bg-white/[0.06] pl-2.5 pr-7 text-xs text-white border border-white/[0.08] focus:outline-none focus:border-indigo-500/40 appearance-none"
              >
                {BIBLE_TRANSLATIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(input)}
              placeholder="John 3:16 · Psalm 23 · faith · love"
              className="w-full h-9 rounded-md bg-white/[0.06] pl-9 pr-10 text-sm text-white placeholder:text-white/25 border border-white/[0.08] focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {isSearching ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            ) : input ? (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Quick reference chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['John 3:16', 'Psalm 23', 'Romans 8:28', 'Philippians 4:13', 'Isaiah 40:31'].map((ref) => (
              <button
                key={ref}
                onClick={() => { setInput(ref); handleSearch(ref) }}
                className="h-6 rounded-full border border-white/[0.08] px-2.5 text-[11px] text-white/40 hover:bg-white/[0.05] hover:text-white/60 transition-colors"
              >
                {ref}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !isSearching && (
            <BibleBookBrowser onSearch={(q) => { setInput(q); handleSearch(q) }} />
          )}

          {results.length > 0 && (
            <div className="p-3 space-y-1">
              <p className="text-[10px] text-white/25 px-2 mb-2 uppercase tracking-wider font-medium">
                {searchType === 'reference' ? 'Reference' : 'Keyword results'} · {results.length} verse{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((verse) => {
                const isSelected = selectedVerses.some((v) => v.id === verse.id)
                return (
                  <VerseRow
                    key={verse.id}
                    verse={verse}
                    selected={isSelected}
                    onToggle={() => isSelected ? deselectVerse(verse.id) : selectVerse(verse)}
                  />
                )
              })}
            </div>
          )}

          {/* Chapter navigation for reference searches */}
          {results.length > 0 && searchType === 'reference' && (
            <ChapterNavigator />
          )}
        </div>
      </div>

      {/* ── Right: Selected + preview ────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0d]">
          <span className="text-xs text-white/40 font-medium">
            {selectedVerses.length > 0
              ? `${selectedVerses.length} verse${selectedVerses.length !== 1 ? 's' : ''} selected · ${generatedSlides.length} slides`
              : 'Select verses to present'}
          </span>
          <div className="flex-1" />
          {selectedVerses.length > 0 && (
            <>
              <button
                onClick={clearSelection}
                className="h-7 rounded px-3 text-xs text-white/35 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
              >
                Clear
              </button>
              <AddToServiceButton />
              <button
                onClick={() => loadToPresentation()}
                className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Present
              </button>
            </>
          )}
        </div>

        {/* Selected verses list */}
        {selectedVerses.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-3 max-w-2xl">
              {selectedVerses.map((verse, i) => (
                <div
                  key={verse.id}
                  className="flex gap-4 p-4 rounded-lg border border-white/[0.07] bg-white/[0.02] group"
                >
                  <span className="text-xs font-mono text-white/25 pt-0.5 min-w-[24px]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-relaxed mb-1.5">{verse.content}</p>
                    <p className="text-xs text-indigo-400/70 font-medium">
                      {verse.book} {verse.chapter}:{verse.verse} ({verse.translation})
                    </p>
                  </div>
                  <button
                    onClick={() => deselectVerse(verse.id)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-8">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white/15" />
            </div>
            <div>
              <p className="text-sm text-white/30 font-medium">No verses selected</p>
              <p className="text-xs text-white/20 mt-1">Search for a reference or keyword on the left, then tap verses to select them</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Verse row
// ─────────────────────────────────────────────
function VerseRow({ verse, selected, onToggle }: {
  verse: BibleVerse; selected: boolean; onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full text-left rounded-lg px-3 py-2.5 border transition-all',
        selected
          ? 'border-indigo-500/35 bg-indigo-500/10'
          : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]'
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn(
          'mt-0.5 flex-shrink-0 text-[11px] font-mono font-semibold',
          selected ? 'text-indigo-400' : 'text-white/25'
        )}>
          {verse.chapter}:{verse.verse}
        </span>
        <p className="text-xs text-white/70 leading-relaxed">{verse.content}</p>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────
// Browse books when no search active
// ─────────────────────────────────────────────
function BibleBookBrowser({ onSearch }: { onSearch: (q: string) => void }) {
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const books = BIBLE_BOOKS.filter((b) => b.testament === testament)

  return (
    <div className="p-3">
      <div className="flex gap-1 mb-3">
        {(['NT', 'OT'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTestament(t)}
            className={cn(
              'flex-1 h-7 rounded text-xs font-medium transition-colors',
              testament === t
                ? 'bg-white/[0.08] text-white'
                : 'text-white/35 hover:text-white/60'
            )}
          >
            {t === 'NT' ? 'New Testament' : 'Old Testament'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {books.map((book) => (
          <button
            key={book.num}
            onClick={() => onSearch(`${book.name} 1`)}
            className="text-left rounded px-2.5 py-1.5 text-xs text-white/45 hover:bg-white/[0.05] hover:text-white/70 transition-colors"
          >
            {book.name}
          </button>
        ))}
      </div>
    </div>
  )
}
