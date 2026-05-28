'use client'

import { useEffect, useCallback } from 'react'
import { usePresentationStore } from '@/stores/presentation.store'
import { useServiceStore } from '@/stores/service.store'
import { useStageStore } from '@/stores/stage-theme.store'

interface ShortcutOptions {
  enabled?: boolean
}

/**
 * useKeyboardShortcuts
 *
 * Global keyboard shortcuts for presentation control.
 * Mount once in OperatorLayout — works across all operator pages.
 *
 * Shortcuts:
 *   →  /  Space / PageDown  → Next slide
 *   ←  /  PageUp            → Prev slide
 *   B                        → Toggle Black screen
 *   C                        → Toggle Clear
 *   L                        → Toggle Logo
 *   Escape                   → Cancel black/clear/logo → back to normal
 *   Home                     → First slide
 *   End                      → Last slide
 *   1-9                      → Jump to slide N (when queue ≤ 9)
 */
export function useKeyboardShortcuts({ enabled = true }: ShortcutOptions = {}) {
  const {
    goNext, goPrev, goTo,
    toggleBlack, toggleClear, toggleLogo,
    setMode, slideQueue, currentIndex,
  } = usePresentationStore()

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (target.isContentEditable) return

      switch (e.key) {
        // ── Slide navigation ────────────────────
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          if (!e.shiftKey) {
            e.preventDefault()
            goNext()
          }
          break

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          if (!e.shiftKey) {
            e.preventDefault()
            goPrev()
          }
          break

        case 'Home':
          e.preventDefault()
          goTo(0)
          break

        case 'End':
          e.preventDefault()
          goTo(slideQueue.length - 1)
          break

        // ── Service item navigation (Shift+Arrow) ─
        case 'ArrowRight':
        case 'ArrowDown':
          if (e.shiftKey) {
            e.preventDefault()
            useServiceStore.getState().goNextItem()
          }
          break

        case 'ArrowLeft':
        case 'ArrowUp':
          if (e.shiftKey) {
            e.preventDefault()
            useServiceStore.getState().goPrevItem()
          }
          break

        // ── Direct slide jump (1–9) ─────────────
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9': {
          if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) break
          const idx = parseInt(e.key, 10) - 1
          if (idx < slideQueue.length) {
            e.preventDefault()
            goTo(idx)
          }
          break
        }

        // ── Screen modes ────────────────────────
        case 'b':
        case 'B':
          if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); toggleBlack() }
          break

        case 'c':
        case 'C':
          if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); toggleClear() }
          break

        case 'l':
        case 'L':
          if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); toggleLogo() }
          break

        case 'Escape':
          e.preventDefault()
          setMode('normal')
          break
      }
    },
    [enabled, goNext, goPrev, goTo, toggleBlack, toggleClear, toggleLogo, setMode, slideQueue]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])
}

// ─────────────────────────────────────────────
// Shortcut reference for display in UI
// ─────────────────────────────────────────────
export const KEYBOARD_SHORTCUTS = [
  { keys: ['→', 'Space'], label: 'Next slide' },
  { keys: ['←'],          label: 'Previous slide' },
  { keys: ['Home'],        label: 'First slide' },
  { keys: ['End'],         label: 'Last slide' },
  { keys: ['⇧→'],          label: 'Next service item' },
  { keys: ['⇧←'],          label: 'Prev service item' },
  { keys: ['B'],           label: 'Toggle Black screen' },
  { keys: ['C'],           label: 'Toggle Clear' },
  { keys: ['L'],           label: 'Toggle Logo' },
  { keys: ['Esc'],         label: 'Back to normal' },
  { keys: ['1–9'],         label: 'Jump to slide N' },
  { keys: ['⌘K'],          label: 'Command palette' },
] as const
