'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SocketProvider } from '@/components/shared/SocketProvider'
import { FullscreenOverlay } from '@/components/presentation/FullscreenOverlay'
import { SlideProgressBar } from '@/components/presentation/SlideProgressBar'
import { useOutputPrefs } from '@/hooks/useOutputPrefs'
import type { Slide, SlideTheme, SlideBackground, ScreenMode } from '@/types/presentation'
import { DEFAULT_THEME, DEFAULT_BACKGROUND } from '@/types/presentation'
import type { TransitionType } from '@/lib/transitions'
import { TRANSITION_CLASSES } from '@/lib/transitions'
import { getSocket } from '@/lib/socket'
import { cn } from '@/lib/utils'

interface OutputState {
  currentSlide: Slide | null
  nextSlide:    Slide | null
  mode:         ScreenMode
  background:   SlideBackground
  theme:        SlideTheme
  logoUrl:      string
  transition:   TransitionType
  transitionMs: number
  currentIndex: number
  totalSlides:  number
}

export default function OutputPage() {
  return (
    <SocketProvider role="output">
      <OutputScreen />
      <FullscreenOverlay />
    </SocketProvider>
  )
}

function OutputScreen() {
  const prefs = useOutputPrefs()
  const [state, setState] = useState<OutputState>({
    currentSlide: null,
    nextSlide:    null,
    mode:         'normal',
    background:   DEFAULT_BACKGROUND,
    theme:        DEFAULT_THEME,
    logoUrl:      '',
    transition:   'fade',
    transitionMs: 400,
    currentIndex: 0,
    totalSlides:  0,
  })

  const [displaySlide, setDisplaySlide] = useState<Slide | null>(null)
  const [prevSlide,    setPrevSlide]    = useState<Slide | null>(null)
  const [enterClass,   setEnterClass]   = useState('')
  const [exitClass,    setExitClass]    = useState('')
  const [transitioning,setTransitioning]= useState(false)
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>()

  // Wire socket events
  useEffect(() => {
    const socket = getSocket()

    socket.on('output:slide', (payload) => {
      setState((s) => ({
        ...s,
        currentSlide: payload.currentSlide,
        nextSlide:    payload.nextSlide,
        currentIndex: payload.currentIndex,
        totalSlides:  payload.totalSlides,
      }))
    })
    socket.on('output:mode',       ({ mode })       => setState((s) => ({ ...s, mode })))
    socket.on('output:background', ({ background }) => setState((s) => ({ ...s, background })))
    socket.on('output:theme',      ({ theme })      => setState((s) => ({ ...s, theme })))
    socket.on('output:transition' as any, (payload: any) => {
      setState((s) => ({ ...s, transition: payload.type, transitionMs: payload.durationMs }))
    })

    return () => {
      socket.off('output:slide')
      socket.off('output:mode')
      socket.off('output:background')
      socket.off('output:theme')
      socket.off('output:transition' as any)
    }
  }, [])

  // Run configured transition when slide changes
  useEffect(() => {
    const incoming = state.currentSlide
    if (incoming?.id === displaySlide?.id) return

    clearTimeout(fadeTimer.current)

    const { transition, transitionMs } = state
    const classes = TRANSITION_CLASSES[transition]

    if (transition === 'cut') {
      // Instant — no animation
      setDisplaySlide(incoming)
      setPrevSlide(null)
      return
    }

    setPrevSlide(displaySlide)
    setEnterClass(classes.enter)
    setExitClass(classes.exit)
    setTransitioning(true)
    setDisplaySlide(incoming)

    fadeTimer.current = setTimeout(() => {
      setPrevSlide(null)
      setTransitioning(false)
      setEnterClass('')
      setExitClass('')
    }, transitionMs + 50)

    return () => clearTimeout(fadeTimer.current)
  }, [state.currentSlide?.id])

  const { mode, background, theme, logoUrl } = state

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">

      {/* Background */}
      {mode !== 'black' && mode !== 'logo' && (
        <BackgroundLayer background={background} />
      )}

      {/* Dimmer */}
      {mode === 'normal' && background.type !== 'color' && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />
      )}

      {/* Previous slide (exit animation) */}
      {prevSlide && mode === 'normal' && (
        <SlideContent
          key={`prev-${prevSlide.id}`}
          slide={prevSlide}
          theme={theme}
          className={cn('z-20', exitClass)}
          durationMs={state.transitionMs}
          showSectionLabel={prefs.showSectionLabel}
        />
      )}

      {/* Current slide (enter animation) */}
      {displaySlide && mode === 'normal' && (
        <SlideContent
          key={`curr-${displaySlide.id}`}
          slide={displaySlide}
          theme={theme}
          className={cn('z-30', enterClass)}
          durationMs={state.transitionMs}
          showSectionLabel={prefs.showSectionLabel}
        />
      )}

      {/* No-slide placeholder */}
      {!displaySlide && mode === 'normal' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <span className="text-white/5 text-lg font-medium select-none">No slide loaded</span>
        </div>
      )}

      {/* BLACK */}
      {mode === 'black' && <div className="absolute inset-0 z-50 bg-black" />}

      {/* LOGO */}
      {mode === 'logo' && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          {logoUrl
            ? <img src={logoUrl} alt="Logo" className="max-w-[50vw] max-h-[50vh] object-contain" />
            : <span className="text-white/10 text-2xl tracking-widest uppercase">No Logo</span>}
        </div>
      )}

      {/* Slide progress bar */}
      <SlideProgressBar
        current={state.currentIndex}
        total={state.totalSlides}
        visible={prefs.showProgressBar && mode === 'normal' && state.totalSlides > 1}
      />
    </div>
  )
}

// ─── Background ───────────────────────────────
function BackgroundLayer({ background }: { background: SlideBackground }) {
  if (background.type === 'color') {
    return <div className="absolute inset-0 z-0 transition-colors duration-500" style={{ backgroundColor: background.value }} />
  }
  if (background.type === 'image') {
    return (
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background.value})`, opacity: background.opacity }} />
    )
  }
  if (background.type === 'video') {
    return (
      <video src={background.value} className="absolute inset-0 z-0 w-full h-full object-cover"
        style={{ opacity: background.opacity }} autoPlay loop muted playsInline />
    )
  }
  return <div className="absolute inset-0 z-0 bg-black" />
}

// ─── Slide content ────────────────────────────
function SlideContent({ slide, theme, className, durationMs, showSectionLabel = true }: {
  slide: Slide; theme: SlideTheme; className?: string; durationMs?: number; showSectionLabel?: boolean
}) {
  const posClass = { top: 'justify-start pt-[10vh]', middle: 'justify-center', bottom: 'justify-end pb-[10vh]' }[theme.textPosition]

  const textStyle: React.CSSProperties = {
    fontFamily:    theme.fontFamily,
    fontSize:      `${theme.fontSize}px`,
    fontWeight:    theme.fontWeight,
    textAlign:     theme.textAlign,
    color:         theme.textColor,
    lineHeight:    theme.lineHeight,
    letterSpacing: `${theme.letterSpacing}em`,
    whiteSpace:    'pre-line',
    ...(theme.textShadow?.enabled && {
      textShadow: `${theme.textShadow.x}px ${theme.textShadow.y}px ${theme.textShadow.blur}px ${theme.textShadow.color}`,
    }),
    ...(theme.textStroke?.enabled && {
      WebkitTextStroke: `${theme.textStroke.width}px ${theme.textStroke.color}`,
    }),
  }

  // Apply custom duration to CSS animation
  const durationStyle: React.CSSProperties = durationMs
    ? ({ '--animation-duration': `${durationMs}ms` } as any)
    : {}

  return (
    <div className={cn('absolute inset-0 flex flex-col items-center px-[8vw]', posClass, className)}
      style={durationStyle}>
      {showSectionLabel && slide.sectionLabel && slide.type === 'lyrics' && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-[.2em] text-white/20"
          style={{ textAlign: theme.textAlign, width: '100%' }}>
          {slide.sectionLabel}
        </p>
      )}
      <p style={textStyle} className="w-full">{slide.content}</p>
      {slide.type === 'bible' && slide.subContent && (
        <p className="mt-8 text-xl font-medium w-full" style={{ color: 'rgba(255,255,255,.45)', textAlign: theme.textAlign, fontFamily: theme.fontFamily }}>
          {slide.subContent}
        </p>
      )}
    </div>
  )
}
