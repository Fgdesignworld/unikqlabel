'use client'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'

interface MobileBottomNavProps {
  adminName?: string
  unreadCount?: number
  pendingOrderCount?: number
}

export function MobileBottomNav({ adminName, unreadCount = 0, pendingOrderCount = 0 }: MobileBottomNavProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const items = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', badge: pendingOrderCount },
    { path: '/admin/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
  ]

  const handleProfile = async () => {
    if (confirm('Sign out of admin panel?')) {
      try {
        await authService.logout()
      } catch {}
      navigate('/admin/login')
    }
  }

  const isActive = (path: string) => location.pathname === path ||
    (path !== '/admin/dashboard' && location.pathname.startsWith(path))

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 safe-area-pb shadow-[0_-4px_20px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-around px-1 py-2">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px]",
              isActive(item.path)
                ? "text-[#C9A45C]"
                : "text-slate-400 hover:text-slate-700 active:scale-95"
            )}
          >
            <div className={cn(
              "relative p-1.5 rounded-xl transition-colors",
              isActive(item.path) ? "bg-amber-50 border border-amber-200/60" : ""
            )}>
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-[#C9A45C] text-white text-[8px] font-black rounded-full px-0.5 shadow-sm">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isActive(item.path) ? "text-[#C9A45C]" : "text-slate-400"
            )}>
              {item.label}
            </span>
          </Link>
        ))}

        {/* Profile / Sign Out */}
        <button
          onClick={handleProfile}
          className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] text-slate-400 hover:text-slate-700 active:scale-95"
        >
          <div className="relative p-0 rounded-xl">
            <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#B8903E] text-xs font-black">
              {adminName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Profile</span>
        </button>
      </div>
    </nav>
  )
}
