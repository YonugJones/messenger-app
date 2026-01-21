import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { validateBody } from '../../middleware/validate.js'
import { SendMessageSchema } from './messages.schemas.js'
import { createMessage, getMessages } from './messages.controller.js'

export const messagesRouter = Router({ mergeParams: true })

messagesRouter.get('/', requireAuth, getMessages)
messagesRouter.post(
  '/',
  requireAuth,
  validateBody(SendMessageSchema),
  createMessage,
)
