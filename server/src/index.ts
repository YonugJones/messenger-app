import { createServer } from 'node:http'
import { app } from './app.js'
import { env } from './config/env.js'

const server = createServer(app)

server.listen(env.PORT, () => {
  // Basic for now. Will be switched to a logger wrapper later
  console.log(`[server] listening on http://localhost:${env.PORT}`)
})
