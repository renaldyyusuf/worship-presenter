'use client'

import { useStageStore } from '@/stores/stage-theme.store'
import { Clock, ChevronRight, MessageSquare, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSocket } from '@/lib/socket'

/**
 * StageWidgetControls
 * Shown in the operator "Stage" panel — lets operator remotely toggle
 * which widgets are visible on the stage display.
 */
export function StageWidgetControls() {
  const {
    showClock, showTimer, showNextSlide, showMessage,
    toggleClock, toggleTimer, toggleNextSlide, toggleMessage,
  } = useStageStore()

  const emit = (field: string, value: boolean) => {
    getSocket().emit('stage:widgets' as any, { [field]: value })
  }

  const widgets = [
    {
      label:   'Clock',
      icon:    Clock,
      active:  showClock,
      toggle:  () => { toggleClock();     emit('showClock',     !showClock) },
    },
    {
      label:   'Timer',
      icon:    Hash,
      active:  showTimer,
      toggle:  () => { toggleTimer();     emit('showTimer',     !showTimer) },
    },
    {
      label:   'Next Slide',
      icon:    ChevronRight,
      active:  showNextSlide,
      toggle:  () => { toggleNextSlide(); emit('showNextSlide', !showNextSlide) },
    },
    {
      label:   'Message',
      icon:    MessageSquare,
      active:  showMessage,
      toggle:  () => { toggleMessage();   emit('showMessage',   !showMessage) },
    },
  ]

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">
        Stage Widgets
      </p>
      {widgets.map(({ label, icon: Icon, active, toggle }) => (
        <button
          key={label}
          onClick={toggle}
          className={cn(
            'w-full flex items-center justify-between rounded-md px-3 py-2 border text-xs font-medium transition-colors',
            active
              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
              : 'border-white/[0.06] text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
          )}
        >
          <span className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          <span className={cn(
            'text-[10px] font-semibold uppercase tracking-wider',
            active ? 'text-indigo-400' : 'text-white/20'
          )}>
            {active ? 'On' : 'Off'}
          </span>
        </button>
      ))}
    </div>
  )
}
