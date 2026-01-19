import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

export const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})
