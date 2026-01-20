import type { RequestHandler } from 'express'
import {
  registerUser,
  verifyUserCredentials,
  getUserById,
} from './auth.service.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './auth.tokens.js'
import {
  clearAuthCookies,
  setAuthCookies,
  REFRESH_COOKIE_NAME,
} from './auth.cookies.js'
import { AppError } from '../../lib/errors.js'

export const register: RequestHandler = async (req, res, next) => {
  try {
    const user = await registerUser(req.body)
    const access = signAccessToken(user.id)
    const refresh = signRefreshToken(user.id)

    setAuthCookies(res, access, refresh)
    res.status(201).json({ ok: true, user })
  } catch (err) {
    next(err)
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await verifyUserCredentials(req.body)
    const access = signAccessToken(user.id)
    const refresh = signRefreshToken(user.id)

    setAuthCookies(res, access, refresh)
    res.status(200).json({ ok: true, user })
  } catch (err) {
    next(err)
  }
}

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401)
    const user = await getUserById(req.user.id)
    if (!user) throw new AppError('Unauthorized', 401)
    res.json({ ok: true, user })
  } catch (err) {
    next(err)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME]
    if (!token) throw new AppError('Unauthorized', 401)

    const payload = verifyRefreshToken(token)
    if (payload.typ !== 'refresh') throw new AppError('Unauthorized', 401)

    const user = await getUserById(payload.sub)
    if (!user) throw new AppError('Unauthorized', 401)

    const access = signAccessToken(user.id)
    const newRefresh = signRefreshToken(user.id)

    setAuthCookies(res, access, newRefresh)
    res.json({ ok: true })
  } catch {
    next(new AppError('Unauthorized', 401))
  }
}

export const logout: RequestHandler = (_req, res) => {
  clearAuthCookies(res)
  res.status(204).send()
}
