'use client'

import { useEffect, useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { cn } from '@/lib/utils'

export function ShortcutHelp() {
  const [open, setOpen] = useState(false)

  // Open with '?' key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === '?') setOpen((v) => !v)
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Trigger button in bottom bar */}
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="flex h-7 w-7 items-center justify-center rounded text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-colors"
      >
        <Keyboard className="h-3.5 w-3.5" />
      </button>

      {/* Modal */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 rounded-xl border border-white/[0.09] bg-[#111] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-white/40" />
                <span className="text-sm font-semibold text-white/80">Keyboard Shortcuts</span>
              </div>
              <button onClick={() => setOpen(false)} className="h-6 w-6 flex items-center justify-center rounded text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="p-4 space-y-1">
              {KEYBOARD_SHORTCUTS.map(({ keys, label }) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-white/50">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="inline-flex items-center justify-center min-w-[28px] h-6 rounded border border-white/[0.12] bg-white/[0.06] px-1.5 font-mono text-[11px] text-white/60"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}

              {/* Press ? hint */}
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-white/25">Toggle this panel</span>
                <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 rounded border border-white/[0.12] bg-white/[0.06] px-1.5 font-mono text-[11px] text-white/60">?</kbd>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
