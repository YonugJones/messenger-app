import type { RequestHandler } from 'express'
import { AppError } from '../../lib/errors.js'
import {
  listConversationsForUser,
  getOrCreateDirectConversation,
} from './conversations.service.js'

export const listConversations: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401)
    const conversations = await listConversationsForUser(req.user.id)
    res.json({ ok: true, conversations })
  } catch (err) {
    next(err)
  }
}

export const createConversation: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401)

    const conversation = await getOrCreateDirectConversation({
      userId: req.user.id,
      recipientUserId: req.body.recipientUserId,
    })

    res.status(201).json({ ok: true, conversation })
  } catch (err) {
    next(err)
  }
}
