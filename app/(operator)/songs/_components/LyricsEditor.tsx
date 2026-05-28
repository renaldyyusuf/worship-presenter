'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface LyricsEditorProps {
  value: string
  onChange: (val: string) => void
}

// Section header keywords to highlight
const SECTION_HEADERS = /^(verse\s*\d*|chorus|bridge|tag|intro|outro|pre.?chorus|instrumental)/i

export function LyricsEditor({ value, onChange }: LyricsEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Insert a section header at cursor position
  const insertSection = useCallback((header: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = value.slice(0, start)
    const after = value.slice(end)
    const prefix = before.length > 0 && !before.endsWith('\n\n') ? '\n\n' : ''
    const newVal = `${before}${prefix}${header}\n${after}`
    onChange(newVal)
    setTimeout(() => {
      const pos = before.length + prefix.length + header.length + 1
      el.setSelectionRange(pos, pos)
      el.focus()
    }, 0)
  }, [value, onChange])

  const lineCount = value.split('\n').length

  return (
    <div className="rounded-lg border border-white/[0.07] overflow-hidden bg-white/[0.03]">
      {/* Section insert toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] flex-wrap">
        <span className="text-[11px] text-white/25 mr-1">Insert:</span>
        {[
          { label: 'Verse', value: 'VERSE 1' },
          { label: 'Chorus', value: 'CHORUS' },
          { label: 'Bridge', value: 'BRIDGE' },
          { label: 'Pre-Chorus', value: 'PRE-CHORUS' },
          { label: 'Tag', value: 'TAG' },
          { label: 'Intro', value: 'INTRO' },
          { label: 'Outro', value: 'OUTRO' },
        ].map(({ label, value: sectionValue }) => (
          <button
            key={label}
            type="button"
            onClick={() => insertSection(sectionValue)}
            className="h-6 rounded px-2 text-[11px] border border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-colors"
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-white/20 tabular-nums">
          {lineCount} lines
        </span>
      </div>

      {/* Editor area with line highlights */}
      <div className="relative">
        {/* Line highlight overlay */}
        <LineHighlights value={value} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={18}
          spellCheck={false}
          className="relative z-10 w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-[1.75rem] text-white/80 placeholder:text-white/20 focus:outline-none"
          style={{ caretColor: '#818cf8' }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Semi-transparent highlight on section headers
// ─────────────────────────────────────────────
function LineHighlights({ value }: { value: string }) {
  const lines = value.split('\n')

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none px-4 py-3 font-mono text-[13px] leading-[1.75rem] overflow-hidden"
      aria-hidden
    >
      {lines.map((line, i) => {
        const isHeader = SECTION_HEADERS.test(line.trim())
        return (
          <div
            key={i}
            className={cn(
              'h-[1.75rem]',
              isHeader && 'bg-indigo-500/[0.08] rounded -mx-1 px-1'
            )}
          />
        )
      })}
    </div>
  )
}

const PLACEHOLDER = `VERSE 1
Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

CHORUS
My chains are gone I've been set free
My God my Savior has ransomed me

VERSE 2
'Twas grace that taught my heart to fear
And grace my fears relieved`
