import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: AppSocket | null = null

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.on('connect', () => {
      console.log('[socket] connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.warn('[socket] disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[socket] connection error:', err.message)
    })
  }

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false
}
