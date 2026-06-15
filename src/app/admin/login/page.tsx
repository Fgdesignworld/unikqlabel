'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Force dark theme on login page — it is outside AdminLayout
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', 'dark')
    const darkVars: Record<string, string> = {
      '--surface-page': '#0D0D0D', '--surface-card': '#111111', '--surface-alt': '#1a1a1a',
      '--text-primary': '#F5F0E8', '--text-muted': 'rgba(245,240,232,0.65)',
    }
    Object.entries(darkVars).forEach(([k, v]) => html.style.setProperty(k, v))
    return () => {
      const saved = (localStorage.getItem('koffeekup-theme') || 'dark')
      html.setAttribute('data-theme', saved)
    }
  }, [])

  // If already authenticated, skip login page entirely (replaces history entry)
  useEffect(() => {
    authService.getStatus().then(result => {
      if (result.authenticated) {
        navigate('/admin/dashboard', { replace: true })
      }
    }).catch(() => {})
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login({ email, password })
      // replace: true removes /admin/login from history so back button never returns here
      navigate('/admin/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-admin="true" className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1410] to-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Koffee<span className="text-amber-500">Kup</span>
          </h1>
          <p className="text-amber-500/60 text-sm mt-1 font-medium">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a1a] border border-amber-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Login</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="admin@koffeekup.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} KoffeeKup. All rights reserved.
        </p>
      </div>
    </div>
  )
}
