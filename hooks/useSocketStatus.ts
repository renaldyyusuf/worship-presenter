'use client'

import { useEffect, useState } from 'react'
import { getSocket, isSocketConnected } from '@/lib/socket'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useSocketStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    isSocketConnected() ? 'connected' : 'connecting'
  )

  useEffect(() => {
    const socket = getSocket()

    const onConnect    = () => setStatus('connected')
    const onDisconnect = () => setStatus('disconnected')
    const onError      = () => setStatus('error')
    const onReconnect  = () => setStatus('connecting')

    socket.on('connect',             onConnect)
    socket.on('disconnect',          onDisconnect)
    socket.on('connect_error',       onError)
    socket.on('reconnect_attempt',   onReconnect)

    // Sync immediately if already connected
    if (socket.connected) setStatus('connected')

    return () => {
      socket.off('connect',           onConnect)
      socket.off('disconnect',        onDisconnect)
      socket.off('connect_error',     onError)
      socket.off('reconnect_attempt', onReconnect)
    }
  }, [])

  return status
}
