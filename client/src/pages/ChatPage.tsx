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
        // avoid return in finally
        if (!cancelled) setLoadingMessages(false)
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

      const refreshed = await listConversations()
      setConversations(refreshed.conversations)
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
    <div className='grid gap-4 lg:grid-cols-[360px_1fr]'>
      {/* Sidebar */}
      <aside className='glass p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-slate-200'>
            Conversations
          </h2>
          <span className='text-xs text-slate-400'>{conversations.length}</span>
        </div>

        <div className='mb-3 flex gap-2'>
          <input
            placeholder='Recipient user id'
            className='glass-input'
            value={recipientUserId}
            onChange={(e) => setRecipientUserId(e.target.value)}
          />
          <button
            type='button'
            onClick={onCreateConversation}
            disabled={
              creatingConversation || recipientUserId.trim().length === 0
            }
            className='glass-button whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60'
          >
            {creatingConversation ? 'Creating…' : 'Create'}
          </button>
        </div>

        <div className='space-y-2'>
          {conversations.length === 0 ? (
            <div className='glass-inset p-3 text-sm text-slate-400'>
              No conversations yet.
            </div>
          ) : (
            conversations.map((c) => {
              const label =
                c.members
                  .map((m) => m.user.username)
                  .filter((u) => u !== currentUser.username)
                  .join(', ') || '(you)'

              const active = c.id === selectedId

              return (
                <button
                  key={c.id}
                  type='button'
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    active
                      ? 'border-white/20 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className='truncate text-xs text-slate-400'>{c.id}</div>
                  <div className='mt-0.5 text-slate-100'>{label}</div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Messages */}
      <main className='glass flex flex-col p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-slate-200'>Messages</h2>
          {selectedId && (
            <span className='truncate text-xs text-slate-400'>
              {selectedId}
            </span>
          )}
        </div>

        <div className='glass-inset flex-1 overflow-y-auto p-3'>
          {!selectedId ? (
            <p className='text-sm text-slate-400'>Select a conversation.</p>
          ) : loadingMessages ? (
            <p className='text-sm text-slate-400'>Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className='text-sm text-slate-400'>No messages yet.</p>
          ) : (
            <div className='space-y-3'>
              {messages.map((m) => {
                const mine = m.senderId === currentUser.id

                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl border px-3 py-2 text-sm ${
                        mine
                          ? 'border-white/10 bg-indigo-500/20'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className='mb-1 text-xs text-slate-400'>
                        {mine ? 'You' : m.senderId} ·{' '}
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                      <div className='text-slate-100'>{m.content}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className='mt-3 flex gap-2'>
          <input
            className='glass-input'
            placeholder='Type a message'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!selectedId || sending}
          />
          <button
            type='button'
            onClick={onSend}
            disabled={!selectedId || sending || content.trim().length === 0}
            className='glass-button whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60'
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>

        {error && (
          <p className='mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200'>
            {error}
          </p>
        )}
      </main>
    </div>
  )
}
