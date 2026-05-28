'use client'

import { useMemo, useState } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import {
  Star, Play, Pencil, Trash2, ArrowUpDown,
  ArrowUp, ArrowDown, Music2, Copy,
} from 'lucide-react'
import { useSongsStore } from '@/stores/songs.store'
import { usePresentationStore } from '@/stores/presentation.store'
import type { Song } from '@/types/song'
import { cn } from '@/lib/utils'

export function SongTable() {
  const { getFilteredSongs, setActiveSong, toggleFavorite, deleteSong, duplicateSong, loadToPresentation } = useSongsStore()
  const { currentSlide } = usePresentationStore()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: false }])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const songs = getFilteredSongs()

  const columns = useMemo<ColumnDef<Song>[]>(() => [
    // Favorite star
    {
      id: 'favorite',
      size: 36,
      header: () => <span className="sr-only">Favorite</span>,
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(row.original.id) }}
          className={cn(
            'p-1 rounded transition-colors',
            row.original.favorite ? 'text-amber-400' : 'text-white/15 hover:text-white/40'
          )}
        >
          <Star className={cn('h-3.5 w-3.5', row.original.favorite && 'fill-amber-400')} />
        </button>
      ),
    },
    // Title + artist
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <SortHeader label="Title" column={column} />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{row.original.title}</p>
          {row.original.artist && (
            <p className="text-xs text-white/35 truncate">{row.original.artist}</p>
          )}
        </div>
      ),
    },
    // Category
    {
      accessorKey: 'category',
      size: 110,
      header: ({ column }) => <SortHeader label="Category" column={column} />,
      cell: ({ row }) => row.original.category ? (
        <span className="text-xs text-white/40">{row.original.category}</span>
      ) : null,
    },
    // Tags
    {
      accessorKey: 'tags',
      size: 200,
      header: () => <span className="text-xs text-white/30 font-medium">Tags</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[11px] text-white/40">
              {tag}
            </span>
          ))}
          {row.original.tags.length > 3 && (
            <span className="text-[11px] text-white/25">+{row.original.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    // Slide count
    {
      id: 'slides',
      size: 70,
      header: () => <span className="text-xs text-white/30 font-medium">Slides</span>,
      cell: ({ row }) => (
        <span className="text-xs text-white/30 tabular-nums">
          {row.original.slides?.length ?? 0}
        </span>
      ),
    },
    // Actions
    {
      id: 'actions',
      size: 100,
      header: () => null,
      cell: ({ row }) => {
        const song = row.original
        const isDeleting = deleteConfirm === song.id

        return (
          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Present now */}
            <button
              onClick={(e) => { e.stopPropagation(); loadToPresentation(song) }}
              title="Present now"
              className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => { e.stopPropagation(); duplicateSong(song.id) }}
              title="Duplicate song"
              className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            {/* Edit */}
            <button
              onClick={(e) => { e.stopPropagation(); setActiveSong(song) }}
              title="Edit song"
              className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            {/* Delete */}
            {isDeleting ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSong(song.id); setDeleteConfirm(null) }}
                  className="h-6 rounded px-1.5 text-[11px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }}
                  className="h-6 rounded px-1.5 text-[11px] text-white/30 hover:text-white/60"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(song.id) }}
                title="Delete song"
                className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )
      },
    },
  ], [deleteConfirm, toggleFavorite, setActiveSong, deleteSong, loadToPresentation])

  const table = useReactTable({
    data: songs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (songs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                style={{ width: header.getSize() }}
                className="px-3 py-2 text-left first:pl-5"
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => setActiveSong(row.original)}
              className="group border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2.5 first:pl-5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortHeader({ label, column }: { label: string; column: any }) {
  const sorted = column.getIsSorted()
  return (
    <button
      onClick={() => column.toggleSorting()}
      className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 font-medium transition-colors"
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="h-3 w-3 text-indigo-400" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="h-3 w-3 text-indigo-400" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      )}
    </button>
  )
}

function EmptyState() {
  const setActiveSong = useSongsStore((s) => s.setActiveSong)
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
        <Music2 className="h-7 w-7 text-white/20" />
      </div>
      <div>
        <p className="text-sm font-medium text-white/60">No songs found</p>
        <p className="text-xs text-white/30 mt-1">Add your first song to get started</p>
      </div>
      <button
        onClick={() => setActiveSong({ id: 'new' } as any)}
        className="flex items-center gap-1.5 h-8 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
      >
        Add Song
      </button>
    </div>
  )
}
