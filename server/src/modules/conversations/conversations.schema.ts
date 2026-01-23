import { z } from 'zod'

export const CreateConversationSchema = z.object({
  recipientUsername: z.string().min(3).max(32),
})
