'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderService, type OrdersAnalytics, type ChartDay } from '@/services/orderService'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  ShoppingCart, TrendingUp, IndianRupee, Calendar, ChevronDown,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:    { bg: 'bg-amber-500/10',   text: 'text-amber-500',  dot: 'bg-amber-500',  label: 'Pending' },
  confirmed:  { bg: 'bg-blue-500/10',    text: 'text-blue-400',   dot: 'bg-blue-400',   label: 'Confirmed' },
  processing: { bg: 'bg-purple-500/10',  text: 'text-purple-400', dot: 'bg-purple-400', label: 'Processing' },
  shipped:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',   dot: 'bg-cyan-400',   label: 'Shipped' },
  delivered:  { bg: 'bg-green-500/10',   text: 'text-green-500',  dot: 'bg-green-500',  label: 'Delivered' },
  cancelled:  { bg: 'bg-red-500/10',     text: 'text-red-400',    dot: 'bg-red-400',    label: 'Cancelled' },
}

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const FILTERS = [
  { label: 'All',   value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
]

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-3 shadow-2xl">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-amber-500 font-black text-sm">{payload[0]?.value} orders</p>
      {payload[1] && (
        <p className="text-green-400 font-bold text-xs">₹{payload[1]?.value?.toFixed(0)}</p>
      )}
    </div>
  )
}

// ─── Analytics Cards ────────────────────────────────────────────────────────────
function AnalyticsCards({ analytics }: { analytics: OrdersAnalytics }) {
  const cards = [
    { label: 'Today',        data: analytics.today, icon: Calendar,      color: 'text-blue-500',   bg: 'bg-blue-500/10' },
    { label: 'This Week',    data: analytics.week,  icon: TrendingUp,    color: 'text-amber-500',  bg: 'bg-amber-500/10' },
    { label: 'This Month',   data: analytics.month, icon: ShoppingCart,  color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'All Time',     data: analytics.total, icon: IndianRupee,   color: 'text-green-500',  bg: 'bg-green-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-4 md:p-5 group hover:border-gray-700 transition-colors">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", card.bg)}>
            <card.icon className={cn("w-5 h-5", card.color)} />
          </div>
          <p className="text-xl md:text-2xl font-black text-white tracking-tight">{card.data.count}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">{card.label} Orders</p>
          <p className="text-xs font-bold text-gray-400 mt-1">₹{card.data.revenue.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Orders Chart ────────────────────────────────────────────────────────────────
function OrdersChart({ chartData }: { chartData: ChartDay[] }) {
  return (
    <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Orders &amp; Revenue</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Last 14 days</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            Orders
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Revenue
          </span>
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ left: -20, right: 8 }}>
            <defs>
              <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="day" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 9, fontWeight: 700 }} />
            <YAxis stroke="#374151" tick={{ fill: '#6b7280', fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="orders" name="orders" stroke="#f59e0b" strokeWidth={2} fill="url(#orders)" />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#22c55e" strokeWidth={1.5} fill="url(#revenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Order Card (mobile + desktop) ──────────────────────────────────────────────
function OrderCard({ order, expanded, onToggle, onStatusChange }: {
  order: any
  expanded: boolean
  onToggle: () => void
  onStatusChange: (id: number, status: string) => void
}) {
  const [detail, setDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']

  const loadDetail = async () => {
    if (detail) return
    setLoadingDetail(true)
    try {
      const d = await orderService.getById(order.id)
      setDetail(d)
    } catch {}
    finally { setLoadingDetail(false) }
  }

  const handleToggle = () => {
    onToggle()
    if (!expanded) loadDetail()
  }

  return (
    <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
      {/* Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors gap-3"
        onClick={handleToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-amber-500 font-black text-xs">{order.invoice_number}</p>
            <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border inline-flex items-center gap-1", cfg.bg, cfg.text, 'border-current/20')}>
              <div className={cn("w-1 h-1 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
          </div>
          <p className="text-white font-bold text-sm mt-0.5 truncate">{order.customer_name}</p>
          <p className="text-gray-500 text-xs">{order.phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <p className="text-white font-black text-base">₹{order.total}</p>
          <p className="text-gray-600 text-[10px]">{new Date(order.created_at).toLocaleDateString()}</p>
          <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", expanded && "rotate-180")} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-800 bg-[#080808] p-4 space-y-4">
          {loadingDetail ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : detail ? (
            <>
              {/* Customer Info + Status Update */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Shipping Address</p>
                  <p className="text-white font-medium">{detail.address}</p>
                  <p className="text-gray-400 text-xs">{detail.city} — {detail.pincode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Update Status</p>
                  <select
                    value={order.status}
                    onChange={e => onStatusChange(order.id, e.target.value)}
                    className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500/50 transition-colors"
                  >
                    {VALID_STATUSES.map(s => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Order Items</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-2 pr-4 text-gray-500 font-black uppercase tracking-widest">Item</th>
                        <th className="text-center py-2 text-gray-500 font-black uppercase tracking-widest">Wt.</th>
                        <th className="text-center py-2 text-gray-500 font-black uppercase tracking-widest">Qty</th>
                        <th className="text-right py-2 text-gray-500 font-black uppercase tracking-widest">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800/50">
                          <td className="py-2 pr-4 text-white font-medium">{item.product_name}</td>
                          <td className="py-2 text-center text-gray-400">{item.weight}</td>
                          <td className="py-2 text-center text-gray-400">{item.qty}</td>
                          <td className="py-2 text-right text-amber-400 font-bold">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-5 mt-3 text-xs">
                  <span className="text-gray-500">Subtotal: <span className="text-white font-bold">₹{detail.subtotal}</span></span>
                  <span className="text-gray-500">Delivery: <span className="text-white font-bold">{detail.delivery == 0 ? 'FREE' : `₹${detail.delivery}`}</span></span>
                  <span className="text-gray-500">Total: <span className="text-amber-400 font-black">₹{detail.total}</span></span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ─── Main Orders Page ────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<any[]>([])
  const [analytics, setAnalytics]     = useState<OrdersAnalytics | null>(null)
  const [chartData, setChartData]     = useState<ChartDay[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [page, setPage]               = useState(1)
  const [lastPage, setLastPage]       = useState(1)
  const [total, setTotal]             = useState(0)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [refreshing, setRefreshing]   = useState(false)

  const loadAnalyticsAndChart = useCallback(async () => {
    try {
      const [a, c] = await Promise.all([
        orderService.getAnalytics(),
        orderService.getChart(14),
      ])
      setAnalytics(a)
      setChartData(c)
    } catch {}
  }, [])

  const loadOrders = useCallback(async (f = filter, p = page) => {
    try {
      const data = await orderService.getAll(f, p)
      setOrders(data.orders)
      setLastPage(data.last_page)
      setTotal(data.total)
    } catch {}
  }, [filter, page])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadAnalyticsAndChart(), loadOrders('all', 1)])
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = async (f: string) => {
    setFilter(f)
    setPage(1)
    setExpandedOrder(null)
    await loadOrders(f, 1)
  }

  const handlePageChange = async (p: number) => {
    setPage(p)
    setExpandedOrder(null)
    await loadOrders(filter, p)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadAnalyticsAndChart(), loadOrders()])
    setRefreshing(false)
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await orderService.updateStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } catch {
      alert('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Pagination pages array
  const pages: number[] = []
  for (let i = 1; i <= lastPage; i++) pages.push(i)
  const visiblePages = pages.filter(p => {
    if (lastPage <= 7) return true
    if (p === 1 || p === lastPage) return true
    if (Math.abs(p - page) <= 2) return true
    return false
  })

  return (
    <div className="space-y-5 pb-24 lg:pb-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-0.5">Admin Panel</p>
          <h1 className="text-xl md:text-2xl font-black text-white">Orders</h1>
          <p className="text-gray-500 text-xs mt-0.5">{total} total records</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-xs font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && <AnalyticsCards analytics={analytics} />}

      {/* Chart */}
      {chartData.length > 0 && <OrdersChart chartData={chartData} />}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-1 bg-[#0c0c0c] border border-gray-800/50 rounded-2xl w-full overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-all",
              filter === f.value
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-[#0c0c0c] border border-gray-800 rounded-2xl p-12 text-center">
            <ShoppingCart className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            {filter !== 'all' && (
              <button onClick={() => handleFilterChange('all')} className="mt-2 text-amber-500 text-sm font-bold hover:text-amber-400">
                View all orders
              </button>
            )}
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#0c0c0c] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages.map((p, i) => {
            const prev = visiblePages[i - 1]
            const showEllipsis = prev && p - prev > 1
            return (
              <span key={p} className="flex items-center gap-1.5">
                {showEllipsis && (
                  <span className="text-gray-600 text-xs px-1">…</span>
                )}
                <button
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all",
                    p === page
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-[#0c0c0c] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                  )}
                >
                  {p}
                </button>
              </span>
            )
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === lastPage}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#0c0c0c] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
