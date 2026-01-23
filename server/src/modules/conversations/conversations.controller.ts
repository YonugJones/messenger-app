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
  const { recipientUsername } = req.body
  try {
    if (!req.user) throw new AppError('Unauthorized', 401)

    const conversation = await getOrCreateDirectConversation({
      userId: req.user.id,
      recipientUsername,
    })

    res.status(201).json({ ok: true, conversation })
  } catch (err) {
    next(err)
  }
}
