'use client'

import { useState } from 'react'
import { Layers, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { signIn } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')
  const [isDemoMode]              = useState(!process.env.NEXT_PUBLIC_AUTH_ENABLED)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isDemoMode) {
        // Demo mode: skip auth entirely
        await new Promise((r) => setTimeout(r, 400))
      } else {
        const { error: authError } = await signIn(email, password)
        if (authError) throw authError
      }
      window.location.href = '/control'
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">WorshipPresenter</h1>
          <p className="text-sm text-white/40 mt-1">
            {isDemoMode ? 'Running in demo mode' : 'Sign in to continue'}
          </p>
        </div>

        {isDemoMode ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-4 text-center">
              <p className="text-sm text-indigo-300 font-medium mb-1">Demo Mode Active</p>
              <p className="text-xs text-white/40">
                Auth is disabled. Set <code className="text-white/60">NEXT_PUBLIC_AUTH_ENABLED=true</code> to enable.
              </p>
            </div>
            <a href="/control"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
              Continue to App <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-white/40 block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@church.org" required autoFocus
                className="w-full h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 transition-colors" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/40">Password</label>
                <a href="/forgot-password" className="text-xs text-indigo-400/60 hover:text-indigo-400 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/60 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2">
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {/* Dev bypass */}
        {!isDemoMode && (
          <p className="mt-6 text-center text-xs text-white/20">
            No account?{' '}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
              className="text-indigo-400/60 hover:text-indigo-400 transition-colors">
              Set up via Supabase
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
