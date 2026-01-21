import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'

export async function listConversationsForUser(userId: string) {
  // Return minimal data for now
  return prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      updatedAt: true,
      createdAt: true,
      members: {
        select: {
          user: { select: { id: true, username: true, email: true } },
        },
      },
    },
  })
}

export async function getOrCreateDirectConversation(params: {
  userId: string
  recipientUserId: string
}) {
  const { userId, recipientUserId } = params

  if (userId === recipientUserId) {
    throw new AppError('Cannot create a conversation with yourself', 400)
  }

  // Ensure recipient exists
  const recipient = await prisma.user.findUnique({
    where: { id: recipientUserId },
    select: { id: true },
  })
  if (!recipient) throw new AppError('Recipient not found', 404)

  // Find an existing conversation that has exactly these two members.
  // Prisma can’t express “exactly these members” perfectly in one query across all DBs,
  // so do: find conversations where both are members, then confirm count=2.
  const candidates = await prisma.conversation.findMany({
    where: {
      members: {
        some: { userId },
      },
      AND: {
        members: {
          some: { userId: recipientUserId },
        },
      },
    },
    select: {
      id: true,
      members: { select: { userId: true } },
    },
  })

  const existing = candidates.find(
    (c) =>
      c.members.length === 2 &&
      c.members.some((m) => m.userId === userId) &&
      c.members.some((m) => m.userId === recipientUserId),
  )

  if (existing) {
    return prisma.conversation.findUnique({
      where: { id: existing.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
      },
    })
  }

  // Create new conversation + members in a transaction
  return prisma.$transaction(async (tx) => {
    const convo = await tx.conversation.create({
      data: {
        members: {
          create: [{ userId }, { userId: recipientUserId }],
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
      },
    })

    return convo
  })
}

export async function assertUserIsConversationMember(params: {
  conversationId: string
  userId: string
}) {
  const { conversationId, userId } = params

  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { userId: true },
  })

  if (!member) throw new AppError('Forbidden', 403)
}
