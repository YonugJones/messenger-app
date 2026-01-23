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
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='glass w-full max-w-md p-6'>
        <div className='mb-5'>
          <h1 className='text-2xl font-semibold'>Messenger</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Cookie-based auth + conversations + messages
          </p>
        </div>

        <div className='mb-4 grid grid-cols-2 gap-2'>
          <button
            type='button'
            onClick={() => setMode('login')}
            className={
              mode === 'login'
                ? 'glass-button'
                : 'glass-button opacity-70 hover:opacity-100'
            }
          >
            Login
          </button>
          <button
            type='button'
            onClick={() => setMode('register')}
            className={
              mode === 'register'
                ? 'glass-button'
                : 'glass-button opacity-70 hover:opacity-100'
            }
          >
            Register
          </button>
        </div>

        <div className='space-y-3'>
          {mode === 'register' && (
            <label className='block text-sm text-slate-200'>
              Username
              <input
                className='glass-input mt-1'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
          )}

          <label className='block text-sm text-slate-200'>
            Email
            <input
              className='glass-input mt-1'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className='block text-sm text-slate-200'>
            Password
            <input
              type='password'
              className='glass-input mt-1'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button
          type='button'
          onClick={submit}
          className='glass-button mt-5 w-full'
        >
          {mode === 'register' ? 'Create account' : 'Login'}
        </button>

        {error && (
          <p className='mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200'>
            {error}
          </p>
        )}

        <p className='mt-4 text-xs text-slate-400'>
          Note: Requests include credentials; cookies must be enabled.
        </p>
      </div>
    </div>
  )
}
