'use client'

import { useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { cn } from '@/lib/utils'

export function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="flex h-7 w-7 items-center justify-center rounded text-white/25 hover:text-white/50 hover:bg-white/[0.05] transition-colors"
      >
        <Keyboard className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 rounded-xl border border-white/[0.09] bg-[#111] shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-indigo-400" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {KEYBOARD_SHORTCUTS.map(({ keys, label }) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-white/60">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="h-6 min-w-[24px] px-1.5 rounded border border-white/[0.12] bg-white/[0.06] text-[11px] font-mono text-white/60 flex items-center justify-center"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-white/25 text-center">
              Shortcuts are disabled when typing in inputs
            </p>
          </div>
        </>
      )}
    </>
  )
}
