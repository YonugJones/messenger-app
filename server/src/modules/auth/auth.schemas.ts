import { z } from 'zod'

export const RegisterSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.email(),
  password: z.string().min(8).max(72),
})

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
})
