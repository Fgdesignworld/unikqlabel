'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, X, Phone, MapPin, ShoppingCart, TrendingUp,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  RefreshCw, SlidersHorizontal, ExternalLink,
  MessageSquare, IndianRupee, CalendarDays, Crown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/context/settings-context'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'

// ─── WhatsApp SVG icon (inline, no external lib needed) ───────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Customer {
  phone: string
  customer_name: string
  city: string | null
  address: string | null
  pincode: string | null
  order_count: number
  total_spent: number
  last_order: string
  first_order: string
}

interface CustomerOrder {
  id: number
  invoice_number: string
  created_at: string
  status: string
  total: number
  payment_method: string | null
  city: string | null
}

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  pending:    { text: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  confirmed:  { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  processing: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  shipped:    { text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'   },
  delivered:  { text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
  cancelled:  { text: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'orders', label: 'Most Orders' },
  { value: 'spent',  label: 'Highest Spend' },
  { value: 'name',   label: 'Name A–Z' },
]

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, border }: {
  label: string; value: string | number
  icon: React.ElementType; color: string; bg: string; border: string
}) {
  return (
    <div className={cn('bg-[#0c0c0c] border rounded-2xl p-4 md:p-5', border)}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <p className="text-xl md:text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

// ─── Customer Orders Panel ──────────────────────────────────────────────────────
function CustomerOrdersPanel({ phone, currency }: { phone: string; currency: string }) {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/admin/customers/${phone}/orders`)
      .then(r => setOrders(r.data?.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [phone])

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!orders.length) {
    return <p className="text-gray-600 text-xs text-center py-4">No orders found</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-800 bg-[#0a0a0a]">
            <th className="text-left p-3 text-gray-500 font-black uppercase tracking-widest">Invoice</th>
            <th className="text-center p-3 text-gray-500 font-black uppercase tracking-widest">Status</th>
            <th className="text-center p-3 text-gray-500 font-black uppercase tracking-widest hidden sm:table-cell">Date</th>
            <th className="text-right p-3 text-gray-500 font-black uppercase tracking-widest">Total</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
            return (
              <tr key={order.id} className="border-b border-gray-800/50 last:border-0">
                <td className="p-3 text-amber-500 font-black">{order.invoice_number}</td>
                <td className="p-3 text-center">
                  <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border', sc.text, sc.bg, sc.border)}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-center text-gray-500 hidden sm:table-cell">{fmtDate(order.created_at)}</td>
                <td className="p-3 text-right text-white font-bold">{currency}{Number(order.total).toLocaleString('en-IN')}</td>
                <td className="p-3 text-right">
                  <Link
                    to={`/admin/orders?highlight=${order.id}`}
                    className="p-1 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all inline-flex"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Customer Card ─────────────────────────────────────────────────────────────
function CustomerCard({ customer, currency, index, settings }: {
  customer: Customer; currency: string; index: number; settings: any
}) {
  const [expanded, setExpanded] = useState(false)

  const waNumber = (settings?.whatsapp || settings?.phone || '').replace(/\D/g, '') || customer.phone
  const waLink   = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(`Hi ${customer.customer_name}, `)}`
  const callLink = `tel:+91${customer.phone}`

  const isTopCustomer = customer.order_count >= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'bg-[#0c0c0c] border rounded-2xl overflow-hidden transition-colors',
        expanded ? 'border-gray-700' : 'border-gray-800/50 hover:border-gray-700',
      )}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/1.5 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.2)',
          }}>
          <span className="text-amber-500 font-black text-base">
            {customer.customer_name?.charAt(0)?.toUpperCase() || '?'}
          </span>
          {isTopCustomer && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-[#0D0D0D]" />
            </div>
          )}
        </div>

        {/* Name + phone + city */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-black text-sm truncate">{customer.customer_name}</p>
            {isTopCustomer && (
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-amber-400 bg-amber-500/10 border border-amber-500/20">
                Top Customer
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-gray-400 text-xs font-medium">{customer.phone}</span>
            {customer.city && (
              <span className="flex items-center gap-1 text-gray-600 text-[11px]">
                <MapPin className="w-2.5 h-2.5" />{customer.city}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-600 mt-0.5">First order: {fmtDate(customer.first_order)}</p>
        </div>

        {/* Stats + actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366' }}
              title={`WhatsApp ${customer.customer_name}`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
            {/* Call */}
            <a
              href={callLink}
              onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}
              title={`Call ${customer.customer_name}`}
            >
              <Phone className="w-3 h-3" />
            </a>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-black text-sm">{currency}{Number(customer.total_spent).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-gray-600">
              {customer.order_count} order{customer.order_count !== 1 ? 's' : ''}
            </p>
          </div>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
          }
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-800 bg-[#080808] p-4 space-y-4">
              {/* Detail band */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Address */}
                <div className="p-3 rounded-xl space-y-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Address</p>
                  <p className="text-white text-xs font-medium leading-relaxed">{customer.address || '—'}</p>
                  {(customer.city || customer.pincode) && (
                    <p className="text-gray-500 text-[11px]">{[customer.city, customer.pincode].filter(Boolean).join(' – ')}</p>
                  )}
                </div>

                {/* Spend summary */}
                <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Spend Summary</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-amber-400 font-black">{currency}{Number(customer.total_spent).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Orders Placed</span>
                    <span className="text-white font-bold">{customer.order_count}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Avg. Order</span>
                    <span className="text-white font-bold">
                      {currency}{customer.order_count > 0 ? Math.round(customer.total_spent / customer.order_count).toLocaleString('en-IN') : 0}
                    </span>
                  </div>
                </div>

                {/* Contact actions */}
                <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quick Actions</p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    WhatsApp {customer.customer_name.split(' ')[0]}
                  </a>
                  <a
                    href={callLink}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                    style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa' }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call +91 {customer.phone}
                  </a>
                  <Link
                    to={`/admin/orders?search=${encodeURIComponent(customer.phone)}`}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#fbbf24' }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    View in Orders
                  </Link>
                </div>
              </div>

              {/* Order history */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Order History</p>
                <CustomerOrdersPanel phone={customer.phone} currency={currency} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const { settings } = useSettings()
  const currency = settings?.currency_symbol || '₹'

  const [customers, setCustomers]   = useState<Customer[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Stats
  const [totalCustomers, setTotalCustomers] = useState(0)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')
  const [sort, setSort]               = useState('recent')
  const [page, setPage]               = useState(1)
  const [lastPage, setLastPage]       = useState(1)
  const [showSort, setShowSort]       = useState(false)

  const isFirstLoad = useRef(true)

  const load = useCallback(async (overrides: Record<string, any> = {}) => {
    try {
      const params: Record<string, any> = { search, sort, page, ...overrides }
      const res = await api.get('/admin/customers', { params })
      setCustomers(res.data?.customers || [])
      setTotalCustomers(res.data?.total || 0)
      setLastPage(res.data?.last_page || 1)
    } catch {}
  }, [search, sort, page])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await load()
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reload on filter change (skip first)
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    setPage(1)
    load({ search, sort, page: 1 })
  }, [search, sort]) // eslint-disable-line

  useEffect(() => {
    if (isFirstLoad.current) return
    load({ search, sort, page })
  }, [page]) // eslint-disable-line

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  // Derived stats
  const topBySpend = [...customers].sort((a, b) => b.total_spent - a.total_spent)[0]
  const topByOrders = [...customers].sort((a, b) => b.order_count - a.order_count)[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const pages: number[] = Array.from({ length: lastPage }, (_, i) => i + 1)
  const visiblePages = pages.filter(p => lastPage <= 7 || p === 1 || p === lastPage || Math.abs(p - page) <= 2)
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'

  return (
    <div className="space-y-5 pb-24 lg:pb-6 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-0.5">Admin Panel</p>
          <h1 className="text-xl md:text-2xl font-black text-white">Customers</h1>
          <p className="text-gray-500 text-xs mt-0.5">{totalCustomers} unique customers</p>
        </div>
        <button
          onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-xs font-bold"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Customers"  value={totalCustomers}
          icon={Users}        color="text-amber-400"  bg="bg-amber-500/10"  border="border-amber-500/20" />
        <StatCard label="Loaded (this page)" value={customers.length}
          icon={ShoppingCart} color="text-blue-400"   bg="bg-blue-500/10"   border="border-blue-500/20" />
        <StatCard label="Top Spend"
          value={topBySpend ? `${currency}${Number(topBySpend.total_spent).toLocaleString('en-IN')}` : '—'}
          icon={TrendingUp}   color="text-green-400"  bg="bg-green-500/10"  border="border-green-500/20" />
        <StatCard label="Most Orders"
          value={topByOrders ? topByOrders.order_count : '—'}
          icon={Crown}        color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
      </div>

      {/* Filter bar */}
      <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or phone…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#111] border border-gray-700 rounded-xl text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(v => !v)}
              className="flex items-center gap-2 px-3 py-2 bg-[#111] border border-gray-700 rounded-xl text-gray-300 text-xs font-bold hover:border-gray-600 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{currentSortLabel}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSort(false) }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors',
                        sort === opt.value ? 'text-amber-400' : 'text-gray-400',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Customer list */}
      {customers.length === 0 ? (
        <div className="text-center py-20 bg-[#0c0c0c] border border-gray-800/50 rounded-2xl">
          <Users className="w-12 h-12 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">No customers found</p>
          <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer, i) => (
            <CustomerCard
              key={customer.phone}
              customer={customer}
              currency={currency}
              index={i}
              settings={settings}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-3 h-3" /> Prev
          </button>
          {visiblePages.map((p, idx) => {
            const prevP = visiblePages[idx - 1]
            const gap = prevP && p - prevP > 1
            return (
              <span key={p} className="flex items-center gap-1">
                {gap && <span className="text-gray-700 text-xs px-1">…</span>}
                <button
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-xl text-xs font-black transition-all',
                    p === page
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700',
                  )}
                >
                  {p}
                </button>
              </span>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#111] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
