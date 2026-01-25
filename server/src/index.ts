import { createServer } from 'node:http'
import { app } from './app.js'
import { env } from './config/env.js'
import { initSocket } from './socket/io.js'

const httpServer = createServer(app)

initSocket(httpServer)

httpServer.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`)
})
