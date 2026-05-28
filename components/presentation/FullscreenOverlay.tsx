'use client'

import { useState, useEffect, useCallback } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export function FullscreenOverlay() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [hideTimer, setHideTimer]       = useState<ReturnType<typeof setTimeout>>()

  // Track native fullscreen state
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {})
    } else {
      await document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Show/hide controls on mouse move
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimer)
    const t = setTimeout(() => setShowControls(false), 2500)
    setHideTimer(t)
  }, [hideTimer])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(hideTimer)
    }
  }, [handleMouseMove])

  // F key = fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleFullscreen])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}
    >
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-black/80 text-xs transition-colors"
      >
        {isFullscreen
          ? <><Minimize2 className="h-3.5 w-3.5" /> Exit</>
          : <><Maximize2 className="h-3.5 w-3.5" /> Fullscreen</>
        }
      </button>
    </div>
  )
}
