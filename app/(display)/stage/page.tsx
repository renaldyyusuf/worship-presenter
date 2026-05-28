'use client'

import { useEffect, useState } from 'react'
import { useStageStore } from '@/stores/stage-theme.store'
import { SocketProvider } from '@/components/shared/SocketProvider'
import { cn } from '@/lib/utils'

export default function StagePage() {
  return (
    <SocketProvider role="stage">
      <StageDisplay />
    </SocketProvider>
  )
}

function StageDisplay() {
  const {
    currentSlide, nextSlide, mode,
    message, messageVisible,
    timerEndsAt, timerRunning,
    showClock, showTimer, showNextSlide, showMessage,
  } = useStageStore()

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] text-white overflow-hidden grid select-none"
         style={{ gridTemplateRows: '1fr auto auto', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── CURRENT SLIDE (top-left, large) ─────── */}
      <div className="col-span-2 flex flex-col items-center justify-center px-16 py-10 border-b border-white/[0.06] relative">
        {/* Mode badge */}
        {mode !== 'normal' && (
          <div className={cn(
            'absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest',
            mode === 'black' && 'bg-white/10 text-white/60',
            mode === 'clear' && 'bg-amber-500/20 text-amber-400',
            mode === 'logo'  && 'bg-indigo-500/20 text-indigo-400',
          )}>
            {mode}
          </div>
        )}

        {currentSlide ? (
          <div className="text-center w-full max-w-4xl">
            {currentSlide.sectionLabel && (
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/20 mb-5">
                {currentSlide.sectionLabel}
              </p>
            )}
            <p className="text-4xl font-bold leading-[1.35] text-white whitespace-pre-line">
              {currentSlide.content}
            </p>
            {currentSlide.type === 'bible' && currentSlide.subContent && (
              <p className="mt-6 text-lg text-white/40 font-medium">{currentSlide.subContent}</p>
            )}
          </div>
        ) : (
          <p className="text-white/15 text-2xl font-medium">No slide</p>
        )}
      </div>

      {/* ── NEXT SLIDE (bottom-left) ─────────────── */}
      {showNextSlide && (
        <div className="flex flex-col justify-center px-10 py-6 border-r border-white/[0.06] bg-white/[0.01]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-3">Next</p>
          {nextSlide ? (
            <div>
              {nextSlide.sectionLabel && (
                <p className="text-xs font-medium text-white/25 mb-2 uppercase tracking-wider">
                  {nextSlide.sectionLabel}
                </p>
              )}
              <p className="text-xl font-semibold leading-[1.4] text-white/60 whitespace-pre-line line-clamp-4">
                {nextSlide.content}
              </p>
            </div>
          ) : (
            <p className="text-white/15 text-base">End of queue</p>
          )}
        </div>
      )}

      {/* ── WIDGETS (bottom-right) ───────────────── */}
      <div className="flex flex-col justify-center gap-4 px-10 py-6">
        <ServiceContextWidget />
      {showClock && <ClockWidget />}
        {showTimer && timerEndsAt !== null && <TimerWidget endsAt={timerEndsAt} />}
        {showMessage && messageVisible && message && <MessageWidget message={message} />}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────
// Active service item context
// ─────────────────────────────────────────────
function ServiceContextWidget() {
  const [context, setContext] = useState<{title:string;index:number;total:number} | null>(null)
  
  useEffect(() => {
    const socket = require('@/lib/socket').getSocket()
    socket.on('service:sync', (payload: any) => {
      const item = payload.items?.[payload.activeItemIndex]
      if (item) {
        setContext({ title: item.title, index: payload.activeItemIndex, total: payload.items.length })
      }
    })
    return () => socket.off('service:sync')
  }, [])

  if (!context) return null

  return (
    <div className="border-t border-white/[0.06] pt-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/15 mb-1">Service</p>
      <p className="text-sm font-medium text-white/50 truncate">{context.title}</p>
      <p className="text-[11px] text-white/20 tabular-nums mt-0.5">{context.index + 1} / {context.total}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Live clock
// ─────────────────────────────────────────────
function ClockWidget() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Clock</p>
      <p className="text-4xl font-mono font-semibold text-white/80 tabular-nums">{time}</p>
    </div>
  )
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

// ─────────────────────────────────────────────
// Countdown timer
// ─────────────────────────────────────────────
function TimerWidget({ endsAt }: { endsAt: number }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAt - Date.now()))

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, endsAt - Date.now())
      setRemaining(r)
      if (r === 0) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [endsAt])

  const totalSeconds = Math.ceil(remaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const isUrgent = totalSeconds <= 60
  const isDone = remaining === 0

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">Timer</p>
      <p className={cn(
        'text-4xl font-mono font-semibold tabular-nums transition-colors',
        isDone ? 'text-red-400 animate-pulse' : isUrgent ? 'text-amber-400' : 'text-white/80'
      )}>
        {`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Operator message banner
// ─────────────────────────────────────────────
function MessageWidget({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-indigo-500/15 border border-indigo-500/25 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/70 mb-1">Message</p>
      <p className="text-base font-medium text-indigo-200 leading-snug">{message}</p>
    </div>
  )
}
