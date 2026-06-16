'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { useSettings } from '@/context/settings-context'
import { Lock, Mail, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoError, setLogoError] = useState(false)

  // Force light theme on login page — it is outside AdminLayout
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', 'light')
    const lightVars: Record<string, string> = {
      '--surface-page': '#F7F4ED', // Aarvia Cream
      '--surface-card': '#FFFFFF',
      '--surface-alt': '#FAF8F4',
      '--text-primary': '#1F4D3A', // Aarvia Forest Green
      '--text-muted': '#555555',
    }
    Object.entries(lightVars).forEach(([k, v]) => html.style.setProperty(k, v))
    return () => {
      const saved = (localStorage.getItem('koffeekup-theme') || 'dark')
      html.setAttribute('data-theme', saved)
      // Clean up overridden property variables
      Object.keys(lightVars).forEach(k => html.style.removeProperty(k))
    }
  }, [])

  // If already authenticated, skip login page entirely
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
      navigate('/admin/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const siteName = settings?.site_name || 'Aarvia'
  const logoSrc = settings?.logo_url
    ? (settings.logo_url.startsWith('/') && !settings.logo_url.startsWith('/api') ? `/api${settings.logo_url}` : settings.logo_url)
    : '/logo.png'

  return (
    <div data-admin="true" className="min-h-screen bg-gradient-to-br from-[#FDFDFB] via-[#F7F4ED] to-[#F1EDE5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Dynamic Logo Section */}
        <div className="text-center mb-8">
          {settings?.logo_url && !logoError ? (
            <img 
              src={logoSrc} 
              alt={siteName} 
              onError={() => setLogoError(true)}
              className="h-[56px] w-auto mx-auto object-contain transition-opacity duration-300 hover:opacity-90 mb-3" 
            />
          ) : (
            <div className="flex items-center justify-center gap-2.5 mb-2.5">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: 'rgba(31,77,58,0.06)', border: '1px solid rgba(200,169,107,0.3)' }}
              >
                <Leaf className="w-4.5 h-4.5 text-[#1F4D3A]" />
              </div>
              <span 
                className="text-2xl font-bold tracking-wide text-[#1F4D3A]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {siteName}
              </span>
            </div>
          )}
          <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#C8A96B] mt-1">
            Admin Control Center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-md border border-[#C8A96B]/15 rounded-2xl p-8 shadow-[0_20px_50px_rgba(31,77,58,0.04)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#1F4D3A]/5 border border-[#C8A96B]/20 rounded-xl">
              <Lock className="w-4.5 h-4.5 text-[#C8A96B]" />
            </div>
            <h2 
              className="text-xl font-bold text-[#1F4D3A]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Admin Login
            </h2>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-500/5 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1F4D3A]/70 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F4D3A]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#1F4D3A]/10 rounded-xl text-[#1F4D3A] placeholder-[#1F4D3A]/30 focus:outline-none focus:border-[#C8A96B] focus:ring-1 focus:ring-[#C8A96B]/30 focus:bg-white transition-all text-sm"
                  placeholder="admin@koffeekup.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1F4D3A]/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F4D3A]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[#FAF8F5] border border-[#1F4D3A]/10 rounded-xl text-[#1F4D3A] placeholder-[#1F4D3A]/30 focus:outline-none focus:border-[#C8A96B] focus:ring-1 focus:ring-[#C8A96B]/30 focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F4D3A]/40 hover:text-[#1F4D3A]/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1F4D3A] text-[#F7F4ED] font-semibold rounded-xl hover:bg-[#1E4535] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#1F4D3A]/40 text-xs mt-6 font-medium">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </div>
  )
}
