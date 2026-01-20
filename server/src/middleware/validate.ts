import type { RequestHandler } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'

export function validateBody(schema: z.ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return next(new AppError(result.error.message, 400))
    }

    req.body = result.data
    return next()
  }
}
