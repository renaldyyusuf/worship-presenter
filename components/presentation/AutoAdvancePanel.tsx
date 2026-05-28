'use client'

import { useState } from 'react'
import { Play, Pause, SkipForward, Clock } from 'lucide-react'
import { useAutoAdvance } from '@/hooks/useAutoAdvance'
import { cn } from '@/lib/utils'

export function AutoAdvancePanel() {
  const [intervalSec, setIntervalSec] = useState(5)
  const auto = useAutoAdvance({ mode: 'off', intervalSec })

  const handleToggle = () => {
    if (auto.running) {
      auto.stop()
    } else {
      auto.setIntervalSec(intervalSec)
      auto.start(intervalSec)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        Auto-Advance
      </p>

      {/* Interval input */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={intervalSec}
          onChange={(e) => {
            const v = Math.max(1, Math.min(300, parseInt(e.target.value) || 5))
            setIntervalSec(v)
            auto.setIntervalSec(v)
          }}
          min={1} max={300}
          disabled={auto.running}
          className="w-16 h-8 rounded bg-white/[0.05] px-2.5 text-xs text-white border border-white/[0.06] focus:outline-none focus:border-indigo-500/40 tabular-nums disabled:opacity-50"
        />
        <span className="text-xs text-white/30">sec / slide</span>
      </div>

      {/* Progress bar */}
      {auto.running && (
        <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-100"
            style={{ width: `${auto.progress * 100}%` }}
          />
        </div>
      )}

      {/* Start/Stop */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium border transition-colors',
          auto.running
            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
            : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/15'
        )}
      >
        {auto.running
          ? <><Pause className="h-3.5 w-3.5" /> Stop Auto-Advance</>
          : <><Play  className="h-3.5 w-3.5" /> Start Auto-Advance</>}
      </button>

      {auto.running && (
        <p className="text-[11px] text-white/25 text-center tabular-nums">
          Next slide in {(auto.remaining / 1000).toFixed(1)}s
        </p>
      )}
    </div>
  )
}
