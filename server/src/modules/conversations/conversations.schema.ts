import { z } from 'zod'

export const CreateConversationSchema = z.object({
  recipientUserId: z.uuid(),
})
