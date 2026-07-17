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
  pending:    { label: 'Pending',    color: '#C8A96B', bg: 'rgba(200,169,107,0.08)', border: 'rgba(200,169,107,0.2)',  icon: Clock,     step: 1 },
  confirmed:  { label: 'Confirmed',  color: '#2D6B4F', bg: 'rgba(45,107,79,0.08)',    border: 'rgba(45,107,79,0.2)',     icon: Check,     step: 2 },
  processing: { label: 'Processing', color: '#8A9A86', bg: 'rgba(138,154,134,0.08)', border: 'rgba(138,154,134,0.2)',  icon: Package,   step: 3 },
  shipped:    { label: 'Shipped',    color: '#4A6F5D', bg: 'rgba(74,111,93,0.08)',   border: 'rgba(74,111,93,0.2)',    icon: Truck,     step: 4 },
  delivered:  { label: 'Delivered',  color: '#2D6B4F', bg: 'rgba(45,107,79,0.08)',    border: 'rgba(45,107,79,0.2)',    icon: Check,     step: 5 },
  cancelled:  { label: 'Cancelled',  color: '#B25A5A', bg: 'rgba(178,90,90,0.08)',   border: 'rgba(178,90,90,0.2)',    icon: XCircle,   step: 0 },
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
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border"
        style={{ background: STATUS_CONFIG.cancelled.bg, borderColor: STATUS_CONFIG.cancelled.border, color: STATUS_CONFIG.cancelled.color }}>
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
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all border",
                done 
                  ? "bg-[#1F4D3A] !text-[#FDFBF7] border-[#1F4D3A] dark:bg-[#C8A96B] dark:!text-[#1A1A1A] dark:border-[#C8A96B]" 
                  : "bg-white/80 dark:bg-white/5 border-[#C8A96B]/25 text-neutral-400 dark:text-neutral-500"
              )}
                style={active ? { boxShadow: '0 0 12px rgba(200,169,107,0.3)' } : undefined}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider text-center leading-tight mt-1",
                done ? "text-[#1F4D3A] dark:text-[#C8A96B]" : "text-neutral-400 dark:text-neutral-500"
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-1 mb-4 rounded-full min-w-3",
                i + 1 < currentStep ? "bg-[#1F4D3A] dark:bg-[#C8A96B]" : "bg-[#C8A96B]/15 dark:bg-white/10"
              )} />
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
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="relative z-10">
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50/50 dark:hover:bg-white/2 transition-colors"
      >
        {/* Status dot + icon */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
          style={{ background: cfg.bg, borderColor: cfg.border }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>

        {/* Invoice + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-[#1F4D3A] dark:text-[#FDFBF7]">{order.invoice_number}</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border"
              style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[11px] text-neutral-500 dark:text-white/40">{fmtDate(order.created_at)} • {fmtTime(order.created_at)}</span>
            {order.city && (
              <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-white/40">
                <MapPin className="w-2.5 h-2.5" /> {order.city}
              </span>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="text-right shrink-0">
          <p className="text-[#C8A96B] font-bold text-base">{currency}{Number(order.total).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-neutral-400 dark:text-white/30">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
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
            <div className="px-4 pb-4 space-y-4 border-t border-[#C8A96B]/15 dark:border-white/5">
              {/* Stepper */}
              <div className="pt-4">
                <StatusStepper status={order.status} />
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A] dark:text-[#C8A96B]">Items Ordered</p>
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#FDFBF7]/40 dark:bg-[#121212] border border-[#C8A96B]/15 dark:border-white/5">
                    {/* Image or placeholder */}
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 bg-white"
                        style={{ border: '1px solid rgba(200,169,107,0.15)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-[#1A1A1A] border border-[#C8A96B]/15 dark:border-white/5">
                        <Package className="w-5 h-5 text-[#1F4D3A]/30 dark:text-[#C8A96B]/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-[#1F4D3A] dark:text-[#FDFBF7]">{item.product_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.size_label && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1F4D3A]/5 text-[#1F4D3A] dark:bg-[#C8A96B]/10 dark:text-[#C8A96B] border border-[#1F4D3A]/15 dark:border-[#C8A96B]/15">
                            {item.size_label}
                          </span>
                        )}
                        {item.color_name && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-white/70 border border-neutral-200 dark:border-white/5">
                            {item.color_name}
                          </span>
                        )}
                        {!item.size_label && !item.color_name && (
                          <span className="text-[10px] text-neutral-400">—</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {item.original_price && Number(item.original_price) > Number(item.price) ? (
                        <>
                          <p className="text-[10px] line-through text-neutral-400 dark:text-neutral-500">
                            {currency}{Number(item.original_price * item.qty).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[#C8A96B] font-bold text-sm">{currency}{Number(item.total).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] font-bold text-green-600 dark:text-green-500">
                            SAVE {currency}{(Number(item.original_price) - Number(item.price)) * Number(item.qty) < 1
                              ? ((Number(item.original_price) - Number(item.price)) * Number(item.qty)).toFixed(2)
                              : Math.round((Number(item.original_price) - Number(item.price)) * Number(item.qty))}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[#C8A96B] font-bold text-sm">{currency}{Number(item.total).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-neutral-400 dark:text-white/40">×{item.qty} @ {currency}{Number(item.price).toLocaleString('en-IN')}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-lg p-3 space-y-2 bg-[#FDFBF7]/50 dark:bg-[#121212] border border-[#C8A96B]/15 dark:border-white/5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-500 dark:text-white/40">Subtotal</span>
                  <span className="font-semibold text-[#1F4D3A] dark:text-[#FDFBF7]">{currency}{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-500 dark:text-white/40">Delivery</span>
                  <span className={Number(order.delivery) === 0 ? 'text-green-600 dark:text-green-500 font-bold' : 'text-[#1F4D3A] dark:text-[#FDFBF7]'}>
                    {Number(order.delivery) === 0 ? 'FREE' : `${currency}${Number(order.delivery).toLocaleString('en-IN')}`}
                  </span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-neutral-500 dark:text-white/40">
                      Coupon{order.coupon_code ? <span className="text-[#C8A96B]"> ({order.coupon_code})</span> : ''}
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-500">
                      -{currency}{Number(order.discount_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {order.payment_method && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-neutral-500 dark:text-white/40">Payment</span>
                    <span className="font-semibold uppercase text-[#1F4D3A] dark:text-[#FDFBF7]">{order.payment_method}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#C8A96B]/15 dark:border-white/5">
                  <span className="font-bold text-sm text-[#1F4D3A] dark:text-[#FDFBF7]">Total</span>
                  <span className="text-[#C8A96B] font-bold text-base">{currency}{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  useSeo({ pageType: 'page', pageSlug: 'track', fallbackTitle: 'Track Your Order — Aarvia' })
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
    <main className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] text-[#1F4D3A] dark:text-[#FDFBF7] transition-colors duration-500 overflow-hidden">
      {/* Decorative Background for Liquid Glass Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C8A96B]/10 dark:bg-[#C8A96B]/5 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#1F4D3A]/10 dark:bg-[#1F4D3A]/10 blur-[120px]" />
      </div>

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
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-3xl p-6 md:p-10 mb-8 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative z-10">
            {/* Tab switcher */}
            <div className="flex rounded-xl p-1 mb-6 bg-[#FDFBF7]/80 dark:bg-[#121212] border border-[#C8A96B]/15 dark:border-white/5">
              {([
                { key: 'phone',   label: 'Mobile Number', icon: Phone },
                { key: 'invoice', label: 'Invoice Number', icon: FileText },
              ] as { key: 'phone' | 'invoice'; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setError(null) }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                    tab === key
                      ? 'bg-[#1F4D3A] !text-white dark:bg-[#C8A96B] dark:!text-[#1A1A1A] shadow-sm'
                      : 'text-neutral-500 hover:text-[#1F4D3A] dark:text-neutral-400 dark:hover:text-[#C8A96B]'
                  )}
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
                      <Phone className="w-4 h-4 text-[#1F4D3A] dark:text-[#C8A96B]" />
                      <span className="text-sm font-bold text-[#1F4D3A] dark:text-[#FDFBF7]">+91</span>
                      <span className="w-px h-4 bg-[#C8A96B]/30" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-22 pr-12 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <FileText className="w-4 h-4 text-[#1F4D3A] dark:text-[#C8A96B]" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. KK-643770"
                      value={invoiceInput}
                      onChange={e => setInvoiceInput(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-12 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] uppercase tracking-wider placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                    />
                  </>
                )}
                {(phoneInput || invoiceInput) && (
                  <button type="button" onClick={clear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors text-neutral-400 hover:text-[#1F4D3A] dark:text-neutral-500 dark:hover:text-[#C8A96B]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || (tab === 'phone' ? phoneInput.length !== 10 : invoiceInput.length < 3)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer !text-white bg-gradient-to-r from-[#1F4D3A] to-[#163829] hover:from-[#163829] hover:to-[#0f261c] dark:from-[#C8A96B] dark:to-[#E2C98A] dark:hover:from-[#E2C98A] dark:hover:to-[#f3e1a6] dark:!text-[#1A1A1A] shadow-[0_8px_30px_rgba(31,77,58,0.3)] dark:shadow-[0_8px_30px_rgba(200,169,107,0.4)] hover:scale-[1.02] active:scale-[0.98] duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none" />
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
            <p className="text-center text-[11px] mt-4 text-neutral-500 dark:text-neutral-400">
              {tab === 'phone'
                ? 'Enter the mobile number you used when placing your order'
                : 'Find your invoice number in the PDF or WhatsApp confirmation message'}
            </p>
            </div>
          </motion.div>

          {/* Results */}
          <div ref={resultsRef}>
            <AnimatePresence>
              {searched && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* No orders */}
                  {(orders === null || orders.length === 0) && !error && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)]"
                    >
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#FDFBF7] dark:bg-[#121212] border border-[#C8A96B]/20 dark:border-white/10">
                        <ShoppingBag className="w-7 h-7 text-[#1F4D3A] dark:text-[#C8A96B]" />
                      </div>
                      <p className="font-serif text-lg font-normal mb-1 text-[#1F4D3A] dark:text-[#FDFBF7]">No Orders Found</p>
                      <p className="text-sm text-neutral-600 dark:text-white/60">
                        {tab === 'phone'
                          ? "We couldn't find any orders for this mobile number."
                          : "No order matches this invoice number."}
                      </p>
                      <p className="text-xs mt-2 text-neutral-400 dark:text-neutral-500">
                        Please check and try again
                      </p>
                    </motion.div>
                  )}

                  {/* Orders list */}
                  {orders && orders.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
                        </p>
                        <button onClick={clear} className="text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A] hover:text-[#163829] dark:text-[#C8A96B] dark:hover:text-[#E2C98A] cursor-pointer">
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
            >
              {[
                { icon: Phone,    title: 'Mobile Lookup',    desc: 'View all orders placed with your phone number' },
                { icon: FileText, title: 'Invoice Search',   desc: 'Track a specific order using its invoice ID' },
                { icon: Truck,    title: 'Live Status',      desc: 'See real-time status from pending to delivered' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-3xl text-center bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3 bg-[#FDFBF7] dark:bg-[#121212] border border-[#C8A96B]/20 dark:border-white/10">
                    <Icon className="w-4 h-4 text-[#1F4D3A] dark:text-[#C8A96B]" />
                  </div>
                  <p className="font-bold text-sm mb-1 text-[#1F4D3A] dark:text-[#FDFBF7]">{title}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{desc}</p>
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
