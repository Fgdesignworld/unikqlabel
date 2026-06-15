'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Phone, FileText, Package, Truck, Check, Clock,
  XCircle, ChevronDown, ChevronUp, ShoppingBag, X, AlertCircle,
  MapPin, CreditCard,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PageHeader } from '@/components/page-header'
import { useSettings } from '@/context/settings-context'
import { useSeo } from '@/hooks/use-seo'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrackItem {
  product_name: string
  qty: number
  price: number
  total: number
  original_price?: number | null
  discount_percent?: number | null
  size_label?: string | null
  color_name?: string | null
  weight?: string | null
  image_url?: string | null
}

interface TrackedOrder {
  id: number
  invoice_number: string
  customer_name: string
  created_at: string
  status: string
  subtotal: number
  delivery: number
  discount_amount: number
  coupon_code: string | null
  total: number
  payment_method?: string | null
  city?: string | null
  items: TrackItem[]
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType; step: number }> = {
  pending:    { label: 'Pending',    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',  icon: Clock,     step: 1 },
  confirmed:  { label: 'Confirmed',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.25)',  icon: Check,     step: 2 },
  processing: { label: 'Processing', color: '#c084fc', bg: 'rgba(192,132,252,0.1)',  border: 'rgba(192,132,252,0.25)', icon: Package,   step: 3 },
  shipped:    { label: 'Shipped',    color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.25)',  icon: Truck,     step: 4 },
  delivered:  { label: 'Delivered',  color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)',  icon: Check,     step: 5 },
  cancelled:  { label: 'Cancelled',  color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', icon: XCircle,   step: 0 },
}

const STEPS = [
  { key: 'pending',    label: 'Order Placed', icon: ShoppingBag },
  { key: 'confirmed',  label: 'Confirmed',    icon: Check },
  { key: 'processing', label: 'Processing',   icon: Package },
  { key: 'shipped',    label: 'Shipped',       icon: Truck },
  { key: 'delivered',  label: 'Delivered',     icon: Check },
]

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ─── Status Stepper ───────────────────────────────────────────────────────────
function StatusStepper({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const currentStep = cfg.step
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
        style={{ background: STATUS_CONFIG.cancelled.bg, border: `1px solid ${STATUS_CONFIG.cancelled.border}`, color: STATUS_CONFIG.cancelled.color }}>
        <XCircle className="w-4 h-4" /> Order Cancelled
      </div>
    )
  }
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = i + 1 <= currentStep
        const active = i + 1 === currentStep
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-13">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: done ? 'var(--theme-color)' : 'var(--surface-alt)',
                  border: active ? '2px solid var(--theme-color)' : done ? '2px solid var(--theme-color)' : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: active ? '0 0 12px rgba(212,175,55,0.4)' : 'none',
                }}>
                <Icon className="w-3.5 h-3.5" style={{ color: done ? '#0D0D0D' : 'var(--text-trace)' }} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight"
                style={{ color: done ? 'var(--theme-color)' : 'var(--text-trace)' }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 mx-1 mb-4 rounded-full min-w-3"
                style={{ background: i + 1 < currentStep ? 'var(--theme-color)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, currency, index }: { order: TrackedOrder; currency: string; index: number }) {
  const [expanded, setExpanded] = useState(index === 0)
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/2 transition-colors"
      >
        {/* Status dot + icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>

        {/* Invoice + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{order.invoice_number}</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>{fmtDate(order.created_at)} • {fmtTime(order.created_at)}</span>
            {order.city && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-ghost)' }}>
                <MapPin className="w-2.5 h-2.5" /> {order.city}
              </span>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="text-right shrink-0">
          <p className="text-amber-400 font-black text-base">{currency}{Number(order.total).toLocaleString('en-IN')}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Stepper */}
              <div className="pt-4">
                <StatusStepper status={order.status} />
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-trace)' }}>Items Ordered</p>
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--surface-alt)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Image or placeholder */}
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.1)' }}>
                        <Package className="w-5 h-5 text-amber-500/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.size_label && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.2)' }}>
                            {item.size_label}
                          </span>
                        )}
                        {item.color_name && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)' }}>
                            {item.color_name}
                          </span>
                        )}
                        {!item.size_label && !item.color_name && (
                          <span className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>—</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {item.original_price && Number(item.original_price) > Number(item.price) ? (
                        <>
                          <p className="text-[10px] line-through" style={{ color: 'var(--text-trace)' }}>
                            {currency}{Number(item.original_price * item.qty).toLocaleString('en-IN')}
                          </p>
                          <p className="text-amber-400 font-bold text-sm">{currency}{Number(item.total).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] font-bold" style={{ color: '#4ade80' }}>
                            SAVE {currency}{(Number(item.original_price) - Number(item.price)) * Number(item.qty) < 1
                              ? ((Number(item.original_price) - Number(item.price)) * Number(item.qty)).toFixed(2)
                              : Math.round((Number(item.original_price) - Number(item.price)) * Number(item.qty))}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-amber-400 font-bold text-sm">{currency}{Number(item.total).toLocaleString('en-IN')}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>×{item.qty} @ {currency}{Number(item.price).toLocaleString('en-IN')}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--surface-alt)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--text-subtle)' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currency}{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--text-subtle)' }}>Delivery</span>
                  <span style={{ color: Number(order.delivery) === 0 ? '#4ade80' : 'var(--text-primary)' }}>
                    {Number(order.delivery) === 0 ? 'FREE' : `${currency}${Number(order.delivery).toLocaleString('en-IN')}`}
                  </span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--text-subtle)' }}>
                      Coupon{order.coupon_code ? <span style={{ color: '#fbbf24' }}> ({order.coupon_code})</span> : ''}
                    </span>
                    <span className="font-semibold" style={{ color: '#4ade80' }}>
                      -{currency}{Number(order.discount_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {order.payment_method && (
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: 'var(--text-subtle)' }}>Payment</span>
                    <span className="font-semibold uppercase" style={{ color: 'var(--text-primary)' }}>{order.payment_method}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span className="text-amber-400 font-black text-base">{currency}{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  useSeo({ pageType: 'page', pageSlug: 'track', fallbackTitle: 'Track Your Order — KoffeeKup' })
  const { settings } = useSettings()
  const currency = settings?.currency_symbol || '₹'

  const [tab, setTab] = useState<'phone' | 'invoice'>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [invoiceInput, setInvoiceInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOrders(null)
    setSearched(false)

    const query = tab === 'phone' ? phoneInput.trim() : invoiceInput.trim().toUpperCase()
    if (!query) return

    if (tab === 'phone' && !/^\d{10}$/.test(query)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (tab === 'invoice' && query.length < 3) {
      setError('Please enter a valid invoice number (e.g. KK-123456).')
      return
    }

    setLoading(true)
    try {
      const params = tab === 'phone' ? { phone: query } : { invoice: query }
      const res = await api.get('/orders/track', { params })
      setOrders(res.data?.orders || [])
      setSearched(true)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setOrders(null)
    setError(null)
    setSearched(false)
    setPhoneInput('')
    setInvoiceInput('')
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      <Navbar />
      <PageHeader
        title="Track Order"
        subtitle="Enter your mobile number or invoice number to view your order history and live status"
        backgroundImage="/images/track_hero_banner.png"
      />

      <section className="px-4 pb-24 pt-8">
        <div className="container mx-auto max-w-2xl">

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 mb-8"
            style={{ background: 'var(--surface-card)', border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          >
            {/* Tab switcher */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--surface-alt)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {([
                { key: 'phone',   label: 'Mobile Number', icon: Phone },
                { key: 'invoice', label: 'Invoice Number', icon: FileText },
              ] as { key: 'phone' | 'invoice'; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setError(null) }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all',
                  )}
                  style={tab === key ? {
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: 'var(--theme-color)',
                  } : { color: 'var(--text-ghost)', border: '1px solid transparent' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{key === 'phone' ? 'Mobile' : 'Invoice'}</span>
                </button>
              ))}
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                {tab === 'phone' ? (
                  <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.5)' }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--text-ghost)' }}>+91</span>
                      <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-22 pr-12 py-4 rounded-xl text-sm font-medium outline-none transition-all"
                      style={{
                        background: 'var(--surface-alt)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <FileText className="w-4 h-4" style={{ color: 'rgba(212,175,55,0.5)' }} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. KK-643770"
                      value={invoiceInput}
                      onChange={e => setInvoiceInput(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-12 py-4 rounded-xl text-sm font-medium outline-none transition-all uppercase tracking-wider"
                      style={{
                        background: 'var(--surface-alt)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </>
                )}
                {(phoneInput || invoiceInput) && (
                  <button type="button" onClick={clear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
                    style={{ color: 'var(--text-ghost)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || (tab === 'phone' ? phoneInput.length !== 10 : invoiceInput.length < 3)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))',
                  color: '#0D0D0D',
                }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                    <Search className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? 'Searching...' : 'Track Orders'}
              </button>
            </form>

            {/* Hint */}
            <p className="text-center text-[11px] mt-4" style={{ color: 'var(--text-trace)' }}>
              {tab === 'phone'
                ? 'Enter the mobile number you used when placing your order'
                : 'Find your invoice number in the PDF or WhatsApp confirmation message'}
            </p>
          </motion.div>

          {/* Results */}
          <div ref={resultsRef}>
            <AnimatePresence>
              {searched && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* No orders */}
                  {(orders === null || orders.length === 0) && !error && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16 rounded-2xl"
                      style={{ background: 'var(--surface-card)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}>
                        <ShoppingBag className="w-7 h-7 text-amber-500/40" />
                      </div>
                      <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>No Orders Found</p>
                      <p className="text-sm" style={{ color: 'var(--text-ghost)' }}>
                        {tab === 'phone'
                          ? "We couldn't find any orders for this mobile number."
                          : "No order matches this invoice number."}
                      </p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-trace)' }}>
                        Please check and try again
                      </p>
                    </motion.div>
                  )}

                  {/* Orders list */}
                  {orders && orders.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-ghost)' }}>
                          {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
                        </p>
                        <button onClick={clear} className="text-[11px] font-bold" style={{ color: 'rgba(212,175,55,0.6)' }}>
                          Clear
                        </button>
                      </div>
                      {orders.map((order, i) => (
                        <OrderCard key={order.id} order={order} currency={currency} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info cards (shown before search) */}
          {!searched && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {[
                { icon: Phone,    title: 'Mobile Lookup',    desc: 'View all orders placed with your phone number' },
                { icon: FileText, title: 'Invoice Search',   desc: 'Track a specific order using its invoice ID' },
                { icon: Truck,    title: 'Live Status',      desc: 'See real-time status from pending to delivered' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--surface-alt)', border: '1px solid rgba(212,175,55,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    <Icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-ghost)' }}>{desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
