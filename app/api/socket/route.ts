// This route exists to handle the Socket.io HTTP upgrade.
// The actual Socket.io server is initialized in server.ts via initSocketServer().
// This file just ensures Next.js doesn't 404 the /api/socket path.

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { status: 'Socket.io is handled by the custom server' },
    { status: 200 }
  )
}
