import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'

const SALT_ROUNDS = 12

export async function registerUser(input: {
  username: string
  email: string
  password: string
}) {
  const { username, email, password } = input

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  })

  if (existing) throw new AppError('Username or email already in use', 409)

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true, createdAt: true },
  })

  return user
}

export async function verifyUserCredentials(input: {
  email: string
  password: string
}) {
  const { email, password } = input

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true, email: true, passwordHash: true },
  })

  if (!user) throw new AppError('Invalid credentials', 401)

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new AppError('Invalid credentials', 401)

  return { id: user.id, username: user.username, email: user.email }
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, createdAt: true },
  })
}
