import { useState } from 'react'

type AuthPanelProps = {
  mode: 'login' | 'register'
  onChangeMode: (mode: 'login' | 'register') => void
  onSubmit: (values: { email: string; password: string; name?: string }, mode: 'login' | 'register') => void
  error: string | null
  loading: boolean
}

export default function AuthPanel({ mode, onChangeMode, onSubmit, error, loading }: AuthPanelProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit({ name: name.trim(), email: email.trim(), password: password.trim() }, mode)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Account access</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
        </div>
        <div className="flex gap-2 rounded-full bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onChangeMode('login')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onChangeMode('register')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Register
          </button>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Your name"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="example@mail.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Enter password"
          />
        </label>

        {error && <p className="rounded-3xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
