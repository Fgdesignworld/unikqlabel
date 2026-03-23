'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, ShoppingBag } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { notificationService, type AdminNotification } from '@/services/notificationService'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  onUnreadChange?: (count: number) => void
}

export function NotificationBell({ onUnreadChange }: NotificationBellProps) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll()
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
      onUnreadChange?.(data.unread_count)
    } catch {
      // Silently fail (table may not exist yet)
    }
  }

  const handleNotificationClick = async (n: AdminNotification) => {
    // Mark as read
    if (!n.is_read) {
      try {
        setLoading(true)
        const result = await notificationService.markRead(n.id)
        setUnreadCount(result.unread_count)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x))
        onUnreadChange?.(result.unread_count)
      } catch {} finally {
        setLoading(false)
      }
    }
    // Navigate to related order if reference_id exists
    if (n.reference_id) {
      setOpen(false)
      navigate(`/admin/orders?highlight=${n.reference_id}`)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setLoading(true)
      await notificationService.markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
      onUnreadChange?.(0)
    } catch {} finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-gray-800/50"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-500 text-black text-[9px] font-black rounded-full px-1 animate-pulse shadow-lg shadow-amber-500/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-[#0f0f0f] border border-gray-800 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#111]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="text-white font-black text-sm uppercase tracking-widest">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-amber-500/20 text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  All Read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 p-4 border-b border-gray-800/50 hover:bg-white/[0.04] transition-colors cursor-pointer",
                    !n.is_read && "bg-amber-500/[0.03] border-l-2 border-l-amber-500/50"
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                    n.type === 'new_order' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                  )}>
                    <ShoppingBag className={cn("w-4 h-4", n.type === 'new_order' ? 'text-amber-500' : 'text-blue-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs leading-relaxed", n.is_read ? 'text-gray-400' : 'text-white font-medium')}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">{formatTime(n.created_at)}</p>
                    {n.reference_id && (
                      <p className="text-[10px] text-amber-600 mt-0.5 font-bold">Tap to view order →</p>
                    )}
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer — View All */}
          <div className="p-3 border-t border-gray-800 bg-[#0a0a0a]">
            <Link
              to="/admin/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-amber-500 transition-colors rounded-xl hover:bg-white/5"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
