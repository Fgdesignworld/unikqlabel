'use client'

import { useState, useEffect } from 'react'
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom'
import { authService, type AdminUser } from '@/services/authService'
import { orderService } from '@/services/orderService'
import { Package, ShoppingCart, LogOut, LayoutDashboard, Menu, X, Tag, Globe, Settings, Megaphone, Truck, Bell, Star, Layers, Ruler, Palette, Users, MessageSquare, Ticket } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { NotificationBell } from '@/components/admin/NotificationBell'
import { MobileBottomNav } from '@/components/admin/MobileBottomNav'
import { OrdersRefreshProvider, useOrdersRefresh } from '@/context/orders-refresh-context'

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
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  // Fetch pending orders count on mount and periodically refresh
  // Also refresh when refreshKey changes (triggered by orders page updates)
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const analytics = await orderService.getAnalytics()
        setPendingOrdersCount(analytics.by_status.pending || 0)
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
        navigate('/admin/login')
      }
    } catch {
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {}
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/hero', icon: Layers, label: 'Hero Slides' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/leads', icon: MessageSquare, label: 'Leads' },
    { path: '/admin/popup', icon: Megaphone, label: 'Popup' },
    { path: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
    { path: '/admin/reviews', icon: Star, label: 'Reviews' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/variants', icon: Ruler, label: 'Variant Master' },
    { path: '/admin/colors', icon: Palette, label: 'Color Library' },
    { path: '/admin/seo', icon: Globe, label: 'SEO' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  const pageTitle = location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0c0c] border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Pinned header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <Link to="/admin/dashboard" className="text-lg font-black text-white">
            UNIKQ <span className="text-amber-500">LABEL Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                location.pathname === item.path
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.path === '/admin/notifications' && unreadNotifications > 0 && (
                <span className="min-w-4.5 h-4.5 flex items-center justify-center bg-amber-500 text-black text-[9px] font-black rounded-full px-1">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
              {item.path === '/admin/orders' && pendingOrdersCount > 0 && (
                <span className="min-w-4.5 h-4.5 flex items-center justify-center bg-amber-500 text-black text-[9px] font-black rounded-full px-1">
                  {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Pinned footer — pending orders summary + user + sign out */}
        <div className="shrink-0 p-4 border-t border-gray-800 space-y-4">
          {/* Pending Orders Card */}
          {/* <Link
            to="/admin/orders"
            onClick={() => setSidebarOpen(false)}
            className="block p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/12 transition-all"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Pending Orders</p>
            <p className="text-2xl font-black text-amber-400">{pendingOrdersCount || 0}</p>
          </Link> */}

          {/* User Profile */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 text-xs font-black">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">{admin?.name}</p>
              <p className="text-gray-500 text-xs truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white transition-colors p-1">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm md:text-base font-black text-white capitalize flex-1 truncate">
            {pageTitle}
          </h1>
          {/* Notification Bell */}
          <NotificationBell onUnreadChange={setUnreadNotifications} />
        </header>

        <main className="p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav adminName={admin?.name} unreadCount={unreadNotifications} pendingOrderCount={pendingOrdersCount} />

      <Toaster />
    </div>
  )
}
