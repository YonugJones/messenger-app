import type { RequestHandler } from 'express'
import { AppError } from '../lib/errors'

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
}
