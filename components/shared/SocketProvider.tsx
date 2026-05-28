'use client'

import { useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'
import { usePresentationStore } from '@/stores/presentation.store'
import { useStageStore } from '@/stores/stage-theme.store'
import { useServiceStore } from '@/stores/service.store'

interface SocketProviderProps {
  role: 'operator' | 'output' | 'stage'
  children: React.ReactNode
}

/**
 * SocketProvider registers socket event listeners and binds them to
 * the appropriate Zustand stores. Mount once per page at the root.
 */
export function SocketProvider({ role, children }: SocketProviderProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const socket = getSocket()

    // Tell the server what role this client has
    socket.emit('client:ready', role)

    if (role === 'output') {
      // ── Output screen listeners ──────────────────────────
      socket.on('output:slide', (payload) => {
        const store = usePresentationStore.getState()
        // Reconstruct queue state from payload for output screen
        // (output only cares about current + next for rendering)
        store.loadSlides(
          // We receive individual slides, not full queue — build minimal queue
          [payload.currentSlide, payload.nextSlide].filter(Boolean) as any,
        )
        // Override index since we only have 2 slides in the local mini-queue
        usePresentationStore.setState({ currentIndex: 0 })
      })

      socket.on('output:mode', ({ mode }) => {
        usePresentationStore.setState({ mode })
      })

      socket.on('output:background', ({ background }) => {
        usePresentationStore.setState({ background })
      })

      socket.on('output:theme', ({ theme }) => {
        usePresentationStore.setState({ theme })
      })
    }

    if (role === 'stage') {
      // ── Stage display listeners ──────────────────────────
      socket.on('stage:update', (payload) => {
        useStageStore.getState().updateFromPresentation(payload)
      })

      socket.on('stage:message', ({ message, visible }) => {
        useStageStore.setState({ message, messageVisible: visible })
      })

      socket.on('stage:timer', ({ endsAt, running, label }) => {
        useStageStore.setState({
          timerEndsAt: endsAt,
          timerRunning: running,
          timerLabel: label ?? '',
        })
      })

      // Operator toggled widget visibility remotely
      socket.on('stage:widgets' as any, (payload: Record<string, boolean>) => {
        useStageStore.setState(payload as any)
      })
    }

    if (role === 'operator') {
      // ── Operator listeners (multi-operator sync) ─────────
      socket.on('service:sync', ({ planId, items, activeItemIndex }) => {
        useServiceStore.getState().syncFromSocket(planId, items, activeItemIndex)
      })
    }

    // Keep-alive ping every 30s
    const pingInterval = setInterval(() => {
      socket.emit('client:ping')
    }, 30_000)

    return () => {
      clearInterval(pingInterval)
      socket.off('output:slide')
      socket.off('output:mode')
      socket.off('output:background')
      socket.off('output:theme')
      socket.off('stage:update')
      socket.off('stage:message')
      socket.off('stage:timer')
      socket.off('service:sync')
    }
  }, [role])

  return <>{children}</>
}
