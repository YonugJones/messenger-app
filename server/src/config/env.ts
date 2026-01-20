import 'dotenv/config'
import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  const tree = z.treeifyError(parsed.error)
  throw new Error(`Invalid environment variables: ${JSON.stringify(tree)}`)
}

export const env = parsed.data
