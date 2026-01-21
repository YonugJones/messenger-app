import { z } from 'zod'

export const ConversationIdParamSchema = z.object({
  id: z.uuid(),
})

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
})

export const ListMessagesQuerySchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
})
