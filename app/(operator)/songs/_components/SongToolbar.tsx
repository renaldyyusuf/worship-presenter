'use client'

import { useState } from 'react'
import { Search, Plus, Star, SlidersHorizontal, X, Download } from 'lucide-react'
import { useSongsStore } from '@/stores/songs.store'
import { SONG_CATEGORIES } from '@/types/song'
import { cn } from '@/lib/utils'
import { SongImportDialog } from './SongImportDialog'

export function SongToolbar() {
  const {
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    showFavoritesOnly, setShowFavoritesOnly,
    songs, getFilteredSongs,
  } = useSongsStore()

  const [showFilters, setShowFilters]   = useState(false)
  const [showImport, setShowImport]     = useState(false)
  const filtered = getFilteredSongs()
  const hasActiveFilter = filterCategory || showFavoritesOnly

  return (
    <div className="border-b border-white/[0.06] bg-[#0d0d0d]">
      {/* Main toolbar row */}
      <div className="flex items-center gap-3 px-5 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, lyrics…"
            className="h-8 w-full rounded-md bg-white/[0.05] pl-9 pr-3 text-sm text-white placeholder:text-white/30 border border-white/[0.06] focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-md px-3 text-sm border transition-colors',
            showFilters || hasActiveFilter
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
              : 'border-white/[0.06] bg-white/[0.04] text-white/50 hover:text-white/70 hover:bg-white/[0.07]'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {hasActiveFilter && (
            <span className="ml-0.5 h-4 w-4 rounded-full bg-indigo-500 text-[10px] text-white flex items-center justify-center font-medium">
              {[filterCategory, showFavoritesOnly].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Count */}
        <span className="text-xs text-white/25 tabular-nums">
          {filtered.length} of {songs.length}
        </span>

        {/* Import song */}
        <button
          onClick={() => setShowImport(true)}
          className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.08] px-3 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/80 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Import
        </button>

        {/* Add song */}
        <AddSongButton />
      </div>

      {showImport && <SongImportDialog onClose={() => setShowImport(false)} />}

      {/* Filter row */}
      {showFilters && (
        <div className="flex items-center gap-3 px-5 pb-3 flex-wrap">
          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-full px-3 text-xs border transition-colors',
              showFavoritesOnly
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
            )}
          >
            <Star className={cn('h-3 w-3', showFavoritesOnly && 'fill-amber-400')} />
            Favorites
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Category filters */}
          {SONG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
              className={cn(
                'h-7 rounded-full px-3 text-xs border transition-colors',
                filterCategory === cat
                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
              )}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilter && (
            <button
              onClick={() => { setFilterCategory(''); setShowFavoritesOnly(false) }}
              className="flex h-7 items-center gap-1 rounded-full px-3 text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Add song button — opens editor with blank form
// ─────────────────────────────────────────────
function AddSongButton() {
  const setActiveSong = useSongsStore((s) => s.setActiveSong)

  return (
    <button
      onClick={() => setActiveSong({ id: 'new' } as any)}
      className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />
      Add Song
    </button>
  )
}
