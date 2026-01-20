import type { ErrorRequestHandler } from 'express'
import { AppError } from '../lib/errors'
import { env } from '../config/env'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isAppError = err instanceof AppError

  const statusCode = isAppError ? err.statusCode : 500

  // error details only exposed in development
  const message =
    env.NODE_ENV === 'production' && !isAppError
      ? 'Internal Server Error'
      : (err.message ?? 'Unknown error')

  res.status(statusCode).json({
    ok: false,
    error: {
      message,
      statusCode,
    },
  })
}
