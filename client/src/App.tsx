import { useEffect, useState } from 'react'
import type { User } from './types/api'
import { me, logout } from './api/auth'
import { LoginPage } from './pages/LoginPage'
import { ChatPage } from './pages/ChatPage'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center text-gray-600'>
        Loading…
      </div>
    )
  }

  if (!user) {
    return <LoginPage onAuthed={setUser} />
  }

  return (
    <div className='mx-auto max-w-5xl p-4'>
      <header className='mb-4 flex items-center justify-between border-b pb-3'>
        <div className='text-sm text-gray-700'>
          Logged in as <span className='font-semibold'>{user.username}</span>
        </div>
        <button
          onClick={async () => {
            await logout()
            setUser(null)
          }}
          className='rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800'
        >
          Logout
        </button>
      </header>

      <ChatPage currentUser={user} />
    </div>
  )
}
