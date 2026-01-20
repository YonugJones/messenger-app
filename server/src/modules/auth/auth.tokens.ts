import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'

export type AccessTokenPayload = {
  sub: string
}

export type RefreshTokenPayload = {
  sub: string
  typ: 'refresh'
}

export function signAccessToken(userId: string): string {
  const payload: AccessTokenPayload = { sub: userId }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
  })
}

export function signRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, typ: 'refresh' }
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL_SECONDS,
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}
