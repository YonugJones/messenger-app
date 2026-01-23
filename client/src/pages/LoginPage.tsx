import { useState } from 'react'
import type { User } from '../types/api'
import { login, register } from '../api/auth'

export function LoginPage({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit() {
    setError(null)
    try {
      const res =
        mode === 'register'
          ? await register({ username, email, password })
          : await login({ email, password })

      onAuthed(res.user)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  return (
    <div className='mx-auto mt-24 max-w-md rounded-xl border p-6 shadow-sm'>
      <h1 className='mb-4 text-2xl font-semibold'>Messenger</h1>

      <div className='mb-4 flex gap-2'>
        <button
          onClick={() => setMode('login')}
          className={`flex-1 rounded-md px-3 py-2 text-sm ${mode === 'login' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 rounded-md px-3 py-2 text-sm ${mode === 'register' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Register
        </button>
      </div>

      {mode === 'register' && (
        <label className='mb-3 block text-sm'>
          Username
          <input
            className='mt-1 w-full rounded-md border px-3 py-2'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      )}

      <label className='mb-3 block text-sm'>
        Email
        <input
          className='mt-1 w-full rounded-md border px-3 py-2'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className='mb-4 block text-sm'>
        Password
        <input
          type='password'
          className='mt-1 w-full rounded-md border px-3 py-2'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button
        onClick={submit}
        className='w-full rounded-md bg-gray-900 py-2 text-white hover:bg-gray-800'
      >
        {mode === 'register' ? 'Create account' : 'Login'}
      </button>

      {error && <p className='mt-3 text-sm text-red-600'>{error}</p>}
    </div>
  )
}
