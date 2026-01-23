import { prisma } from '../../lib/prisma.js'
import { assertUserIsConversationMember } from '../conversations/conversations.service.js'

export async function sendMessage(params: {
  conversationId: string
  senderId: string
  content: string
}) {
  const { conversationId, senderId, content } = params

  await assertUserIsConversationMember({ conversationId, userId: senderId })

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: { conversationId, senderId, content },
      select: {
        id: true,
        conversationId: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
      select: { id: true },
    })

    return created
  })

  return message
}

export async function listMessages(params: {
  conversationId: string
  userId: string
  cursor?: string
  limit: number
}) {
  const { conversationId, userId, cursor, limit } = params

  await assertUserIsConversationMember({ conversationId, userId })

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      conversationId: true,
      content: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  })

  const hasMore = messages.length > limit
  const page = hasMore ? messages.slice(0, limit) : messages
  const nextCursor = hasMore ? page[page.length - 1]?.id : undefined

  return { messages: page, nextCursor }
}
