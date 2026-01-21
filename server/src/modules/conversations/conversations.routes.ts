import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { validateBody } from '../../middleware/validate.js'
import { CreateConversationSchema } from './conversations.schema.js'
import {
  listConversations,
  createConversation,
} from './conversations.controller.js'

export const conversationsRouter = Router()

conversationsRouter.get('/', requireAuth, listConversations)
conversationsRouter.post(
  '/',
  requireAuth,
  validateBody(CreateConversationSchema),
  createConversation,
)
