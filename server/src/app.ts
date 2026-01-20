import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { notFound } from './middleware/notFound'
import { errorHandler } from './middleware/errorHandler'
import { prisma } from './lib/prisma.js'

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

app.use(notFound)
app.use(errorHandler)
