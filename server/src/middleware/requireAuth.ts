import type { RequestHandler } from 'express'
import { AppError } from '../lib/errors.js'
import { ACCESS_COOKIE_NAME } from '../modules/auth/auth.cookies.js'
import { verifyAccessToken } from '../modules/auth/auth.tokens.js'

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE_NAME]
  if (!token) return next(new AppError('Unauthorized', 401))

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub }
    return next()
  } catch {
    return next(new AppError('Unauthorized', 401))
  }
}
