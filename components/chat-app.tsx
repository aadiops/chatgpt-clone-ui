'use client'

import { useState } from 'react'
import { ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Login failed.')
      }

      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected login error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.6)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10a37f] text-lg font-semibold text-black">AI</div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Welcome</p>
            <h1 className="text-2xl font-semibold text-white">Sign in</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-slate-400" /> Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#10a37f]"
              placeholder="demo@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <Lock className="h-4 w-4 text-slate-400" /> Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#10a37f]"
              placeholder="demo123"
              required
            />
          </label>

          {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10a37f] px-4 py-3 font-medium text-black transition hover:bg-[#13b98c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
          Demo accounts:
          <div className="mt-2 space-y-1">
            <p>demo@example.com / demo123</p>
            <p>admin@example.com / admin123</p>
          </div>
        </div>
      </div>
    </main>
  )
}
