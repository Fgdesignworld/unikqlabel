'use client'

import { useState, useEffect } from 'react'
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom'
import { authService, type AdminUser } from '@/services/authService'
import { orderService } from '@/services/orderService'
import { Package, ShoppingCart, LogOut, LayoutDashboard, Menu, X, Tag, Globe, Settings, Megaphone, Truck, Bell, Star, Layers, Users, MessageSquare, Ticket, Boxes, ShieldCheck, BookOpen } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { NotificationBell } from '@/components/admin/NotificationBell'
import { MobileBottomNav } from '@/components/admin/MobileBottomNav'
import { OrdersRefreshProvider, useOrdersRefresh } from '@/context/orders-refresh-context'
import { useTheme } from '@/context/theme-context'

export default function AdminLayout() {
  return (
    <OrdersRefreshProvider>
      <AdminLayoutContent />
    </OrdersRefreshProvider>
  )
}

function AdminLayoutContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshKey } = useOrdersRefresh()
  const { theme } = useTheme()   // track so we can re-override when user toggles
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  // ── Always force WHITE premium theme while inside admin ──────────────────
  // Depends on `theme` so it re-fires whenever the user toggles, overriding back.
  useEffect(() => {
    const html = document.documentElement
    const lightVars: Record<string, string> = {
      '--surface-page': '#F4F6FB',
      '--surface-card': '#FFFFFF',
      '--surface-alt':  '#EEF1F8',
      '--text-primary': '#0F172A',
      '--text-muted':   'rgba(15,23,42,0.65)',
      '--text-dim':     'rgba(15,23,42,0.55)',
      '--text-subtle':  'rgba(15,23,42,0.50)',
      '--text-faint':   'rgba(15,23,42,0.45)',
      '--text-ghost':   'rgba(15,23,42,0.35)',
      '--text-trace':   'rgba(15,23,42,0.30)',
    }
    html.setAttribute('data-theme', 'light')
    html.style.colorScheme = 'light'
    html.classList.remove('dark')
    Object.entries(lightVars).forEach(([k, v]) => html.style.setProperty(k, v))

    return () => {
      // Restore the user's saved preference when navigating away from admin
      const saved = (localStorage.getItem('koffeekup-theme') || 'dark') as 'light' | 'dark'
      html.setAttribute('data-theme', saved)
      html.style.colorScheme = saved === 'dark' ? 'dark' : 'light'
      if (saved === 'dark') { html.classList.add('dark') }
      if (saved === 'dark') {
        const darkVars: Record<string, string> = {
          '--surface-page': '#0D0D0D',
          '--surface-card': '#111111',
          '--surface-alt':  '#1a1a1a',
          '--text-primary': '#F5F0E8',
          '--text-muted':   'rgba(245,240,232,0.65)',
          '--text-dim':     'rgba(245,240,232,0.55)',
          '--text-subtle':  'rgba(245,240,232,0.50)',
          '--text-faint':   'rgba(245,240,232,0.45)',
          '--text-ghost':   'rgba(245,240,232,0.35)',
          '--text-trace':   'rgba(245,240,232,0.30)',
        }
        Object.entries(darkVars).forEach(([k, v]) => html.style.setProperty(k, v))
      } else {
        Object.entries(lightVars).forEach(([k, v]) => html.style.setProperty(k, v))
      }
    }
  }, [theme]) // re-run whenever ThemeContext tries to change theme

  useEffect(() => {
    checkAuth()
  }, [])

  // Fetch pending orders count on mount and periodically refresh
  // Also refresh when refreshKey changes (triggered by orders page updates)
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const analytics = await orderService.getAnalytics()
        setPendingOrdersCount(analytics?.by_status?.pending || 0)
      } catch {
        // silently fail
      }
    }
    fetchPendingCount()
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const checkAuth = async () => {
    try {
      const result = await authService.getStatus()
      if (result.authenticated && result.admin) {
        setAdmin(result.admin)
      } else {
        navigate('/admin/login', { replace: true })
      }
    } catch {
      navigate('/admin/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {}
    navigate('/admin/login', { replace: true })
  }

  if (loading) {
    return (
      <div data-admin="true" className="min-h-screen flex items-center justify-center" style={{ background: '#F4F6FB' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-9 h-9 border-2 border-[#C9A45C] border-t-transparent rounded-full" />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Admin</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/hero', icon: Layers, label: 'Hero Slides' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
    { path: '/admin/blog', icon: BookOpen, label: 'Blog' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/leads', icon: MessageSquare, label: 'Leads' },
    { path: '/admin/popup', icon: Megaphone, label: 'Popup' },
    { path: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
    { path: '/admin/inventory', icon: Boxes, label: 'Inventory' },
    { path: '/admin/reviews', icon: Star, label: 'Reviews' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/seo', icon: Globe, label: 'SEO' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/account', icon: ShieldCheck, label: 'Account' },
  ]

  const pageTitle = location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'

  return (
    <div data-admin="true" className="min-h-screen flex" style={{ background: '#F4F6FB' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-60 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 flex flex-col shadow-[1px_0_20px_rgba(15,23,42,0.06)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Pinned header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 tracking-tight">
              Koffee<span className="text-[#C9A45C]">Kup</span>
            </span>
            <span className="text-[9px] uppercase font-black text-[#C9A45C] tracking-[0.15em] bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                location.pathname === item.path
                  ? 'bg-amber-50 text-[#B8903E] border border-amber-200/70 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${location.pathname === item.path ? 'text-[#C9A45C]' : ''}`} />
              <span className="flex-1">{item.label}</span>
              {item.path === '/admin/notifications' && unreadNotifications > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-[#C9A45C] text-white text-[9px] font-black rounded-full px-1 shadow-sm">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
              {item.path === '/admin/orders' && pendingOrdersCount > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full px-1 shadow-sm">
                  {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Pinned footer */}
        <div className="shrink-0 px-3 py-3 border-t border-slate-100 space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white border border-slate-100">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-[#B8903E] text-xs font-black border border-amber-200/60 shadow-sm">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 text-sm font-bold truncate">{admin?.name}</p>
              <p className="text-slate-400 text-xs truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-rose-500 text-sm font-semibold rounded-xl hover:bg-rose-50 hover:border hover:border-rose-100 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/30 z-59 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200/90 px-6 md:px-8 flex items-center justify-between shadow-[0_1px_10px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-xl hover:bg-slate-50 border border-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-slate-900 tracking-tight capitalize">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell onUnreadChange={setUnreadNotifications} />
          </div>
        </header>

        <main className="p-4 md:p-6 pb-28 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav adminName={admin?.name} unreadCount={unreadNotifications} pendingOrderCount={pendingOrdersCount} />

      <Toaster />
    </div>
  )
}
