import { apiFetch } from './http'
import type { User } from '../types/api'

export function register(data: {
  username: string
  email: string
  password: string
}) {
  return apiFetch<{ ok: true; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function login(data: { email: string; password: string }) {
  return apiFetch<{ ok: true; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function me() {
  return apiFetch<{ ok: true; user: User }>('/auth/me')
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}
