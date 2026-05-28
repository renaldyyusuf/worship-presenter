import { Server as SocketServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types'

// Track connected clients by role
const connectedClients = new Map<string, 'output' | 'stage' | 'operator'>()

export function initSocketServer(httpServer: HTTPServer) {
  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`)

    // Client declares its role on connect
    socket.on('client:ready', (role) => {
      connectedClients.set(socket.id, role)
      socket.join(role)  // join role-specific room
      console.log(`[socket] ${socket.id} joined as ${role}`)
    })

    socket.on('client:ping', () => {
      socket.emit   // keep-alive, no response needed
    })

    // ── Operator → Output & Stage ────────────────────────────
    // These are fired by the operator's presentationStore._emit()
    socket.on('output:slide' as any, (payload: any) => {
      socket.to('output').emit('output:slide', payload)
      socket.to('stage').emit('stage:update', {
        currentSlide: payload.currentSlide,
        nextSlide: payload.nextSlide,
        currentIndex: payload.currentIndex,
        totalSlides: payload.totalSlides,
        mode: 'normal',
      })
    })

    socket.on('output:mode' as any, (payload: any) => {
      socket.to('output').emit('output:mode', payload)
      // Also pass mode to stage
      socket.to('stage').emit('stage:update', {
        currentSlide: null,
        nextSlide: null,
        currentIndex: 0,
        totalSlides: 0,
        mode: payload.mode,
        ...payload,
      })
    })

    socket.on('output:background' as any, (payload: any) => {
      socket.to('output').emit('output:background', payload)
    })

    socket.on('output:theme' as any, (payload: any) => {
      socket.to('output').emit('output:theme', payload)
    })

    // ── Operator → Stage only ────────────────────────────────
    socket.on('stage:message' as any, (payload: any) => {
      socket.to('stage').emit('stage:message', payload)
    })

    socket.on('stage:timer' as any, (payload: any) => {
      socket.to('stage').emit('stage:timer', payload)
    })

    // Widget visibility toggles from operator
    socket.on('stage:widgets' as any, (payload: any) => {
      socket.to('stage').emit('stage:widgets' as any, payload)
    })

    // ── Service sync → all operators ────────────────────────
    socket.on('service:sync' as any, (payload: any) => {
      // Broadcast to all OTHER operators (not the sender)
      socket.to('operator').emit('service:sync', payload)
    })

    socket.on('disconnect', (reason) => {
      const role = connectedClients.get(socket.id)
      connectedClients.delete(socket.id)
      console.log(`[socket] ${socket.id} (${role}) disconnected: ${reason}`)
    })
  })

  return io
}

// ─────────────────────────────────────────────
// Next.js custom server entry (server.ts at project root)
// ─────────────────────────────────────────────
// Usage in server.ts:
//
// import { createServer } from 'http'
// import next from 'next'
// import { initSocketServer } from './server/socket-server'
//
// const dev = process.env.NODE_ENV !== 'production'
// const app = next({ dev })
// const handle = app.getRequestHandler()
//
// app.prepare().then(() => {
//   const httpServer = createServer((req, res) => handle(req, res))
//   initSocketServer(httpServer)
//   httpServer.listen(3000, () => console.log('> Ready on http://localhost:3000'))
// })
