'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SocketProvider } from '@/components/shared/SocketProvider'
import { getSocket } from '@/lib/socket'

/**
 * /countdown page
 *
 * A standalone fullscreen countdown timer for pre-service use.
 * Open in a browser tab on the audience screen while waiting for service to start.
 *
 * URL params:
 *   ?minutes=10        — countdown duration (default 10)
 *   ?label=Starting+Soon — message shown above timer
 *   ?bg=%23000000     — background color hex
 *   ?autostart=1      — start immediately on load
 *
 * Also responds to socket event 'countdown:start' from operator.
 */
export default function CountdownPage() {
  return (
    <SocketProvider role="output">
      <Suspense fallback={<div className="bg-black w-screen h-screen" />}>
        <CountdownScreen />
      </Suspense>
    </SocketProvider>
  )
}

function CountdownScreen() {
  const params     = useSearchParams()
  const minutes    = parseInt(params.get('minutes') ?? '10')
  const label      = params.get('label') ?? 'Service Starting Soon'
  const bgColor    = params.get('bg') ?? '#000000'
  const autostart  = params.get('autostart') === '1'

  const [endsAt, setEndsAt]     = useState<number | null>(null)
  const [remaining, setRemaining] = useState(minutes * 60 * 1000)
  const [running, setRunning]   = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const start = (durationMs?: number) => {
    const end = Date.now() + (durationMs ?? remaining)
    setEndsAt(end)
    setRunning(true)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const r = Math.max(0, end - Date.now())
      setRemaining(r)
      if (r === 0) { clearInterval(intervalRef.current); setRunning(false) }
    }, 100)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setRemaining(minutes * 60 * 1000)
    setEndsAt(null)
  }

  // Autostart on load
  useEffect(() => {
    if (autostart) start()
    return () => clearInterval(intervalRef.current)
  }, [])

  // Listen for socket control from operator
  useEffect(() => {
    const socket = getSocket()
    socket.on('countdown:start' as any, ({ durationMs }: { durationMs: number }) => start(durationMs))
    socket.on('countdown:stop'  as any, reset)
    return () => {
      socket.off('countdown:start' as any)
      socket.off('countdown:stop'  as any)
    }
  }, [])

  const totalSec   = Math.ceil(remaining / 1000)
  const mins       = Math.floor(totalSec / 60)
  const secs       = totalSec % 60
  const isDone     = remaining === 0
  const isUrgent   = totalSec <= 60 && running
  const pct        = endsAt ? 1 - remaining / (minutes * 60 * 1000) : 0

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Label */}
      <p className="text-white/50 text-xl font-medium tracking-wider uppercase mb-8">
        {isDone ? 'Starting Now' : label}
      </p>

      {/* Timer */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Ring */}
        {running && !isDone && (
          <svg className="absolute" width="260" height="260" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4" />
            <circle
              cx="130" cy="130" r="120"
              fill="none"
              stroke={isUrgent ? '#ef4444' : 'rgba(255,255,255,.25)'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * pct}`}
              transform="rotate(-90 130 130)"
              className="transition-all duration-100"
            />
          </svg>
        )}

        <p className={`text-[96px] font-mono font-bold tabular-nums leading-none transition-colors ${
          isDone ? 'text-white' : isUrgent ? 'text-red-400' : 'text-white/90'
        }`}>
          {`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`}
        </p>
      </div>

      {/* Progress bar */}
      {running && !isDone && (
        <div className="w-64 h-1 rounded-full bg-white/[0.08] overflow-hidden mb-8">
          <div
            className="h-full bg-white/30 transition-all duration-100"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      )}

      {/* Controls (visible on hover) */}
      {!autostart && (
        <div className="flex gap-3 mt-4 opacity-20 hover:opacity-100 transition-opacity">
          {!running ? (
            <button
              onClick={() => start()}
              className="h-9 px-6 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
            >
              Start
            </button>
          ) : (
            <button
              onClick={reset}
              className="h-9 px-6 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {isDone && (
        <p className="text-white/30 text-sm animate-pulse mt-4">Service is starting…</p>
      )}
    </div>
  )
}
