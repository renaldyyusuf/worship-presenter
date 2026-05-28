'use client'

import type { SlideTheme, SlideBackground } from '@/types/presentation'
import { DEFAULT_BACKGROUND } from '@/types/presentation'

interface ThemePreviewProps {
  theme: Partial<SlideTheme>
  text?: string
  background?: SlideBackground
  className?: string
}

export function ThemePreview({
  theme,
  text = 'Amazing grace\nhow sweet the sound',
  background = DEFAULT_BACKGROUND,
  className = '',
}: ThemePreviewProps) {
  const textStyle: React.CSSProperties = {
    fontFamily:   theme.fontFamily  ?? 'Inter',
    fontSize:     (theme.fontSize   ?? 52) * 0.12,   // scale for preview box
    fontWeight:   theme.fontWeight  ?? 600,
    textAlign:    theme.textAlign   ?? 'center',
    color:        theme.textColor   ?? '#ffffff',
    lineHeight:   theme.lineHeight  ?? 1.4,
    letterSpacing: `${theme.letterSpacing ?? 0}em`,
    whiteSpace:   'pre-line',
    ...(theme.textShadow?.enabled && {
      textShadow: `${theme.textShadow.x}px ${theme.textShadow.y}px ${theme.textShadow.blur}px ${theme.textShadow.color}`,
    }),
    ...(theme.textStroke?.enabled && {
      WebkitTextStroke: `${theme.textStroke.width * 0.15}px ${theme.textStroke.color}`,
    }),
  }

  const bgStyle: React.CSSProperties = {
    backgroundColor: background.type === 'color' ? background.value : '#000',
  }

  const alignClass = {
    top:    'justify-start pt-[10%]',
    middle: 'justify-center',
    bottom: 'justify-end pb-[10%]',
  }[theme.textPosition ?? 'middle']

  return (
    <div
      className={`relative aspect-video rounded-md overflow-hidden flex flex-col items-center px-[8%] ${alignClass} ${className}`}
      style={bgStyle}
    >
      {/* Background image/video */}
      {background.type === 'image' && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background.value})`, opacity: background.opacity }}
        />
      )}
      {background.type === 'video' && (
        <video
          src={background.value}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: background.opacity }}
          autoPlay loop muted playsInline
        />
      )}

      {/* Dim overlay */}
      {background.type !== 'color' && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Text */}
      <p className="relative z-10 w-full" style={textStyle}>{text}</p>
    </div>
  )
}
