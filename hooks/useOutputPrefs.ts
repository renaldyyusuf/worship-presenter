'use client'

import { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'

export interface OutputDisplayPrefs {
  showProgressBar:  boolean
  showSectionLabel: boolean
  showSlideNumber:  boolean
}

/**
 * useOutputPrefs
 *
 * Reads display preferences for the /output page.
 * Priority order:
 *  1. URL params (?progress=0&label=0) for direct override
 *  2. Socket event 'output:prefs' from operator
 *  3. Defaults from settings
 */
export function useOutputPrefs(): OutputDisplayPrefs {
  const [prefs, setPrefs] = useState<OutputDisplayPrefs>({
    showProgressBar:  true,
    showSectionLabel: true,
    showSlideNumber:  false,
  })

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(window.location.search)
    const fromUrl: Partial<OutputDisplayPrefs> = {}

    if (params.has('progress')) fromUrl.showProgressBar  = params.get('progress') !== '0'
    if (params.has('label'))    fromUrl.showSectionLabel = params.get('label')    !== '0'
    if (params.has('number'))   fromUrl.showSlideNumber  = params.get('number')   === '1'

    if (Object.keys(fromUrl).length > 0) {
      setPrefs((p) => ({ ...p, ...fromUrl }))
    }

    // Listen for runtime pref changes from operator
    const socket = getSocket()
    socket.on('output:prefs' as any, (payload: Partial<OutputDisplayPrefs>) => {
      setPrefs((p) => ({ ...p, ...payload }))
    })

    return () => { socket.off('output:prefs' as any) }
  }, [])

  return prefs
}
