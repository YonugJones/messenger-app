import type { Server as HttpServer } from 'node:http'
import { Server, type DefaultEventsMap } from 'socket.io'
import cookie from 'cookie'
import { env } from '../config/env.js'
import { verifyAccessToken } from '../modules/auth/auth.tokens.js'
import { ACCESS_COOKIE_NAME } from '../modules/auth/auth.cookies.js'
import { assertUserIsConversationMember } from '../modules/conversations/conversations.service.js'

type SocketData = {
  userId: string
}

let io: Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
> | null = null

export function initSocket(httpServer: HttpServer) {
  io = new Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie
      if (!raw) return next(new Error('Unauthorized'))

      const cookies = cookie.parse(raw)
      const token = cookies[ACCESS_COOKIE_NAME]
      if (!token) return next(new Error('Unauthorized'))

      const payload = verifyAccessToken(token)

      socket.data.userId = payload.sub
      socket.join(`user:${payload.sub}`)

      return next()
    } catch {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    console.log('[socket] connected', socket.id, socket.data.userId)

    socket.on('conversation:join', async (conversationId: string) => {
      if (typeof conversationId !== 'string') return

      try {
        await assertUserIsConversationMember({
          conversationId,
          userId: socket.data.userId,
        })

        socket.join(`conversation:${conversationId}`)
      } catch {
        // Optional: tell client they are not allowed
        socket.emit('conversation:error', {
          conversationId,
          message: 'Forbidden',
        })
      }
    })

    socket.on('conversation:leave', (conversationId: string) => {
      if (typeof conversationId !== 'string') return
      socket.leave(`conversation:${conversationId}`)
    })

    socket.on('disconnect', () => {
      console.log('[socket] disconnected', socket.id, socket.data.userId)
    })
  })

  return io
}

export function getIO(): NonNullable<typeof io> {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}
