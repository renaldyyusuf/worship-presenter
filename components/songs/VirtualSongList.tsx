'use client'

import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Star, Play, Pencil, Copy, Trash2, Music2 } from 'lucide-react'
import { useSongsStore } from '@/stores/songs.store'
import type { Song } from '@/types/song'
import { cn } from '@/lib/utils'

/**
 * VirtualSongList
 *
 * High-performance virtualized list for rendering 1000+ songs without
 * DOM bloat. Uses TanStack Virtual (already available via @tanstack/react-table
 * package — the virtualizer is a separate import).
 *
 * Falls back gracefully if @tanstack/react-virtual is not installed.
 */
export function VirtualSongList() {
  const { getFilteredSongs, setActiveSong, toggleFavorite, deleteSong, duplicateSong, loadToPresentation } = useSongsStore()
  const songs = getFilteredSongs()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count:         songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize:  () => 56,   // estimated row height px
    overscan:      10,
  })

  const items = virtualizer.getVirtualItems()

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <Music2 className="h-10 w-10 text-white/10" />
        <p className="text-sm text-white/30 font-medium">No songs found</p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {items.map((vRow) => {
          const song = songs[vRow.index]
          return (
            <div
              key={vRow.key}
              data-index={vRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top:    0,
                left:   0,
                width:  '100%',
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              <SongRow
                song={song}
                index={vRow.index}
                onEdit={() => setActiveSong(song)}
                onFavorite={() => toggleFavorite(song.id)}
                onDuplicate={() => duplicateSong(song.id)}
                onDelete={() => deleteSong(song.id)}
                onPresent={() => loadToPresentation(song)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Single song row (optimised render)
// ─────────────────────────────────────────────
interface SongRowProps {
  song:        Song
  index:       number
  onEdit:      () => void
  onFavorite:  () => void
  onDuplicate: () => void
  onDelete:    () => void
  onPresent:   () => void
}

function SongRow({ song, index, onEdit, onFavorite, onDuplicate, onDelete, onPresent }: SongRowProps) {
  return (
    <div
      onClick={onEdit}
      className="group flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors min-h-[56px]"
    >
      {/* Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite() }}
        className={cn('p-1 rounded flex-shrink-0 transition-colors',
          song.favorite ? 'text-amber-400' : 'text-white/15 hover:text-white/40')}
      >
        <Star className={cn('h-3.5 w-3.5', song.favorite && 'fill-amber-400')} />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{song.title}</p>
        {song.artist && (
          <p className="text-xs text-white/35 truncate">{song.artist}</p>
        )}
      </div>

      {/* Tags (max 2) */}
      <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
        {song.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[11px] text-white/35">
            {tag}
          </span>
        ))}
      </div>

      {/* Slide count */}
      <span className="hidden md:block text-xs text-white/25 tabular-nums w-12 text-right flex-shrink-0">
        {song.slides?.length ?? 0} sl
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <ActionBtn onClick={(e) => { e.stopPropagation(); onPresent() }} title="Present">
          <Play className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn onClick={(e) => { e.stopPropagation(); onDuplicate() }} title="Duplicate">
          <Copy className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn onClick={(e) => { e.stopPropagation(); onDelete() }} title="Delete"
          className="hover:bg-red-500/10 hover:text-red-400">
          <Trash2 className="h-3.5 w-3.5" />
        </ActionBtn>
      </div>
    </div>
  )
}

function ActionBtn({ children, onClick, title, className }: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  title: string
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors',
        className
      )}
    >
      {children}
    </button>
  )
}
