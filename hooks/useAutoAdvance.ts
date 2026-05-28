'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePresentationStore } from '@/stores/presentation.store'

export type AutoAdvanceMode = 'off' | 'fixed' | 'perSlide'

interface AutoAdvanceOptions {
  mode:          AutoAdvanceMode
  intervalSec:   number   // seconds between slides (fixed mode)
}

interface AutoAdvanceState {
  mode:        AutoAdvanceMode
  intervalSec: number
  running:     boolean
  remaining:   number    // ms until next advance
  progress:    number    // 0–1
}

/**
 * useAutoAdvance
 *
 * Automatically advances slides on a timer.
 * Modes:
 *   off      — disabled
 *   fixed    — advance every N seconds regardless of slide
 *   perSlide — respect each slide's `durationMs` field (falls back to intervalSec)
 */
export function useAutoAdvance(opts: AutoAdvanceOptions = { mode: 'off', intervalSec: 5 }) {
  const { goNext, slideQueue, currentIndex, mode: screenMode } = usePresentationStore()

  const [state, setState] = useState<AutoAdvanceState>({
    mode:        opts.mode,
    intervalSec: opts.intervalSec,
    running:     false,
    remaining:   opts.intervalSec * 1000,
    progress:    0,
  })

  const intervalRef   = useRef<ReturnType<typeof setInterval>>()
  const endTimeRef    = useRef<number>(0)
  const durationRef   = useRef<number>(opts.intervalSec * 1000)

  const getDuration = useCallback(() => {
    const slide = slideQueue[currentIndex]
    if (slide?.durationMs && state.mode === 'perSlide') return slide.durationMs
    return state.intervalSec * 1000
  }, [slideQueue, currentIndex, state.mode, state.intervalSec])

  const tick = useCallback(() => {
    const now       = Date.now()
    const remaining = Math.max(0, endTimeRef.current - now)
    const progress  = 1 - remaining / durationRef.current

    setState((s) => ({ ...s, remaining, progress }))

    if (remaining === 0) {
      // Don't advance when screen is blacked out or on last slide
      const { mode: sm, currentIndex: ci, slideQueue: sq } = usePresentationStore.getState()
      if (sm !== 'normal' || ci >= sq.length - 1) return
      goNext()
    }
  }, [goNext])

  const start = useCallback((overrideSec?: number) => {
    clearInterval(intervalRef.current)
    const duration      = (overrideSec ?? state.intervalSec) * 1000
    durationRef.current = duration
    endTimeRef.current  = Date.now() + duration
    setState((s) => ({ ...s, running: true, remaining: duration, progress: 0 }))
    intervalRef.current = setInterval(tick, 100)
  }, [state.intervalSec, tick])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setState((s) => ({ ...s, running: false, remaining: durationRef.current, progress: 0 }))
  }, [])

  const setMode = useCallback((mode: AutoAdvanceMode) => {
    setState((s) => ({ ...s, mode }))
    if (mode === 'off') stop()
  }, [stop])

  const setIntervalSec = useCallback((sec: number) => {
    setState((s) => ({ ...s, intervalSec: sec }))
  }, [])

  // Restart timer when slide changes (in running mode)
  useEffect(() => {
    if (!state.running) return
    const duration      = getDuration()
    durationRef.current = duration
    endTimeRef.current  = Date.now() + duration
    setState((s) => ({ ...s, remaining: duration, progress: 0 }))
  }, [currentIndex])

  // Pause when screen goes non-normal
  useEffect(() => {
    if (screenMode !== 'normal' && state.running) {
      clearInterval(intervalRef.current)
    } else if (screenMode === 'normal' && state.running) {
      endTimeRef.current  = Date.now() + state.remaining
      intervalRef.current = setInterval(tick, 100)
    }
  }, [screenMode])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return { ...state, start, stop, setMode, setIntervalSec }
}
