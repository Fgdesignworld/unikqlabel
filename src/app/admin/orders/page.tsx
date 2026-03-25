'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { orderService, type OrdersAnalytics, type ChartDay, type OrderFilters } from '@/services/orderService'
import { useSettings } from '@/context/settings-context'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  ShoppingCart, TrendingUp, IndianRupee, Calendar, ChevronDown,
  ChevronLeft, ChevronRight, RefreshCw, Search, X, Filter,
  Trash2, RotateCcw, AlertTriangle, CreditCard, Smartphone,
  Banknote, Wallet, Check, Clock, Package, Truck, XCircle,
  ChevronUp, CalendarDays, SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string; label: string; icon: React.ElementType }> = {
  pending:    { bg: 'bg-amber-500/10',   text: 'text-amber-400',  dot: 'bg-amber-400',  border: 'border-amber-500/30',  label: 'Pending',    icon: Clock },
  confirmed:  { bg: 'bg-blue-500/10',    text: 'text-blue-400',   dot: 'bg-blue-400',   border: 'border-blue-500/30',   label: 'Confirmed',  icon: Check },
  processing: { bg: 'bg-purple-500/10',  text: 'text-purple-400', dot: 'bg-purple-400', border: 'border-purple-500/30', label: 'Processing', icon: Package },
  shipped:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',   dot: 'bg-cyan-400',   border: 'border-cyan-500/30',   label: 'Shipped',    icon: Truck },
  delivered:  { bg: 'bg-green-500/10',   text: 'text-green-400',  dot: 'bg-green-400',  border: 'border-green-500/30',  label: 'Delivered',  icon: Check },
  cancelled:  { bg: 'bg-red-500/10',     text: 'text-red-400',    dot: 'bg-red-400',    border: 'border-red-500/30',    label: 'Cancelled',  icon: XCircle },
}

const PAYMENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  cod:        { label: 'Cash on Delivery', icon: Banknote,    color: 'text-amber-400' },
  upi:        { label: 'UPI',              icon: Smartphone,  color: 'text-purple-400' },
  gpay:       { label: 'Google Pay',       icon: Wallet,      color: 'text-blue-400' },
  phonepay:   { label: 'PhonePe',          icon: Smartphone,  color: 'text-indigo-400' },
  card:       { label: 'Card',             icon: CreditCard,  color: 'text-cyan-400' },
  netbanking: { label: 'Net Banking',      icon: CreditCard,  color: 'text-green-400' },
  other:      { label: 'Other',            icon: IndianRupee, color: 'text-gray-400' },
  unknown:    { label: 'Not set',          icon: IndianRupee, color: 'text-gray-600' },
}

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PERIOD_FILTERS = [
  { label: 'All',   value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
]

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// â”€â”€â”€ Custom Tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-3 shadow-2xl">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-amber-500 font-black text-sm">{payload[0]?.value} orders</p>
      {payload[1] && <p className="text-green-400 font-bold text-xs">{currency || '₹'}{Number(payload[1]?.value).toLocaleString('en-IN')}</p>}
    </div>
  )
}

// â”€â”€â”€ Analytics Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnalyticsCards({ analytics, settings }: { analytics: OrdersAnalytics; settings: any }) {
  const cards = [
    { label: 'Today',      data: analytics.today, icon: Calendar,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    { label: 'This Week',  data: analytics.week,  icon: TrendingUp,   color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    { label: 'This Month', data: analytics.month, icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'All Time',   data: analytics.total, icon: IndianRupee,  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className={cn("bg-[#0c0c0c] border rounded-2xl p-4 md:p-5 group hover:border-gray-700 transition-colors", card.border)}>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", card.bg)}>
            <card.icon className={cn("w-5 h-5", card.color)} />
          </div>
          <p className="text-xl md:text-2xl font-black text-white tracking-tight">{card.data.count}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">{card.label} Orders</p>
          <p className="text-xs font-bold text-gray-400 mt-1">{settings?.currency_symbol || '₹'}{card.data.revenue.toLocaleString('en-IN')}</p>
        </div>
      ))}
    </div>
  )
}

// â”€â”€â”€ Status Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusBreakdown({ byStatus }: { byStatus: Record<string, number> }) {
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Order Status Breakdown</p>
      <div className="space-y-2.5">
        {VALID_STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s]
          const count = byStatus[s] ?? 0
          const pct = Math.round((count / total) * 100)
          const Icon = cfg.icon
          return (
            <div key={s} className="flex items-center gap-3">
              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                <Icon className={cn("w-3 h-3", cfg.text)} />
              </div>
              <span className="text-gray-400 text-xs w-20 capitalize">{cfg.label}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", cfg.dot.replace('bg-', 'bg-'))} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold text-white w-6 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// â”€â”€â”€ Payment Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PaymentBreakdown({ byPayment }: { byPayment: Record<string, number> }) {
  const entries = Object.entries(byPayment).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1
  return (
    <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Payment Methods</p>
      {entries.length === 0 ? (
        <p className="text-gray-600 text-xs text-center py-3">No payment data yet</p>
      ) : (
        <div className="space-y-2.5">
          {entries.map(([method, count]) => {
            const cfg = PAYMENT_CONFIG[method] ?? PAYMENT_CONFIG.other
            const pct = Math.round((count / total) * 100)
            const Icon = cfg.icon
            return (
              <div key={method} className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 shrink-0", cfg.color)} />
                <span className="text-gray-400 text-xs w-24 truncate">{cfg.label}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500/60 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-white w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ Orders Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OrdersChart({ chartData, currency }: { chartData: ChartDay[]; currency?: string }) {
  return (
    <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Orders &amp; Revenue</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Last 14 days</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" />Orders</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" />Revenue</span>
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
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area type="monotone" dataKey="orders" name="orders" stroke="#f59e0b" strokeWidth={2} fill="url(#orders)" />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#22c55e" strokeWidth={1.5} fill="url(#revenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// â”€â”€â”€ Payment Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PaymentBadge({ method }: { method?: string | null }) {
  if (!method) return null
  const cfg = PAYMENT_CONFIG[method] ?? PAYMENT_CONFIG.other
  const Icon = cfg.icon
  return (
    <span className={cn("flex items-center gap-1 text-[9px] font-black uppercase tracking-wider", cfg.color)}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

// â”€â”€â”€ Confirm Delete Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmModal({
  title, message, confirmText = 'Confirm', isDangerous = false, onConfirm, onCancel,
}: { title: string; message: string; confirmText?: string; isDangerous?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", isDangerous ? "bg-red-500/10" : "bg-amber-500/10")}>
          <AlertTriangle className={cn("w-6 h-6", isDangerous ? "text-red-400" : "text-amber-400")} />
        </div>
        <h2 className="text-white font-black text-lg mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className={cn("flex-1 py-2.5 rounded-xl text-sm font-black transition-all", isDangerous ? "bg-red-600 hover:bg-red-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-black")}>
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// â”€â”€â”€ Order Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OrderCard({ order, expanded, onToggle, onStatusChange, onPaymentChange, onDelete, isTrash, onRestore, onForceDelete, settings }: {
  order: any
  expanded: boolean
  onToggle: () => void
  onStatusChange: (id: number, status: string) => void
  onPaymentChange: (id: number, method: string) => void
  onDelete: (id: number) => void
  isTrash: boolean
  onRestore: (id: number) => void
  onForceDelete: (id: number) => void
  settings: any
}) {
  const [detail, setDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
  const StatusIcon = cfg.icon

  const loadDetail = async () => {
    if (detail) return
    setLoadingDetail(true)
    try { setDetail(await orderService.getById(order.id)) } catch {}
    finally { setLoadingDetail(false) }
  }

  const handleToggle = () => { onToggle(); if (!expanded) loadDetail() }

  return (
    <div className={cn("bg-[#0c0c0c] border rounded-2xl overflow-hidden transition-colors", expanded ? "border-gray-700" : "border-gray-800/50 hover:border-gray-700")}>
      {/* Row header */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/2 transition-colors gap-3" onClick={handleToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-amber-500 font-black text-xs tracking-wide">{order.invoice_number}</p>
            <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border inline-flex items-center gap-1", cfg.bg, cfg.text, cfg.border)}>
              <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
            {order.payment_method && <PaymentBadge method={order.payment_method} />}
          </div>
          <p className="text-white font-bold text-sm truncate">{order.customer_name}</p>
          <p className="text-gray-500 text-xs">{order.phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <p className="text-white font-black text-base">{settings?.currency_symbol || '₹'}{Number(order.total).toLocaleString('en-IN')}</p>
          <p className="text-gray-600 text-[10px]">{fmtDate(order.created_at)}</p>
          <p className="text-gray-700 text-[9px]">{fmtTime(order.created_at)}</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-500 mt-0.5" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-gray-800 bg-[#080808] p-4 space-y-5">
          {loadingDetail ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : detail ? (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {/* Address */}
                <div className="space-y-1">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Shipping Address</p>
                  <p className="text-white font-medium text-sm">{detail.address}</p>
                  <p className="text-gray-400 text-xs">{detail.city} â€” {detail.pincode}</p>
                  {detail.notes && <p className="text-gray-600 text-xs italic">"{detail.notes}"</p>}
                </div>

                {/* Status Update */}
                {!isTrash && (
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Update Status</p>
                    <select
                      value={order.status}
                      onChange={e => onStatusChange(order.id, e.target.value)}
                      className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500/50 transition-colors"
                      style={{ colorScheme: 'dark' }}
                    >
                      {VALID_STATUSES.map(s => (
                        <option key={s} value={s} className="capitalize">{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Payment Method */}
                {!isTrash && (
                  <div className="space-y-1">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Payment Method</p>
                    <select
                      value={order.payment_method ?? ''}
                      onChange={e => onPaymentChange(order.id, e.target.value)}
                      className="w-full px-3 py-2 bg-[#111] border border-gray-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500/50 transition-colors"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="">-- Not Set --</option>
                      {Object.entries(PAYMENT_CONFIG).filter(([k]) => k !== 'unknown').map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    {order.payment_ref && <p className="text-gray-500 text-[10px]">Ref: {order.payment_ref}</p>}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Order Items</p>
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#0a0a0a]">
                        <th className="text-left p-3 text-gray-500 font-black uppercase tracking-widest">Item</th>
                        <th className="text-center p-3 text-gray-500 font-black uppercase tracking-widest">Wt.</th>
                        <th className="text-center p-3 text-gray-500 font-black uppercase tracking-widest">Qty</th>
                        <th className="text-right p-3 text-gray-500 font-black uppercase tracking-widest">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800/50 last:border-0">
                          <td className="p-3 text-white font-medium">{item.product_name}</td>
                          <td className="p-3 text-center text-gray-400">{item.weight}</td>
                          <td className="p-3 text-center text-gray-400">{item.qty}</td>
                          <td className="p-3 text-right text-amber-400 font-bold">{settings?.currency_symbol || '₹'}{Number(item.total).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-5 mt-3 text-xs flex-wrap">
                  <span className="text-gray-500">Subtotal: <span className="text-white font-bold">{settings?.currency_symbol || '₹'}{Number(detail.subtotal).toLocaleString('en-IN')}</span></span>
                  <span className="text-gray-500">Delivery: <span className="text-white font-bold">{Number(detail.delivery) === 0 ? 'FREE' : `${settings?.currency_symbol || '₹'}${Number(detail.delivery).toLocaleString('en-IN')}`}</span></span>
                  <span className="text-gray-500">Total: <span className="text-amber-400 font-black">{settings?.currency_symbol || '₹'}{Number(detail.total).toLocaleString('en-IN')}</span></span>
                </div>
              </div>

              {/* Trash actions */}
              {isTrash ? (
                <div className="flex gap-3 pt-1">
                  <button onClick={() => onRestore(order.id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-black transition-all">
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Order
                  </button>
                  <button onClick={() => onForceDelete(order.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-black transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                  </button>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button onClick={() => onDelete(order.id)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-500/30 rounded-xl text-xs font-bold transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ Date Range Picker (simple) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DateRangePicker({ from, to, onChange, onClear }: {
  from: string; to: string
  onChange: (from: string, to: string) => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
      <input
        type="date"
        value={from}
        onChange={e => onChange(e.target.value, to)}
        className="bg-[#111] border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
        style={{ colorScheme: 'dark' }}
      />
      <span className="text-gray-600 text-xs">to</span>
      <input
        type="date"
        value={to}
        min={from}
        onChange={e => onChange(from, e.target.value)}
        className="bg-[#111] border border-gray-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
        style={{ colorScheme: 'dark' }}
      />
      {(from || to) && (
        <button onClick={onClear} className="text-gray-500 hover:text-red-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// â”€â”€â”€ Main Orders Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams()
  const { settings } = useSettings()
  const highlightId = searchParams.get('highlight') ? Number(searchParams.get('highlight')) : null
  const highlightRef = useRef<HTMLDivElement>(null)

  const [orders, setOrders]               = useState<any[]>([])
  const [analytics, setAnalytics]         = useState<OrdersAnalytics | null>(null)
  const [chartData, setChartData]         = useState<ChartDay[]>([])
  const [loading, setLoading]             = useState(true)
  const [refreshing, setRefreshing]       = useState(false)

  // Filter state
  const [periodFilter, setPeriodFilter]   = useState('all')
  const [statusFilter, setStatusFilter]   = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [search, setSearch]               = useState('')
  const [searchInput, setSearchInput]     = useState('')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [isTrash, setIsTrash]             = useState(false)
  const [showFilters, setShowFilters]     = useState(false)

  // Pagination
  const [page, setPage]         = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal]       = useState(0)

  const [expandedOrder, setExpandedOrder] = useState<number | null>(highlightId)

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    id: number; type: 'delete' | 'force'
  } | null>(null)

  const buildFilters = useCallback((overrides: Partial<OrderFilters> = {}): OrderFilters => ({
    filter: periodFilter,
    status: statusFilter || undefined,
    payment_method: paymentFilter || undefined,
    search: search || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    trash: isTrash,
    ...overrides,
  }), [periodFilter, statusFilter, paymentFilter, search, dateFrom, dateTo, page, isTrash])

  const loadOrders = useCallback(async (filters?: OrderFilters) => {
    try {
      const data = await orderService.getAll(filters ?? buildFilters())
      setOrders(data.orders ?? [])
      setLastPage(data.last_page ?? 1)
      setTotal(data.total ?? 0)
    } catch {}
  }, [buildFilters])

  const loadAnalytics = useCallback(async () => {
    try {
      const [a, c] = await Promise.all([orderService.getAnalytics(), orderService.getChart(14)])
      setAnalytics(a)
      setChartData(c)
    } catch {}
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadAnalytics(), loadOrders(buildFilters({ page: 1 }))])
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line

  // Scroll to highlighted order
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
    }
  }, [highlightId, orders])

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Re-fetch when filters/page change (after initial)
  const isFirstLoad = useRef(true)
  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    loadOrders(buildFilters({ page }))
  }, [periodFilter, statusFilter, paymentFilter, search, dateFrom, dateTo, isTrash, page]) // eslint-disable-line

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadAnalytics(), loadOrders()])
    setRefreshing(false)
  }

  const resetFilters = () => {
    setPeriodFilter('all'); setStatusFilter(''); setPaymentFilter('')
    setSearchInput(''); setSearch(''); setDateFrom(''); setDateTo(''); setIsTrash(false); setPage(1)
  }

  const hasActiveFilters = statusFilter || paymentFilter || search || dateFrom || dateTo || isTrash || periodFilter !== 'all'

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await orderService.updateStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } catch { alert('Failed to update status') }
  }

  const handlePaymentChange = async (id: number, method: string) => {
    if (!method) return
    try {
      await orderService.updatePayment(id, method)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_method: method } : o))
      loadAnalytics()
    } catch { alert('Failed to update payment') }
  }

  const handleDelete = (id: number) => setConfirmModal({ id, type: 'delete' })
  const handleForceDelete = (id: number) => setConfirmModal({ id, type: 'force' })

  const confirmAction = async () => {
    if (!confirmModal) return
    const { id, type } = confirmModal
    setConfirmModal(null)
    try {
      if (type === 'delete') {
        await orderService.softDelete(id)
        setOrders(prev => prev.filter(o => o.id !== id))
        setTotal(t => t - 1)
        loadAnalytics()
      } else {
        await orderService.forceDelete(id)
        setOrders(prev => prev.filter(o => o.id !== id))
        setTotal(t => t - 1)
      }
    } catch { alert('Action failed') }
  }

  const handleRestore = async (id: number) => {
    try {
      await orderService.restore(id)
      setOrders(prev => prev.filter(o => o.id !== id))
      setTotal(t => t - 1)
      loadAnalytics()
    } catch { alert('Restore failed') }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Pagination
  const pages: number[] = []
  for (let i = 1; i <= lastPage; i++) pages.push(i)
  const visiblePages = pages.filter(p => lastPage <= 7 || p === 1 || p === lastPage || Math.abs(p - page) <= 2)

  return (
    <div className="space-y-5 pb-24 lg:pb-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-0.5">Admin Panel</p>
          <h1 className="text-xl md:text-2xl font-black text-white">
            {isTrash ? 'Trash â€” Orders' : 'Orders'}
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {total} {isTrash ? 'trashed' : 'total'} records
            {analytics?.trashed != null && analytics.trashed > 0 && !isTrash && (
              <button onClick={() => { setIsTrash(true); setPage(1) }} className="ml-2 text-red-400 hover:text-red-300 font-bold underline underline-offset-2 transition-colors">
                {analytics.trashed} in trash
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTrash && (
            <button onClick={() => { setIsTrash(false); setPage(1) }} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black transition-all hover:bg-emerald-500/20">
              <RotateCcw className="w-3.5 h-3.5" /> Active Orders
            </button>
          )}
          <button
            onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-xs font-bold"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && <AnalyticsCards analytics={analytics} settings={settings} />}

      {/* Status + Payment breakdown (collapsible) */}
      {analytics && (analytics.by_status || analytics.by_payment) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analytics.by_status && <StatusBreakdown byStatus={analytics.by_status} />}
          {analytics.by_payment && <PaymentBreakdown byPayment={analytics.by_payment} />}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && <OrdersChart chartData={chartData} currency={settings?.currency_symbol} />}

      {/* â”€â”€ Filter Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-3 space-y-3">
        {/* Top row: search + filter toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, phone, invoiceâ€¦"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#111] border border-gray-700 rounded-xl text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all",
              showFilters || hasActiveFilters ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-[#111] border-gray-700 text-gray-400 hover:text-white"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
          </button>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-bold flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-gray-800 space-y-3">
                {/* Period + Status + Payment */}
                <div className="flex flex-wrap gap-2">
                  {/* Period */}
                  <div>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Period</p>
                    <div className="flex gap-1">
                      {PERIOD_FILTERS.map(f => (
                        <button key={f.value} onClick={() => { setPeriodFilter(f.value); setPage(1) }}
                          className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            periodFilter === f.value ? "bg-amber-500 text-black" : "bg-[#111] border border-gray-700 text-gray-500 hover:text-white"
                          )}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Status</p>
                    <div className="flex gap-1 flex-wrap">
                      {['', ...VALID_STATUSES].map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                          className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            statusFilter === s
                              ? "bg-amber-500 text-black"
                              : "bg-[#111] border border-gray-700 text-gray-500 hover:text-white"
                          )}>
                          {s === '' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Payment</p>
                    <div className="flex gap-1 flex-wrap">
                      {['', 'cod', 'upi', 'gpay', 'phonepay', 'card', 'netbanking'].map(pm => (
                        <button key={pm} onClick={() => { setPaymentFilter(pm); setPage(1) }}
                          className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            paymentFilter === pm
                              ? "bg-amber-500 text-black"
                              : "bg-[#111] border border-gray-700 text-gray-500 hover:text-white"
                          )}>
                          {pm === '' ? 'All' : PAYMENT_CONFIG[pm]?.label ?? pm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Date Range</p>
                  <DateRangePicker
                    from={dateFrom} to={dateTo}
                    onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
                    onClear={() => { setDateFrom(''); setDateTo(''); setPage(1) }}
                  />
                </div>

                {/* Trash toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setIsTrash(v => !v); setPage(1) }}
                    className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all",
                      isTrash ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[#111] border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/30"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isTrash ? 'Viewing Trash' : 'View Trash'}
                    {analytics?.trashed != null && analytics.trashed > 0 && (
                      <span className="bg-red-500/20 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded-full">{analytics.trashed}</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-[#0c0c0c] border border-gray-800 rounded-2xl p-12 text-center">
            <ShoppingCart className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              {isTrash ? 'Trash is empty' : 'No orders found'}
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-2 text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                ref={order.id === highlightId ? highlightRef : undefined}
                className={cn("rounded-2xl transition-all duration-700", order.id === highlightId && 'ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/10')}
              >
                <OrderCard
                  order={order}
                  expanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  onStatusChange={handleStatusChange}
                  onPaymentChange={handlePaymentChange}
                  onDelete={handleDelete}
                  isTrash={isTrash}
                  onRestore={handleRestore}
                  onForceDelete={handleForceDelete}
                  settings={settings}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#0c0c0c] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {visiblePages.map((p, i) => {
            const prev = visiblePages[i - 1]
            const showEllipsis = prev && p - prev > 1
            return (
              <span key={p} className="flex items-center gap-1.5">
                {showEllipsis && <span className="text-gray-600 text-xs px-1">â€¦</span>}
                <button onClick={() => setPage(p)}
                  className={cn("w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all",
                    p === page ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-[#0c0c0c] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                  )}>
                  {p}
                </button>
              </span>
            )
          })}
          <button onClick={() => setPage(p => p + 1)} disabled={page === lastPage}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#0c0c0c] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            title={confirmModal.type === 'force' ? 'Permanently Delete Order?' : 'Move to Trash?'}
            message={confirmModal.type === 'force'
              ? 'This cannot be undone. The order and all its items will be permanently deleted from the database.'
              : 'The order will be moved to trash. You can restore it later from the Trash view.'}
            confirmText={confirmModal.type === 'force' ? 'Delete Forever' : 'Move to Trash'}
            isDangerous={confirmModal.type === 'force'}
            onConfirm={confirmAction}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
