import type { Response } from 'express'
import { env } from '../../config/env.js'

export const ACCESS_COOKIE_NAME = 'access_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    path: '/',
  }
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...baseCookieOptions(),
    maxAge: env.ACCESS_TOKEN_TTL_SECONDS * 1000,
  })

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseCookieOptions(),
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
  })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE_NAME, { ...baseCookieOptions() })
  res.clearCookie(REFRESH_COOKIE_NAME, { ...baseCookieOptions() })
}
