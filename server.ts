import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initSocketServer } from './server/socket-server'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME ?? 'localhost'
const port = parseInt(process.env.PORT ?? '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Attach Socket.io to the same HTTP server
  initSocketServer(httpServer)

  httpServer.listen(port, () => {
    console.log(`
  ┌─────────────────────────────────────────┐
  │  WorshipPresenter                       │
  │  Ready on http://${hostname}:${port}           │
  │                                         │
  │  Operator  → /control                  │
  │  Output    → /output                   │
  │  Stage     → /stage                    │
  └─────────────────────────────────────────┘
    `)
  })
})
