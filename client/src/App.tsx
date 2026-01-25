import { useEffect, useState } from 'react'
import type { User } from './types/api'
import { me, logout } from './api/auth'
import { LoginPage } from './pages/LoginPage'
import { ChatPage } from './pages/ChatPage'
import { socket } from './socket'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) socket.connect()
    else socket.disconnect()
  }, [user])

  useEffect(() => {
    me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center text-slate-300'>
        Loading…
      </div>
    )
  }

  if (!user) return <LoginPage onAuthed={setUser} />

  return (
    <div className='mx-auto max-w-6xl px-4 py-6'>
      <header className='glass mb-5 flex items-center justify-between px-5 py-4'>
        <div className='flex flex-col'>
          <span className='text-xs uppercase tracking-wide text-slate-400'>
            Messenger
          </span>
          <span className='text-sm text-slate-200'>
            Logged in as <span className='font-semibold'>{user.username}</span>
          </span>
        </div>

        <button
          type='button'
          onClick={async () => {
            await logout()
            setUser(null)
          }}
          className='glass-button'
        >
          Logout
        </button>
      </header>

      <ChatPage currentUser={user} />
    </div>
  )
}
