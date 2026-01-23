import { apiFetch } from './http'
import type { Conversation } from '../types/api'

export function listConversations() {
  return apiFetch<{ ok: true; conversations: Conversation[] }>('/conversations')
}

export function createConversation(data: { recipientUserId: string }) {
  return apiFetch<{ ok: true; conversation: Conversation }>('/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
