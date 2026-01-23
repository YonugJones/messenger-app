import { apiFetch } from './http'
import type { Message } from '../types/api'

export function listMessages(
  conversationId: string,
  params?: { cursor?: string; limit?: number },
) {
  const qs = new URLSearchParams()
  if (params?.cursor) qs.set('cursor', params.cursor)
  if (params?.limit) qs.set('limit', String(params.limit))

  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch<{ ok: true; messages: Message[]; nextCursor?: string }>(
    `/conversations/${conversationId}/messages${suffix}`,
  )
}

export function sendMessage(conversationId: string, data: { content: string }) {
  return apiFetch<{ ok: true; message: Message }>(
    `/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}
