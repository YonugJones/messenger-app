import type { RequestHandler } from 'express'
import { AppError } from '../../lib/errors.js'
import {
  ConversationIdParamSchema,
  ListMessagesQuerySchema,
} from './messages.schemas.js'
import { listMessages, sendMessage } from './messages.service.js'

export const createMessage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401)

    const paramsParsed = ConversationIdParamSchema.safeParse(req.params)
    if (!paramsParsed.success)
      throw new AppError(paramsParsed.error.message, 400)

    const message = await sendMessage({
      conversationId: paramsParsed.data.id,
      senderId: req.user.id,
      content: req.body.content,
    })

    res.status(201).json({ ok: true, message })
  } catch (err) {
    next(err)
  }
}

export const getMessages: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401)

    const paramsParsed = ConversationIdParamSchema.safeParse(req.params)
    if (!paramsParsed.success)
      throw new AppError(paramsParsed.error.message, 400)

    const queryParsed = ListMessagesQuerySchema.safeParse(req.query)
    if (!queryParsed.success) throw new AppError(queryParsed.error.message, 400)

    const result = await listMessages({
      conversationId: paramsParsed.data.id,
      userId: req.user.id,
      cursor: queryParsed.data.cursor,
      limit: queryParsed.data.limit,
    })

    res.json({ ok: true, ...result })
  } catch (err) {
    next(err)
  }
}
