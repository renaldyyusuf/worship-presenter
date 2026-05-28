'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface UseCountdownOptions {
  onComplete?: () => void
  tickMs?: number
}

interface CountdownState {
  remaining: number      // ms remaining
  running: boolean
  progress: number       // 0–1
}

export function useCountdown(
  durationMs: number,
  { onComplete, tickMs = 100 }: UseCountdownOptions = {}
) {
  const [state, setState] = useState<CountdownState>({
    remaining: durationMs,
    running: false,
    progress: 0,
  })
  const endTimeRef    = useRef<number | null>(null)
  const intervalRef   = useRef<ReturnType<typeof setInterval>>()
  const completedRef  = useRef(false)

  const tick = useCallback(() => {
    if (!endTimeRef.current) return
    const remaining = Math.max(0, endTimeRef.current - Date.now())
    const progress  = 1 - remaining / durationMs

    setState({ remaining, running: remaining > 0, progress })

    if (remaining === 0 && !completedRef.current) {
      completedRef.current = true
      clearInterval(intervalRef.current)
      onComplete?.()
    }
  }, [durationMs, onComplete])

  const start = useCallback(() => {
    completedRef.current = false
    endTimeRef.current   = Date.now() + durationMs
    setState({ remaining: durationMs, running: true, progress: 0 })
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, tickMs)
  }, [durationMs, tick, tickMs])

  const pause = useCallback(() => {
    clearInterval(intervalRef.current)
    setState((s) => ({ ...s, running: false }))
  }, [])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    endTimeRef.current = null
    completedRef.current = false
    setState({ remaining: durationMs, running: false, progress: 0 })
  }, [durationMs])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  // Format helpers
  const totalSec = Math.ceil(state.remaining / 1000)
  const minutes  = Math.floor(totalSec / 60)
  const seconds  = totalSec % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { ...state, start, pause, reset, formatted, minutes, seconds }
}
