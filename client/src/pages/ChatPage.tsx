import { useEffect, useState } from 'react'
import type { Conversation, Message, User } from '../types/api'
import { createConversation, listConversations } from '../api/conversations'
import { listMessages, sendMessage } from '../api/messages'

export function ChatPage({ currentUser }: { currentUser: User }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [recipientUserId, setRecipientUserId] = useState('')
  const [creatingConversation, setCreatingConversation] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Initial load: conversations
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setError(null)
        const res = await listConversations()
        if (cancelled) return

        setConversations(res.conversations)
        setSelectedId((prev) => prev ?? res.conversations[0]?.id ?? null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedId) return

    let cancelled = false

    ;(async () => {
      try {
        setError(null)
        setLoadingMessages(true)

        const r = await listMessages(selectedId, { limit: 30 })
        if (cancelled) return
        setMessages(r.messages.slice().reverse())
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Error')
      } finally {
        setLoadingMessages(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedId])

  async function onCreateConversation() {
    const trimmed = recipientUserId.trim()
    if (!trimmed) return

    setError(null)
    setCreatingConversation(true)

    try {
      const res = await createConversation({ recipientUserId: trimmed })
      setRecipientUserId('')

      // Refresh conversations list after creation
      const refreshed = await listConversations()
      setConversations(refreshed.conversations)

      // Select the created (or fetched) conversation
      setSelectedId(res.conversation.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCreatingConversation(false)
    }
  }

  async function onSend() {
    if (!selectedId) return
    const trimmed = content.trim()
    if (!trimmed) return

    setError(null)
    setSending(true)

    try {
      const res = await sendMessage(selectedId, { content: trimmed })
      setMessages((prev) => [...prev, res.message])
      setContent('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='grid grid-cols-[320px_1fr] gap-4'>
      {/* Sidebar */}
      <aside className='rounded-lg border p-3'>
        <h2 className='mb-3 font-semibold'>Conversations</h2>

        <div className='mb-3 flex gap-2'>
          <input
            placeholder='Recipient user id'
            className='flex-1 rounded-md border px-2 py-1 text-sm'
            value={recipientUserId}
            onChange={(e) => setRecipientUserId(e.target.value)}
          />
          <button
            onClick={onCreateConversation}
            disabled={
              creatingConversation || recipientUserId.trim().length === 0
            }
            className='rounded-md bg-gray-900 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60'
          >
            {creatingConversation ? 'Creating…' : 'Create'}
          </button>
        </div>

        <div className='space-y-2'>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full rounded-md border p-2 text-left text-sm ${
                c.id === selectedId
                  ? 'border-gray-900 bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className='truncate text-xs text-gray-500'>{c.id}</div>
              <div>
                {c.members
                  .map((m) => m.user.username)
                  .filter((u) => u !== currentUser.username)
                  .join(', ') || '(you)'}
              </div>
            </button>
          ))}

          {conversations.length === 0 && (
            <p className='text-sm text-gray-500'>No conversations yet.</p>
          )}
        </div>
      </aside>

      {/* Messages */}
      <main className='flex flex-col rounded-lg border p-3'>
        <h2 className='mb-2 font-semibold'>Messages</h2>

        <div className='flex-1 space-y-3 overflow-y-auto rounded-md border p-3'>
          {!selectedId ? (
            <p className='text-sm text-gray-500'>Select a conversation.</p>
          ) : loadingMessages ? (
            <p className='text-sm text-gray-500'>Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className='text-sm text-gray-500'>No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id}>
                <div className='text-xs text-gray-500'>
                  {m.senderId === currentUser.id ? 'You' : m.senderId} ·{' '}
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div>{m.content}</div>
              </div>
            ))
          )}
        </div>

        <div className='mt-3 flex gap-2'>
          <input
            className='flex-1 rounded-md border px-3 py-2'
            placeholder='Type a message'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!selectedId || sending}
          />
          <button
            onClick={onSend}
            disabled={!selectedId || sending || content.trim().length === 0}
            className='rounded-md bg-gray-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60'
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>

        {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
      </main>
    </div>
  )
}
