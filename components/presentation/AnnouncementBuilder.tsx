'use client'

import { useState } from 'react'
import { usePresentationStore } from '@/stores/presentation.store'
import { Megaphone, Send, Type, AlignCenter, AlignLeft, AlignRight, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Slide } from '@/types/presentation'
import { toast } from '@/components/shared/Toaster'

const PRESET_BG_COLORS = [
  '#000000', '#0f0f1a', '#1a0f0f', '#0f1a0f',
  '#1a1a00', '#0f0f2e', '#2e0f0f', '#0f2e0f',
]

export function AnnouncementBuilder() {
  const { loadSlides } = usePresentationStore()

  const [title, setTitle]         = useState('')
  const [body, setBody]           = useState('')
  const [bgColor, setBgColor]     = useState('#000000')
  const [textColor, setTextColor] = useState('#ffffff')
  const [align, setAlign]         = useState<'left'|'center'|'right'>('center')
  const [fontSize, setFontSize]   = useState(48)

  const handlePresent = () => {
    if (!title.trim() && !body.trim()) return

    const slides: Slide[] = [{
      id: crypto.randomUUID(),
      type: 'announcement',
      content: [title.trim(), body.trim()].filter(Boolean).join('\n'),
      sectionLabel: 'Announcement',
      subContent: title.trim() || undefined,
      theme: {
        textAlign: align,
        fontSize,
        textColor,
        textPosition: 'middle',
      },
      background: {
        type: 'color',
        value: bgColor,
        opacity: 1,
      },
    }]

    loadSlides(slides)
    toast.info('Announcement sent to output')
  }

  const lines = [title.trim(), body.trim()].filter(Boolean)

  return (
    <div className="space-y-4">
      {/* Live preview */}
      <div
        className="w-full aspect-video rounded-lg overflow-hidden flex flex-col items-center justify-center px-8 relative"
        style={{ background: bgColor }}
      >
        {lines.length === 0 ? (
          <p className="text-white/15 text-sm">Preview</p>
        ) : (
          <div style={{ textAlign: align, width: '100%' }}>
            {title && (
              <p style={{ color: textColor, fontSize: Math.round(fontSize * 0.22), fontWeight: 700, lineHeight: 1.2 }}
                 className="mb-2">
                {title}
              </p>
            )}
            {body && (
              <p style={{ color: textColor, fontSize: Math.round(fontSize * 0.22 * 0.7), fontWeight: 400, lineHeight: 1.4, opacity: 0.85 }}>
                {body}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-white/35 block mb-1.5 font-medium uppercase tracking-wider">Headline</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunday Service — 10:00 AM"
            className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] text-white/35 block mb-1.5 font-medium uppercase tracking-wider">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Additional details or subtitle text…"
            rows={3}
            className="w-full rounded-md bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
          />
        </div>

        {/* Style row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Alignment */}
          <div className="flex gap-0.5 bg-white/[0.04] rounded-md p-0.5 border border-white/[0.06]">
            {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([a, Icon]) => (
              <button key={a} onClick={() => setAlign(a)}
                className={cn('flex h-7 w-7 items-center justify-center rounded transition-colors',
                  align === a ? 'bg-white/[0.10] text-white' : 'text-white/30 hover:text-white/60')}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Font size */}
          <div className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-white/30" />
            <input type="range" min={24} max={96} step={4} value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
              className="w-20 accent-indigo-500" />
            <span className="text-[11px] text-white/30 w-7 tabular-nums">{fontSize}</span>
          </div>

          {/* Text color */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/30">Text</span>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
              className="h-7 w-8 rounded border border-white/[0.07] bg-transparent cursor-pointer" />
          </div>

          {/* BG color */}
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-white/30" />
            <div className="flex gap-1">
              {PRESET_BG_COLORS.map((c) => (
                <button key={c} onClick={() => setBgColor(c)}
                  style={{ background: c }}
                  className={cn('h-5 w-5 rounded border transition-all',
                    bgColor === c ? 'border-indigo-400 ring-1 ring-indigo-400/40 scale-110' : 'border-white/[0.12] hover:scale-105')} />
              ))}
            </div>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="h-7 w-8 rounded border border-white/[0.07] bg-transparent cursor-pointer" />
          </div>
        </div>

        <button
          onClick={handlePresent}
          disabled={!title.trim() && !body.trim()}
          className="flex w-full h-9 items-center justify-center gap-2 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          Send to Output
        </button>
      </div>
    </div>
  )
}
