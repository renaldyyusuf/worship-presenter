'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Search, Image as ImageIcon, Video, Layers, X, Play, Check, Trash2 } from 'lucide-react'
import { usePresentationStore } from '@/stores/presentation.store'
import type { MediaItem, MediaType } from '@/types'
import { formatBytes } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<MediaType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { background, setBackground } = usePresentationStore()

  useEffect(() => {
    fetch('/api/media')
      .then((r) => r.json())
      .then((data) => { setItems(data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const handleUpload = async (files: FileList) => {
    setIsUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      form.append('name', file.name.replace(/\.[^/.]+$/, ''))
      try {
        const res = await fetch('/api/media', { method: 'POST', body: form })
        const item: MediaItem = await res.json()
        setItems((prev) => [item, ...prev])
      } catch { /* handle error */ }
    }
    setIsUploading(false)
  }

  const handleSetBackground = (item: MediaItem) => {
    setBackground({
      type: item.type === 'video' || item.type === 'loop' ? 'video' : 'image',
      value: item.cdnUrl,
      opacity: 1,
      mediaId: item.id,
    })
  }

  const handleDelete = async (item: MediaItem) => {
    try {
      await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch { /* noop */ }
  }

  const filtered = items.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0d]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="w-full h-8 rounded-md bg-white/[0.05] pl-9 pr-3 text-sm text-white placeholder:text-white/30 border border-white/[0.06] focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Type filters */}
        <div className="flex gap-1">
          {([['all', 'All', Layers], ['image', 'Images', ImageIcon], ['video', 'Videos', Video], ['loop', 'Loops', Play]] as const).map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => setFilter(val as any)}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded px-3 text-xs font-medium border transition-colors',
                filter === val
                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <span className="text-xs text-white/25">{filtered.length} items</span>

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {/* Drop zone + Grid */}
      <div
        className="flex-1 overflow-y-auto p-5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); e.dataTransfer.files && handleUpload(e.dataTransfer.files) }}
      >
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-lg bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <DropZone onUpload={handleUpload} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            {filtered.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                isActive={background.mediaId === item.id}
                onSetBackground={() => handleSetBackground(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Media card
// ─────────────────────────────────────────────
function MediaCard({ item, isActive, onSetBackground, onDelete }: {
  item: MediaItem; isActive: boolean; onSetBackground: () => void; onDelete: () => void
}) {
  const Icon = item.type === 'video' || item.type === 'loop' ? Video : ImageIcon
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={cn(
      'group relative rounded-lg overflow-hidden border transition-all cursor-pointer',
      isActive ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-white/[0.07] hover:border-white/20'
    )}>
      {/* Thumbnail */}
      <div className="aspect-video bg-white/[0.04] relative overflow-hidden">
        {item.thumbnailUrl || item.type === 'image' ? (
          <img src={item.thumbnailUrl ?? item.cdnUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="h-8 w-8 text-white/15" />
          </div>
        )}

        {isActive && (
          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
          <button
            onClick={onSetBackground}
            className="h-7 rounded px-2.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Set BG
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={onDelete}
                className="h-7 px-2 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition-colors">
                Delete
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                className="h-7 px-2 rounded text-xs text-white/60 hover:bg-white/[0.15] transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="h-7 w-7 flex items-center justify-center rounded text-white/60 hover:bg-red-500/30 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-2.5 py-2 bg-white/[0.02]">
        <p className="text-xs text-white/70 truncate font-medium">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn(
            'text-[10px] font-medium capitalize',
            item.type === 'video' ? 'text-purple-400' :
            item.type === 'loop'  ? 'text-pink-400' : 'text-blue-400'
          )}>{item.type}</span>
          <span className="text-[10px] text-white/25">{formatBytes(item.sizeBytes)}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Drop zone (empty state)
// ─────────────────────────────────────────────
function DropZone({ onUpload }: { onUpload: (files: FileList) => void }) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files && onUpload(e.dataTransfer.files) }}
      className={cn(
        'flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed transition-colors cursor-pointer',
        dragOver ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/[0.08] hover:border-white/15'
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)} />
      <Upload className="h-10 w-10 text-white/15 mb-3" />
      <p className="text-sm text-white/30 font-medium">Drop files here or click to upload</p>
      <p className="text-xs text-white/20 mt-1">Supports JPG, PNG, GIF, MP4, MOV, WebM</p>
    </div>
  )
}
