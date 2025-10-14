const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { setupWebSocketServer } = require('./lib/websocket.js')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Створюємо Next.js додаток
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Створюємо HTTP сервер
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Налаштовуємо WebSocket сервер
  const io = setupWebSocketServer(server)
  
  // Зберігаємо io в глобальному об'єкті для використання в API
  global.io = io

  server.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server running on ws://${hostname}:${port}`)
  })
})
