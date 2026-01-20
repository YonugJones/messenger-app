import { Router } from 'express'
import { validateBody } from '../../middleware/validate.js'
import { requireAuth } from '../../middleware/requireAuth.js'
import { LoginSchema, RegisterSchema } from './auth.schemas.js'
import { login, logout, me, refresh, register } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(RegisterSchema), register)
authRouter.post('/login', validateBody(LoginSchema), login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)
