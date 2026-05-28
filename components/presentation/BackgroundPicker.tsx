'use client'

import { useState, useEffect } from 'react'
import { Palette, Image as ImageIcon, Video, X, Check } from 'lucide-react'
import { usePresentationStore } from '@/stores/presentation.store'
import type { SlideBackground } from '@/types/presentation'
import type { MediaItem } from '@/types'
import { cn } from '@/lib/utils'

type BgTab = 'color' | 'image' | 'video'

const PRESET_COLORS = [
  '#000000', '#0f0f0f', '#1a1a2e', '#16213e',
  '#0d1b2a', '#1b1b2f', '#2d1b69', '#0a0a0a',
  '#14213d', '#1a1a1a', '#2c2c2c', '#1e3a5f',
]

export function BackgroundPicker() {
  const { background, setBackground } = usePresentationStore()
  const [tab, setTab]       = useState<BgTab>('color')
  const [color, setColor]   = useState(background.type === 'color' ? background.value : '#000000')
  const [opacity, setOpacity] = useState(background.opacity)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetch('/api/media')
        .then((r) => r.json())
        .then(setMediaItems)
        .catch(() => {})
    }
  }, [isOpen])

  const applyColor = (hex: string) => {
    setColor(hex)
    setBackground({ type: 'color', value: hex, opacity: 1 })
  }

  const applyMedia = (item: MediaItem) => {
    const type = item.type === 'video' || item.type === 'loop' ? 'video' : 'image'
    setBackground({ type, value: item.cdnUrl, opacity, mediaId: item.id })
  }

  const images = mediaItems.filter((m) => m.type === 'image')
  const videos = mediaItems.filter((m) => m.type === 'video' || m.type === 'loop')

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Set background"
        className={cn(
          'flex items-center gap-1.5 h-7 rounded px-2 text-xs border transition-colors',
          isOpen
            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
            : 'border-white/[0.07] text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
        )}
      >
        <Palette className="h-3.5 w-3.5" />
        <span
          className="h-3 w-3 rounded-full border border-white/20 flex-shrink-0"
          style={{
            background: background.type === 'color' ? background.value : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-40 w-64 rounded-xl border border-white/[0.09] bg-[#111] shadow-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/[0.07]">
              {([['color', 'Color', Palette], ['image', 'Image', ImageIcon], ['video', 'Video', Video]] as [BgTab, string, any][]).map(([t, label, Icon]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium border-b-2 transition-colors',
                    tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-white/35 hover:text-white/60'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-3">
              {/* Color tab */}
              {tab === 'color' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-6 gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => applyColor(c)}
                        style={{ background: c }}
                        className={cn(
                          'h-7 w-full rounded-md border transition-all',
                          background.value === c && background.type === 'color'
                            ? 'border-indigo-400 ring-1 ring-indigo-400/40 scale-110'
                            : 'border-white/[0.08] hover:border-white/30 hover:scale-105'
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => applyColor(e.target.value)}
                      className="h-8 w-10 rounded border border-white/[0.08] bg-transparent cursor-pointer flex-shrink-0"
                    />
                    <input
                      value={color}
                      onChange={(e) => applyColor(e.target.value)}
                      className="flex-1 h-8 rounded bg-white/[0.05] px-2 text-xs font-mono text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
                    />
                  </div>
                </div>
              )}

              {/* Image tab */}
              {tab === 'image' && (
                <div>
                  {images.length === 0 ? (
                    <p className="text-xs text-white/25 text-center py-4">No images in library</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                      {images.map((item) => (
                        <MediaThumb
                          key={item.id}
                          item={item}
                          active={background.mediaId === item.id}
                          onClick={() => applyMedia(item)}
                        />
                      ))}
                    </div>
                  )}
                  <OpacitySlider value={opacity} onChange={(v) => { setOpacity(v); setBackground({ ...background, opacity: v }) }} />
                </div>
              )}

              {/* Video tab */}
              {tab === 'video' && (
                <div>
                  {videos.length === 0 ? (
                    <p className="text-xs text-white/25 text-center py-4">No videos in library</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                      {videos.map((item) => (
                        <MediaThumb
                          key={item.id}
                          item={item}
                          active={background.mediaId === item.id}
                          onClick={() => applyMedia(item)}
                        />
                      ))}
                    </div>
                  )}
                  <OpacitySlider value={opacity} onChange={(v) => { setOpacity(v); setBackground({ ...background, opacity: v }) }} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MediaThumb({ item, active, onClick }: { item: MediaItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative aspect-video rounded overflow-hidden border transition-all',
        active ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-white/[0.08] hover:border-white/20'
      )}
    >
      {item.thumbnailUrl || item.type === 'image' ? (
        <img src={item.thumbnailUrl ?? item.cdnUrl} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
          <Video className="h-4 w-4 text-white/20" />
        </div>
      )}
      {active && (
        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  )
}

function OpacitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-[11px] text-white/30 w-14">Opacity</span>
      <input
        type="range"
        min={0} max={1} step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-indigo-500"
      />
      <span className="text-[11px] text-white/40 w-8 text-right tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  )
}
