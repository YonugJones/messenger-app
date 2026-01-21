import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { prisma } from './lib/prisma.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { conversationsRouter } from './modules/conversations/conversations.routes.js'
import { messagesRouter } from './modules/messages/messages.routes.js'

export const app = express()

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.get('/debug/users-count', async (_req, res, next) => {
  try {
    const count = await prisma.user.count()
    res.json({ ok: true, count })
  } catch (err) {
    next(err)
  }
})

app.use('/auth', authRouter)
app.use('/conversations', conversationsRouter)
app.use('/conversations/:id/messages', messagesRouter)

app.use(notFound)
app.use(errorHandler)
