'use client'

import { cn } from '@/lib/utils'

interface SlideProgressBarProps {
  current:  number   // 0-based current index
  total:    number
  visible?: boolean  // show/hide
  className?: string
}

/**
 * Thin progress bar shown at the bottom of the /output page.
 * Helps the operator see position in the deck at a glance.
 */
export function SlideProgressBar({ current, total, visible = true, className }: SlideProgressBarProps) {
  if (!visible || total === 0) return null
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100

  return (
    <div className={cn('absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.07] z-40', className)}>
      <div
        className="h-full bg-white/30 transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * Slide number badge — shows "3 / 12" in corner of output.
 * Hidden by default, fades in briefly on slide change.
 */
export function SlideNumberBadge({ current, total, visible = true }: SlideProgressBarProps) {
  if (!visible || total === 0) return null

  return (
    <div className="absolute bottom-4 left-4 z-40 pointer-events-none">
      <span className="text-[11px] font-mono text-white/20 tabular-nums bg-black/40 px-2 py-1 rounded">
        {current + 1} / {total}
      </span>
    </div>
  )
}
