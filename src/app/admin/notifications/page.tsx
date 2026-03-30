'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService, type AdminNotification } from '@/services/notificationService'
import { Bell, CheckCheck, ShoppingBag, RefreshCw, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Format time helper ────────────────────────────────────────────────────────
function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-4 pl-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-800 rounded" />
              <div className="h-3 w-1/3 bg-gray-800/60 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function NotifPagination({ page, lastPage, total, perPage, onPage }: {
  page: number; lastPage: number; total: number; perPage: number; onPage: (p: number) => void
}) {
  if (lastPage <= 1) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const start = Math.max(0, Math.min(page - 3, lastPage - 5))
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).slice(start, start + 5)
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
      <p className="text-xs text-gray-600">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={cn('w-8 h-8 rounded-xl text-xs font-black transition-all',
              p === page ? 'bg-amber-500 text-black' : 'border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600')}>
            {p}
          </button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === lastPage}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Notification Card ─────────────────────────────────────────────────────────
function NotificationCard({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: AdminNotification
  onMarkRead: (id: number) => void
  onNavigate: (n: AdminNotification) => void
}) {
  const isOrder = notification.type === 'new_order'
  const isUnread = !notification.is_read

  return (
    <div
      onClick={() => onNavigate(notification)}
      className={cn(
        'group relative bg-[#0c0c0c] border rounded-2xl overflow-hidden cursor-pointer',
        'hover:border-gray-700 transition-all duration-200',
        isUnread
          ? 'border-amber-500/30 shadow-sm shadow-amber-500/5'
          : 'border-gray-800/50'
      )}
    >
      {/* Unread left accent bar */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 rounded-l-2xl" />
      )}

      <div className="flex items-start gap-4 p-4 pl-5">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110',
          isOrder ? 'bg-amber-500/10' : 'bg-blue-500/10'
        )}>
          <ShoppingBag className={cn('w-5 h-5', isOrder ? 'text-amber-500' : 'text-blue-500')} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm leading-relaxed',
            isUnread ? 'text-white font-semibold' : 'text-gray-400'
          )}>
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-[11px] text-gray-600">{formatTime(notification.created_at)}</p>
            {notification.reference_id && (
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 group-hover:text-amber-500 transition-colors">
                View Order →
              </span>
            )}
            {isUnread && (
              <button
                onClick={e => { e.stopPropagation(); onMarkRead(notification.id) }}
                className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-green-500 transition-colors ml-auto"
              >
                Mark read
              </button>
            )}
          </div>
        </div>

        {/* Unread dot */}
        {isUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5 animate-pulse" />
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)
  const [refreshing, setRefreshing]       = useState(false)
  const [filter, setFilter]               = useState<'all' | 'unread'>('all')
  const [notifPage, setNotifPage]         = useState(1)
  const NOTIF_PER_PAGE = 15

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getAll()
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleMarkRead = async (id: number) => {
    try {
      const result = await notificationService.markRead(id)
      setUnreadCount(result.unread_count)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch {}
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const handleNavigate = async (n: AdminNotification) => {
    if (!n.is_read) {
      try {
        const result = await notificationService.markRead(n.id)
        setUnreadCount(result.unread_count)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x))
      } catch {}
    }
    if (n.reference_id) {
      navigate(`/admin/orders?highlight=${n.reference_id}`)
    }
  }

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  const notifLastPage = Math.max(1, Math.ceil(displayed.length / NOTIF_PER_PAGE))
  const notifDisplayed = displayed.slice((notifPage - 1) * NOTIF_PER_PAGE, notifPage * NOTIF_PER_PAGE)

  if (loading) {
    return (
      <div className="space-y-5 pb-24 lg:pb-6">
        <NotifSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-24 lg:pb-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-0.5">Admin Panel</p>
          <h1 className="text-xl md:text-2xl font-black text-white">Notifications</h1>
          <p className="text-gray-500 text-xs mt-0.5">{notifications.length} total · {unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 hover:bg-amber-500/20 transition-colors text-xs font-black"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-xs font-bold"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-4">
          <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center mb-3">
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-white">{unreadCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">Unread</p>
        </div>
        <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-4">
          <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
            <CheckCheck className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-black text-white">{notifications.length - unreadCount}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">Read</p>
        </div>
        <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-white">{notifications.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#0c0c0c] border border-gray-800/50 rounded-2xl w-fit">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setNotifPage(1) }}
            className={cn(
              'px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              filter === f
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {displayed.length === 0 ? (
        <div className="bg-[#0c0c0c] border border-gray-800 rounded-2xl p-16 text-center">
          <Inbox className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-white font-bold">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {filter === 'unread' ? 'You\'re all caught up!' : 'New order notifications will appear here.'}
          </p>
          {filter === 'unread' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-3 text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {notifDisplayed.map(n => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
        <NotifPagination page={notifPage} lastPage={notifLastPage} total={displayed.length} perPage={NOTIF_PER_PAGE} onPage={setNotifPage} />
        </>
      )}
    </div>
  )
}
