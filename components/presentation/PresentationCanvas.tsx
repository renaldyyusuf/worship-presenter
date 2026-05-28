'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Slide, SlideTheme, SlideBackground, ScreenMode } from '@/types/presentation'

interface PresentationCanvasProps {
  currentSlide: Slide | null
  mode: ScreenMode
  background: SlideBackground
  theme: SlideTheme
  logoUrl?: string
  className?: string
  // miniature preview mode (right panel)
  preview?: boolean
}

export function PresentationCanvas({
  currentSlide,
  mode,
  background,
  theme,
  logoUrl,
  className,
  preview = false,
}: PresentationCanvasProps) {
  const prevSlideRef = useRef<Slide | null>(null)

  useEffect(() => {
    prevSlideRef.current = currentSlide
  }, [currentSlide])

  // ── Screen mode overrides ────────────────────────────────
  if (mode === 'black') {
    return (
      <div className={cn('relative overflow-hidden bg-black', className)}>
        {preview && <ModeLabel label="BLACK" />}
      </div>
    )
  }

  if (mode === 'clear') {
    return (
      <div className={cn('relative overflow-hidden bg-transparent', className)}>
        {preview && <ModeLabel label="CLEAR" color="text-amber-400" />}
      </div>
    )
  }

  if (mode === 'logo') {
    return (
      <div className={cn('relative overflow-hidden bg-black flex items-center justify-center', className)}>
        {logoUrl ? (
          <img src={logoUrl} alt="Church logo" className="max-w-[60%] max-h-[60%] object-contain" />
        ) : (
          <span className="text-white/20 text-sm">No logo set</span>
        )}
        {preview && <ModeLabel label="LOGO" color="text-indigo-400" />}
      </div>
    )
  }

  // ── Normal mode ──────────────────────────────────────────
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background layer */}
      <BackgroundLayer background={background} />

      {/* Overlay / dimmer */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: background.opacity * 0.5 }}
      />

      {/* Lyrics / content layer */}
      {currentSlide && (
        <ContentLayer slide={currentSlide} theme={theme} preview={preview} />
      )}

      {/* Empty state */}
      {!currentSlide && !preview && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/10 text-lg font-medium">No slide loaded</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Background layer
// ─────────────────────────────────────────────
function BackgroundLayer({ background }: { background: SlideBackground }) {
  if (background.type === 'color') {
    return (
      <div
        className="absolute inset-0"
        style={{ backgroundColor: background.value }}
      />
    )
  }

  if (background.type === 'image') {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background.value})`,
          opacity: background.opacity,
        }}
      />
    )
  }

  if (background.type === 'video') {
    return (
      <video
        src={background.value}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: background.opacity }}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }

  return <div className="absolute inset-0 bg-black" />
}

// ─────────────────────────────────────────────
// Content / text layer
// ─────────────────────────────────────────────
function ContentLayer({
  slide,
  theme,
  preview,
}: {
  slide: Slide
  theme: SlideTheme
  preview: boolean
}) {
  const scale = preview ? 0.18 : 1

  const positionClass = {
    top: 'items-start pt-[10%]',
    middle: 'items-center',
    bottom: 'items-end pb-[10%]',
  }[theme.textPosition]

  const textStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    fontSize: preview ? Math.max(theme.fontSize * scale, 8) : theme.fontSize,
    fontWeight: theme.fontWeight,
    textAlign: theme.textAlign,
    color: theme.textColor,
    lineHeight: theme.lineHeight,
    letterSpacing: theme.letterSpacing,
    ...(theme.textShadow.enabled && {
      textShadow: `${theme.textShadow.x}px ${theme.textShadow.y}px ${theme.textShadow.blur}px ${theme.textShadow.color}`,
    }),
    ...(theme.textStroke.enabled && {
      WebkitTextStroke: `${theme.textStroke.width}px ${theme.textStroke.color}`,
    }),
  }

  return (
    <div className={cn('absolute inset-0 flex flex-col justify-center px-[8%]', positionClass)}>
      {/* Section label (small, above text) */}
      {slide.sectionLabel && !preview && (
        <p className="text-white/30 text-sm font-medium mb-4 uppercase tracking-widest"
           style={{ textAlign: theme.textAlign }}>
          {slide.sectionLabel}
        </p>
      )}

      {/* Main content */}
      <p style={textStyle} className="whitespace-pre-line">
        {slide.content}
      </p>

      {/* Sub content (verse reference, etc.) */}
      {slide.subContent && slide.type === 'bible' && !preview && (
        <p className="text-white/50 mt-6 text-base font-medium"
           style={{ textAlign: theme.textAlign }}>
          {slide.subContent}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Mode overlay label (preview only)
// ─────────────────────────────────────────────
function ModeLabel({ label, color = 'text-white/50' }: { label: string; color?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className={cn('text-[10px] font-bold tracking-widest', color)}>{label}</span>
    </div>
  )
}
