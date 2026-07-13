'use client'

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star, ShoppingBag, Check, Leaf,
  ChevronLeft, ChevronRight, Loader2, ZoomIn, Zap,
  MessageSquare, FileText, Send, AlertCircle, CheckCircle2,
  ShieldCheck, ThumbsUp, ArrowLeft, Truck, Package, Award,
  Sparkles, BadgeCheck, Share2, X, Droplets, FlowerIcon as Flower,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { reviewService, type Review, type ReviewStats } from "@/services/reviewService"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { productService } from "@/services/productService"
import type { Product, SizeVariant, ColorVariant } from '@/data/products'
import { resolveStock, getStockStatus, type InventoryRow } from '@/services/inventoryService'
import DOMPurify from 'dompurify'

/* ──────────────────────────────────────────────────────────────── */
/*  Helpers                                                          */
/* ──────────────────────────────────────────────────────────────── */

const resolveImg = (p?: string | null) => {
  if (!p) return '/images/placeholder.jpg'
  if (p.startsWith('http')) return p
  if (p.startsWith('/')) return p
  return `/api${p}`
}

// ── Brand tokens ──
const GRN  = '#1F4D3A'
const GOLD = '#C8A96B'
const CREAM = '#F7F4ED'

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn(s, i <= Math.round(rating) ? 'fill-[#C8A96B] text-[#C8A96B]' : 'text-[#C8A96B]/20 fill-[#C8A96B]/20')} />
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="text-[#1F4D3A]/80 w-4 shrink-0 font-semibold">{label}</span>
      <Star className="w-3 h-3 text-[#C8A96B] fill-[#C8A96B] shrink-0" />
      <div className="flex-1 h-1.5 bg-[#1F4D3A]/15 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${GRN}, ${GOLD})` }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
      </div>
      <span className="text-[#1F4D3A]/75 w-5 text-right font-medium">{count}</span>
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
          <Star className={cn('w-8 h-8 transition-all', i <= (hover || value) ? 'text-[#C8A96B] fill-[#C8A96B] scale-110' : 'text-[#1F4D3A]/20')} />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const initials = review.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#C8A96B]/20 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#F7F4ED] text-sm font-bold shadow-sm"
            style={{ background: `linear-gradient(135deg, ${GRN}, ${GOLD})` }}>
            {initials}
          </div>
          <div>
            <p className="text-[#1F4D3A] text-sm font-semibold">{review.name}</p>
            <p className="text-[#555555] text-[10px] mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRow rating={review.rating} />
          {review.is_verified && (
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3" /> Verified Purchase
            </span>
          )}
        </div>
      </div>
      <p className="text-[#333333] text-sm leading-relaxed">{review.comment}</p>
    </motion.div>
  )
}

function ReviewsSection({ productId }: { productId: number | null }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', rating: 0, comment: '' })

  useEffect(() => {
    if (!productId) return
    setLoadingReviews(true)
    reviewService.getByProduct(productId)
      .then(data => { setReviews(data.reviews); setStats(data.stats) })
      .catch(() => { })
      .finally(() => setLoadingReviews(false))
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.comment.trim() || form.rating < 1) {
      setSubmitState('error')
      setSubmitMessage('Please fill in all fields and select a rating.')
      return
    }
    if (!productId) return
    setSubmitting(true)
    setSubmitState('idle')
    try {
      const res = await reviewService.submit({ ...form, product_id: productId })
      setSubmitState('success')
      setSubmitMessage(res.message || 'Review submitted! Check your email to verify.')
      setForm({ name: '', email: '', rating: 0, comment: '' })
      setFormVisible(false)
    } catch (err: any) {
      setSubmitState('error')
      setSubmitMessage(err?.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const avgDisplay = stats?.average ? stats.average.toFixed(1) : '0.0'
  const totalReviews = stats?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-8 bg-white border border-[#C8A96B]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center sm:border-r sm:border-[#C8A96B]/15 sm:pr-8 shrink-0 gap-2">
          <span className="text-5xl font-serif font-light text-[#1F4D3A]">{avgDisplay}</span>
          <StarRow rating={stats?.average ?? 0} size="md" />
          <span className="text-[#555555] text-xs mt-1 font-medium">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
        </div>
        {totalReviews > 0 && stats ? (
          <div className="flex-1 space-y-2.5 justify-center flex flex-col">
            {[5, 4, 3, 2, 1].map(n => (
              <RatingBar key={n} label={String(n)} count={stats.breakdown[n] ?? 0} total={totalReviews} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
            <Flower className="w-8 h-8 text-[#C8A96B]/40" />
            <p className="text-[#444444] text-sm text-center font-medium">No reviews yet.</p>
            <p className="text-[#666666] text-xs text-center">Be the first to share your experience!</p>
          </div>
        )}
      </div>

      {/* Feedback alerts */}
      <AnimatePresence>
        {submitState === 'success' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex gap-3 items-start bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-700 text-sm font-semibold">Review submitted successfully!</p>
              <p className="text-emerald-600/80 text-xs mt-0.5">{submitMessage}</p>
            </div>
          </motion.div>
        )}
        {submitState === 'error' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{submitMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!productId ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#1F4D3A]" /></div>
      ) : submitState !== 'success' && (
        <button onClick={() => { setFormVisible(v => !v); setSubmitState('idle') }}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer border"
          style={formVisible
            ? { background: 'transparent', color: GRN, borderColor: `${GRN}40` }
            : { background: GRN, color: CREAM, borderColor: GRN }}>
          <MessageSquare className="w-4 h-4" />
          {formVisible ? 'Cancel Review' : 'Write a Review'}
        </button>
      )}

      <AnimatePresence>
        {formVisible && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="bg-white border border-[#C8A96B]/25 rounded-2xl p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="text-[#1F4D3A] font-serif text-lg font-medium">Share Your Experience</h3>
                <p className="text-[#1F4D3A]/70 text-xs mt-1">Your review will appear after email verification.</p>
              </div>
              <div>
                <label className="text-[#333333] text-xs font-semibold uppercase tracking-wider block mb-2">Your Rating *</label>
                <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#333333] text-xs font-semibold uppercase tracking-wider block mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full bg-[#F7F4ED] border border-[#C8A96B]/25 rounded-xl px-4 py-2.5 text-[#1F4D3A] text-sm placeholder-[#888888] focus:outline-none focus:border-[#1F4D3A]/50 transition-all" />
                </div>
                <div>
                  <label className="text-[#333333] text-xs font-semibold uppercase tracking-wider block mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-[#F7F4ED] border border-[#C8A96B]/25 rounded-xl px-4 py-2.5 text-[#1F4D3A] text-sm placeholder-[#888888] focus:outline-none focus:border-[#1F4D3A]/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[#333333] text-xs font-semibold uppercase tracking-wider block mb-1.5">Your Review *</label>
                <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="How did this product transform your skin routine?" rows={4}
                  className="w-full bg-[#F7F4ED] border border-[#C8A96B]/25 rounded-xl px-4 py-2.5 text-[#1F4D3A] text-sm placeholder-[#888888] focus:outline-none focus:border-[#1F4D3A]/50 transition-all resize-none" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[#666666] text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#C8A96B]" /> Verification email will be sent
                </p>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer border"
                  style={{ background: GRN, color: CREAM, borderColor: GRN }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Sending...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingReviews ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#1F4D3A]" /></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-wider">{totalReviews} Verified Review{totalReviews !== 1 ? 's' : ''}</p>
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : submitState !== 'success' && !formVisible && (
        <div className="text-center py-12 border border-dashed border-[#C8A96B]/25 rounded-2xl">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#C8A96B]/40" />
          <p className="text-[#444444] text-sm font-medium">No reviews yet</p>
          <p className="text-[#666666] text-xs mt-1">Be the first to review this product!</p>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── */
/*  Page                                                             */
/* ──────────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Leaf,       label: 'Pure Botanicals',        desc: '100% plant-derived',        color: '#1F4D3A', bg: 'rgba(31,77,58,0.06)',  border: 'rgba(31,77,58,0.12)' },
  { icon: Sparkles,   label: 'Derm. Tested',           desc: 'Safe for all skin types',   color: '#C8A96B', bg: 'rgba(200,169,107,0.08)', border: 'rgba(200,169,107,0.2)' },
  { icon: BadgeCheck, label: 'Cruelty Free',           desc: 'Never tested on animals',   color: '#1F4D3A', bg: 'rgba(31,77,58,0.06)',  border: 'rgba(31,77,58,0.12)' },
  { icon: ShieldCheck,label: 'Paraben & SLS Free',     desc: 'Clean formula promise',     color: '#C8A96B', bg: 'rgba(200,169,107,0.08)', border: 'rgba(200,169,107,0.2)' },
  { icon: Award,      label: 'Sustainably Sourced',    desc: 'Ethical ingredient origin', color: '#1F4D3A', bg: 'rgba(31,77,58,0.06)',  border: 'rgba(31,77,58,0.12)' },
  { icon: Truck,      label: 'Pan India Delivery',     desc: '2–3 business days',         color: '#C8A96B', bg: 'rgba(200,169,107,0.08)', border: 'rgba(200,169,107,0.2)' },
]

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { settings } = useSettings()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [productIdForReviews, setProductIdForReviews] = useState<number | null>(null)

  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedSizeVariant, setSelectedSizeVariant] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [numericProductId, setNumericProductId] = useState<number | null>(null)
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const currency = settings?.currency_symbol || '₹'

  // Lock background scroll when a modal (size guide or image lightbox) is open
  useEffect(() => {
    const shouldLock = showSizeGuide || zoomed
    if (!shouldLock) return
    const scrollY = window.scrollY || window.pageYOffset || 0
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.dataset.lockedScroll = String(scrollY)
    return () => {
      const stored = Number(document.body.dataset.lockedScroll) || 0
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      delete document.body.dataset.lockedScroll
      window.scrollTo(0, stored)
    }
  }, [showSizeGuide, zoomed])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setActiveImg(0)
    setSelectedVariant(0)
    setSelectedSizeVariant(null)
    setSelectedColor(null)
    setQuantity(1)
    setActiveTab('description')
    setProductIdForReviews(null)
    setNumericProductId(null)
    setInventory([])
    setProduct(null)
    setNotFound(false)
    setReviewStats(null)

    productService.getApiBySlug(slug)
      .then(raw => {
        if (cancelled) return
        if (!raw) { setNotFound(true); return }
        setProductIdForReviews(raw.id)
        setNumericProductId(raw.id)
        if (Array.isArray((raw as any).inventory)) {
          setInventory((raw as any).inventory)
        }
        const mapped = productService.mapApiProduct ? productService.mapApiProduct(raw) : {
          id: raw.slug || String(raw.id), name: raw.name, price: raw.price,
          discount_price: raw.discount_price ?? undefined, weight: raw.weight,
          image: raw.image || '/images/placeholder.jpg', gallery: raw.gallery_images ?? undefined,
          category: raw.category, description: raw.description || undefined,
          rating: raw.rating, bestseller: raw.bestseller, variants: raw.variants || undefined,
          sortOrder: raw.sort_order ?? 0,
        }
        const p = mapped as Product
        setProduct(p)
        const ogImg = resolveImg(mapped.image)
        const absImg = ogImg.startsWith('http') ? ogImg : `${window.location.origin}${ogImg}`
        const setMeta = (prop: string, val: string) => {
          let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null
          if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el) }
          el.content = val
        }
        const storeName = (settings as any)?.store_name || 'Aarvia'
        document.title = `${mapped.name} — ${storeName}`
        setMeta('og:title', `${mapped.name} — ${storeName}`)
        setMeta('og:description', mapped.description || `Discover ${mapped.name} at ${storeName}.`)
        setMeta('og:image', absImg)
        setMeta('og:url', window.location.href)
        setMeta('og:type', 'product')
        productService.getPublicProducts().then(all => {
          setRelated(all.filter(x => x.category === mapped.category && x.id !== mapped.id).slice(0, 4))
        }).catch(() => { })
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    if (!productIdForReviews) return
    let cancelled = false
    reviewService.getByProduct(productIdForReviews)
      .then(data => { if (!cancelled) setReviewStats(data.stats) })
      .catch(() => { })
    return () => { cancelled = true }
  }, [productIdForReviews])

  useEffect(() => {
    if (!inventory.length) return
    const norm = (v: string | null | undefined) => (v && v.trim() !== '' ? v.trim() : null)
    const s = selectedSizeVariant !== null ? norm((product?.sizeVariants ?? [])[selectedSizeVariant]?.label) : null
    const c = norm(selectedColor?.color)
    let stock: number | null = null
    for (const r of inventory) {
      const rs = norm(r.size), rc = norm(r.color)
      if (rs === s && rc === c) { stock = r.stock; break }
      if (rs === s && rc === null && c !== null && stock === null) stock = r.stock
      if (rc === c && rs === null && s !== null && stock === null) stock = r.stock
      if (rs === null && rc === null && stock === null) stock = r.stock
    }
    if (stock !== null && stock > 0 && quantity > stock) setQuantity(stock)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, selectedSizeVariant, selectedColor])

  useEffect(() => {
    if (!product) return
    if (product.colorVariants?.length === 1) setSelectedColor(product.colorVariants[0])
    const sv = product.sizeVariants || []
    if (sv.length === 1) setSelectedSizeVariant(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  // ── Loading state ──
  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: CREAM }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: GRN }} />
            <p className="text-sm font-medium" style={{ color: '#4A5568' }}>Loading product…</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // ── Not Found ──
  if (notFound || !product) {
    return (
      <main className="min-h-screen" style={{ background: CREAM }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${GRN}08`, border: `1px solid ${GOLD}30` }}>
            <Leaf className="w-8 h-8" style={{ color: GRN }} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-light mb-2" style={{ color: GRN }}>Product Not Found</h1>
            <p className="text-sm" style={{ color: '#555555' }}>This product may have been removed or is unavailable.</p>
          </div>
          <Link to="/products"
            className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300"
            style={{ background: GRN, color: CREAM }}>
            <ArrowLeft className="w-4 h-4" /> Back to Collections
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  // ── Image gallery logic ──
  const mainImage = product.image || '/images/placeholder.jpg'
  const defaultImages = [mainImage, ...(Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [])]
  const colorImages = selectedColor && selectedColor.images.length > 0 ? selectedColor.images : []
  const galleryImages = colorImages.length > 0 ? [...colorImages, ...defaultImages] : defaultImages

  const variants = product.variants || [{ weight: product.weight, price: product.price }]
  const sizeVariants = product.sizeVariants || []

  // ── Inventory resolution ──
  const _sizeLabel = selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant]?.label ?? null : null
  const _colorLabel = selectedColor?.color ?? null
  const currentStock = resolveStock(inventory, _sizeLabel, _colorLabel)
  const stockStatus = getStockStatus(currentStock)

  const colorRequired = !!(product.colorVariants && product.colorVariants.length > 1 && selectedColor === null)
  const sizeRequired = !!(sizeVariants.length > 1 && selectedSizeVariant === null)

  const maxQty = currentStock !== null && currentStock > 0 ? Math.min(10, currentStock) : 10

  // ── Price resolution ──
  const weightBasePrice = variants[selectedVariant]?.price ?? product.price
  const sizePriceOverride = selectedSizeVariant !== null && sizeVariants[selectedSizeVariant]?.price != null
    ? sizeVariants[selectedSizeVariant].price! : null
  const basePrice = sizePriceOverride ?? weightBasePrice

  const productDiscountPct = (product.discount_price && product.discount_price > 0 && product.discount_price < product.price)
    ? ((product.price - product.discount_price) / product.price) * 100 : 0
  const discountPct = Math.round(productDiscountPct)
  const showDiscount = discountPct > 0
  const currentPrice = showDiscount
    ? (basePrice === product.price ? product.discount_price! : Math.round(basePrice * (1 - productDiscountPct / 100)))
    : basePrice

  const prevImg = () => setActiveImg(i => (i - 1 + galleryImages.length) % galleryImages.length)
  const nextImg = () => setActiveImg(i => (i + 1) % galleryImages.length)

  const doAddToCart = (qty = quantity) => {
    const bp = basePrice
    const salePrice = currentPrice
    const sizeLabel = selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant]?.label ?? '' : ''
    const colorLabel = selectedColor?.color ?? ''
    const cartId = `${product.id}|${variants[selectedVariant].weight}|${sizeLabel}|${colorLabel}`
    const cartImg = (selectedColor && selectedColor.images[0])
      ? (selectedColor.images[0].startsWith('/api') ? selectedColor.images[0] : resolveImg(selectedColor.images[0]))
      : (product.image || '')

    for (let i = 0; i < qty; i++) {
      addItem({
        id: cartId, productId: numericProductId ?? undefined, name: product.name,
        price: salePrice, originalPrice: discountPct > 0 ? bp : undefined,
        discountPercent: discountPct > 0 ? discountPct : undefined,
        weight: variants[selectedVariant].weight, size: sizeLabel || undefined,
        color: colorLabel || undefined, image: cartImg, category: product.category,
        maxStock: currentStock !== null && currentStock > 0 ? currentStock : undefined,
      })
    }
    localDecrementInventory(_sizeLabel, _colorLabel, qty)
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (colorRequired || sizeRequired || stockStatus.disabled) return
    doAddToCart(); setIsAdded(true); setTimeout(() => setIsAdded(false), 2000)
  }
  const handleBuyNow = () => {
    if (colorRequired || sizeRequired || stockStatus.disabled) return
    doAddToCart(); navigate('/checkout')
  }

  const localDecrementInventory = (sizeLabel: string | null, colorLabel: string | null, qty: number) => {
    if (!inventory.length) return
    const norm = (v: string | null | undefined) => (v && v.trim() !== '' ? v.trim() : null)
    const s = norm(sizeLabel), c = norm(colorLabel)
    let targetIdx = -1, priority = 99
    inventory.forEach((r, idx) => {
      const rs = norm(r.size), rc = norm(r.color)
      if (rs === s && rc === c && priority > 1) { targetIdx = idx; priority = 1 }
      else if (rs === s && rc === null && c !== null && priority > 2) { targetIdx = idx; priority = 2 }
      else if (rc === c && rs === null && s !== null && priority > 3) { targetIdx = idx; priority = 3 }
      else if (rs === null && rc === null && priority > 4) { targetIdx = idx; priority = 4 }
    })
    if (targetIdx >= 0) {
      setInventory(prev => prev.map((r, i) => i === targetIdx ? { ...r, stock: Math.max(0, r.stock - qty) } : r))
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const storeName = (settings as any)?.store_name || 'Aarvia'
    const shareData = {
      title: `${product.name} — ${storeName}`,
      text: product.description || `Discover ${product.name} at ${storeName} — Pure botanical beauty.`,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    }
  }

  const tabs = [
    { key: 'description' as const, label: 'Product Details', icon: FileText },
    { key: 'reviews' as const, label: 'Reviews', icon: MessageSquare },
  ]

  return (
    <main className="min-h-screen" style={{ background: CREAM }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-[11px] mb-8 flex-wrap" style={{ color: '#555555' }}>
          <Link to="/" className="hover:text-[#C8A96B] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to="/products" className="hover:text-[#C8A96B] transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to={`/products?category=${product.category}`} className="hover:text-[#C8A96B] transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[180px] font-semibold" style={{ color: GRN }}>{product.name}</span>
          <button onClick={handleShare} aria-label="Share product"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer"
            style={{ background: `${GRN}08`, border: `1px solid ${GOLD}30`, color: '#333333' }}>
            <Share2 className="w-3 h-3" /> Share
          </button>
        </nav>

        {/* ── Main Product Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 lg:items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start flex gap-3 lg:max-w-[520px] w-full">

            {/* Vertical Thumbnail Strip — desktop only */}
            <div className="hidden lg:flex flex-col gap-2.5 w-16 shrink-0 max-h-[540px] overflow-y-auto scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImg(idx)}
                  className={cn(
                    'relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 flex items-center justify-center p-1.5 cursor-pointer bg-white',
                    activeImg === idx ? 'shadow-md' : 'opacity-50 hover:opacity-80'
                  )}
                  style={{ borderColor: activeImg === idx ? GOLD : 'transparent' }}>
                  <img src={resolveImg(img)} alt="" className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 flex flex-col gap-3 w-full">
              <div
                className="relative w-full rounded-3xl overflow-hidden cursor-zoom-in group transition-all duration-300 flex items-center justify-center p-4 bg-white shadow-sm"
                style={{ maxHeight: '560px', aspectRatio: '1/1', border: `1px solid ${GOLD}20` }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${selectedColor?.color ?? 'default'}-${activeImg}`}
                    src={resolveImg(galleryImages[activeImg])}
                    alt={`${product.name} - image ${activeImg + 1}`}
                    className="w-full h-full object-contain select-none"
                    style={{
                      transformOrigin: isHovered ? `${mousePos.x}% ${mousePos.y}%` : 'center center',
                      transform: isHovered ? 'scale(2.2)' : 'scale(1)',
                      transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                    }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

                {/* Nav arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prevImg() }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-sm"
                      style={{ background: `${GRN}90`, color: CREAM }}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); nextImg() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-sm"
                      style={{ background: `${GRN}90`, color: CREAM }}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Zoom button */}
                <button type="button" onClick={(e) => { e.stopPropagation(); setZoomed(true) }}
                  className="absolute bottom-3 right-3 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer z-10 hover:scale-105 shadow-sm"
                  style={{ background: `${GRN}15`, border: `1px solid ${GOLD}30`, color: GRN }}
                  aria-label="Zoom image">
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Discount badge */}
                {showDiscount && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}40` }}>
                    -{discountPct}% OFF
                  </div>
                )}
                {/* Bestseller badge */}
                {product.bestseller && (
                  <div className={cn('absolute top-4 z-20 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase', showDiscount ? 'right-4' : 'left-4')}
                    style={{ background: GRN, color: CREAM }}>
                    Trending
                  </div>
                )}
                {/* OOS overlay */}
                {currentStock === 0 && (
                  <div className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center z-20"
                    style={{ background: 'rgba(247,244,237,0.75)' }}>
                    <span className="px-5 py-2.5 font-semibold text-sm rounded-full shadow-lg"
                      style={{ background: '#dc2626', color: 'white', border: '1px solid rgba(220,38,38,0.3)' }}>
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile thumbnail strip */}
              {galleryImages.length > 1 && (
                <div className="flex lg:hidden gap-2 overflow-x-auto scrollbar-none pb-1">
                  {galleryImages.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImg(idx)}
                      className={cn(
                        'shrink-0 w-14 aspect-square rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center p-1 bg-white cursor-pointer',
                        activeImg === idx ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                      )}
                      style={{ borderColor: activeImg === idx ? GOLD : 'transparent' }}>
                      <img src={resolveImg(img)} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-5">

            {/* Brand label + product name */}
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] w-fit"
                style={{ background: `${GRN}08`, color: GRN, border: `1px solid ${GRN}20` }}>
                <Leaf className="w-2.5 h-2.5" /> Aarvia Pure Botanicals
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-serif font-light leading-tight tracking-tight"
                style={{ color: GRN }}>{product.name}</h1>
            </div>

            {/* Rating chip */}
            {(() => {
              const count = reviewStats?.total ?? 0
              if (count === 0) return null
              const avg = reviewStats?.average ?? 0
              const displayRating = avg > 0 ? avg : (product.rating ?? 0)
              return (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs w-fit cursor-pointer transition-all hover:shadow-sm"
                  style={{ background: `${GRN}06`, border: `1px solid ${GOLD}30`, color: GRN }}
                  onClick={() => setActiveTab('reviews')}>
                  <div className="flex items-center gap-1" style={{ color: GOLD }}>
                    <span className="font-semibold">{displayRating > 0 ? displayRating.toFixed(1) : '4.9'}</span>
                    <Star className="w-3.5 h-3.5 fill-[#C8A96B]" />
                  </div>
                  <span style={{ color: `${GRN}30` }}>|</span>
                  <span className="font-medium" style={{ color: '#555555' }}>{count} verified review{count !== 1 ? 's' : ''}</span>
                </div>
              )
            })()}

            {/* Price block */}
            <div className="py-4 border-t border-b" style={{ borderColor: `${GOLD}20` }}>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-3xl md:text-4xl font-serif font-medium leading-none" style={{ color: GRN }}>
                  {currency}{currentPrice.toLocaleString('en-IN')}
                </span>
                {showDiscount && (
                  <>
                    <span className="text-lg line-through" style={{ color: '#888888' }}>
                      {currency}{basePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}35`, color: GRN }}>
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest mt-2 font-semibold" style={{ color: '#777777' }}>
                inclusive of all taxes
              </p>
            </div>

            {/* Color Variants */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#444444' }}>
                  Shade: <span className="normal-case font-bold" style={{ color: GOLD }}>
                    {selectedColor ? selectedColor.color : 'Select a shade'}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {product.colorVariants.map((cv) => {
                    const cStock = inventory.length > 0 ? resolveStock(inventory, _sizeLabel, cv.color) : null
                    const cDisabled = cStock !== null && cStock === 0
                    return (
                      <button key={cv.color} title={cDisabled ? `${cv.color} — Out of Stock` : cv.color}
                        onClick={() => { if (!cDisabled) { setSelectedColor(cv); setActiveImg(0) } }}
                        disabled={cDisabled}
                        className={cn(
                          'w-9 h-9 rounded-full border-2 transition-all duration-300 cursor-pointer',
                          cDisabled ? 'opacity-20 cursor-not-allowed' : ''
                        )}
                        style={{
                          background: cv.hex,
                          borderColor: selectedColor?.color === cv.color ? GOLD : `${GRN}20`,
                          boxShadow: selectedColor?.color === cv.color ? `0 0 0 3px ${GOLD}25, 0 2px 8px ${GOLD}30` : 'none',
                          transform: selectedColor?.color === cv.color ? 'scale(1.1)' : 'scale(1)',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {sizeVariants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#444444' }}>
                    Size / Volume: <span className="normal-case font-bold" style={{ color: GOLD }}>
                      {selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant].label : 'Not selected'}
                    </span>
                  </p>
                  <button onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] font-medium cursor-pointer underline underline-offset-2 transition-colors"
                    style={{ color: GOLD }}>
                    Volume Guide
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sizeVariants.map((sv, idx) => {
                    const sStock = inventory.length > 0 ? resolveStock(inventory, sv.label, _colorLabel) : null
                    const sDisabled = sStock !== null && sStock === 0
                    return (
                      <button key={sv.label}
                        title={sDisabled ? `${sv.label} — Out of Stock` : sv.label}
                        onClick={() => { if (!sDisabled) setSelectedSizeVariant(idx) }}
                        disabled={sDisabled}
                        className={cn('h-10 min-w-[52px] px-4 rounded-full border-2 transition-all text-xs font-semibold cursor-pointer', sDisabled ? 'opacity-25 cursor-not-allowed line-through' : '')}
                        style={{
                          borderColor: selectedSizeVariant === idx ? GRN : `${GOLD}30`,
                          background: selectedSizeVariant === idx ? GRN : 'transparent',
                          color: selectedSizeVariant === idx ? CREAM : GRN,
                        }}>
                        {sv.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Weight variants — only if no size variants */}
            {sizeVariants.length === 0 && variants.length > 1 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#444444' }}>Pack Size</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => (
                    <button key={v.weight} onClick={() => setSelectedVariant(idx)}
                      className="h-10 px-5 rounded-full border-2 transition-all text-xs font-semibold cursor-pointer"
                      style={{
                        borderColor: selectedVariant === idx ? GRN : `${GOLD}30`,
                        background: selectedVariant === idx ? GRN : 'transparent',
                        color: selectedVariant === idx ? CREAM : GRN,
                      }}>
                      {v.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status alerts */}
            {colorRequired ? (
              <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3"
                style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25`, color: GRN }}>
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                <span className="font-medium text-xs">Please select a shade to check availability</span>
              </div>
            ) : sizeRequired ? (
              <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3"
                style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25`, color: GRN }}>
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                <span className="font-medium text-xs">Please select a size to check availability</span>
              </div>
            ) : currentStock !== null && currentStock > 0 && currentStock <= 5 ? (
              <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                Only {currentStock} left — order soon!
              </p>
            ) : currentStock === 0 ? (
              <div className="inline-flex items-center gap-2 text-xs rounded-xl px-4 py-2.5 font-bold"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#dc2626' }}>
                <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
              </div>
            ) : null}

            {/* Quantity + CTA */}
            <div className="space-y-4 pt-2">
              {/* Qty stepper */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider w-10" style={{ color: '#555555' }}>Qty</span>
                <div className="flex items-center rounded-full overflow-hidden border"
                  style={{ background: 'white', borderColor: `${GOLD}25` }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center transition-colors text-lg leading-none cursor-pointer"
                    style={{ color: '#444444' }}>−</button>
                  <span className="w-9 text-center font-semibold text-sm select-none" style={{ color: GRN }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={currentStock !== null && quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center transition-colors text-lg leading-none disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    style={{ color: '#444444' }}>+</button>
                </div>
                {quantity > 1 && (
                  <span className="text-xs font-medium" style={{ color: '#555555' }}>
                    = {currency}{(currentPrice * quantity).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: (stockStatus.disabled || colorRequired || sizeRequired) ? 1 : 0.97 }}
                  onClick={handleAddToCart}
                  disabled={isAdded || stockStatus.disabled || colorRequired || sizeRequired}
                  className={cn('flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 border-2 cursor-pointer')}
                  style={(stockStatus.disabled || colorRequired || sizeRequired)
                    ? { background: `${GRN}08`, borderColor: `${GRN}20`, color: '#888888', cursor: 'not-allowed' }
                    : isAdded
                      ? { background: '#16a34a', borderColor: '#16a34a', color: 'white' }
                      : { background: GRN, borderColor: GRN, color: CREAM }}>
                  {stockStatus.disabled ? 'Out of Stock'
                    : colorRequired ? 'Select Shade'
                      : sizeRequired ? 'Select Size'
                        : isAdded ? <><Check className="w-4 h-4" /> Added to Bag!</>
                          : <><ShoppingBag className="w-4 h-4" /> Add to Bag</>}
                </motion.button>
                <motion.button
                  whileTap={{ scale: (stockStatus.disabled || colorRequired || sizeRequired) ? 1 : 0.97 }}
                  onClick={handleBuyNow}
                  disabled={stockStatus.disabled || colorRequired || sizeRequired}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 border-2 cursor-pointer"
                  style={(stockStatus.disabled || colorRequired || sizeRequired)
                    ? { borderColor: `${GRN}20`, color: '#999999', cursor: 'not-allowed' }
                    : { borderColor: GRN, color: GRN, background: 'transparent' }}>
                  <Zap className="w-4 h-4" style={{ color: GOLD }} /> Buy Now
                </motion.button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Feature Pillars ── */}
        <div className="mt-14 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 px-1 border-t border-b" style={{ borderColor: `${GOLD}20` }}>
            {[
              { icon: Truck,       color: GRN,  title: 'Express Delivery',       desc: 'Pan India in 2–3 business days' },
              { icon: ShieldCheck, color: GOLD, title: 'Authenticity Guaranteed', desc: '100% genuine Aarvia formulation' },
              { icon: Droplets,    color: GRN,  title: 'Gentle Formulation',      desc: 'Safe for sensitive & all skin types' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4 px-3 py-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: GRN }}>{item.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#555555' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURES.map(f => (
              <div key={f.label}
                className="flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${f.color}12` }}>
                  <f.icon className="w-4 h-4" style={{ color: f.color }} />
                </div>
                <span className="text-[9px] font-bold leading-tight tracking-wide uppercase" style={{ color: f.color }}>{f.label}</span>
                <span className="text-[9px] leading-tight" style={{ color: '#555555' }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs: Description & Reviews ── */}
        <div className="mt-14">
          <div className="flex gap-0 border-b" style={{ borderColor: `${GOLD}20` }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn('flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px cursor-pointer')}
                style={{
                  color: activeTab === tab.key ? GRN : '#777777',
                  borderColor: activeTab === tab.key ? GRN : 'transparent',
                }}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'reviews' && reviewStats && reviewStats.total > 0 && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full"
                    style={{ background: `${GRN}10`, color: GRN }}>
                    {reviewStats.total}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="desc"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }} className="py-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* About this Product */}
                  {product.description && (
                    <div className="md:col-span-2 bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: `${GOLD}20` }}>
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: GOLD }}>
                        <FileText className="w-3.5 h-3.5" /> About this Product
                      </h3>
                      <div className="text-sm leading-relaxed" style={{ color: '#333333' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
                    </div>
                  )}

                  {/* How to Use */}
                  <div className="bg-white border rounded-2xl p-5 shadow-sm" style={{ borderColor: `${GOLD}20` }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: GOLD }}>
                      <Sparkles className="w-3.5 h-3.5" /> How to Use
                    </p>
                    <ol className="space-y-2 text-xs leading-relaxed" style={{ color: '#444444' }}>
                      <li className="flex gap-2"><span className="font-bold shrink-0" style={{ color: GOLD }}>01</span> Cleanse your face with a gentle cleanser and pat dry.</li>
                      <li className="flex gap-2"><span className="font-bold shrink-0" style={{ color: GOLD }}>02</span> Apply a small amount to fingertips and warm between palms.</li>
                      <li className="flex gap-2"><span className="font-bold shrink-0" style={{ color: GOLD }}>03</span> Gently press and massage onto face and neck in upward strokes.</li>
                      <li className="flex gap-2"><span className="font-bold shrink-0" style={{ color: GOLD }}>04</span> Use morning and evening for best results. Follow with SPF in AM.</li>
                    </ol>
                  </div>

                  {/* Why Aarvia? */}
                  <div className="bg-white border rounded-2xl p-5 shadow-sm" style={{ borderColor: `${GOLD}20` }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: GOLD }}>
                      <Award className="w-3.5 h-3.5" /> The Aarvia Difference
                    </p>
                    <ul className="space-y-2 text-xs leading-relaxed" style={{ color: '#444444' }}>
                      <li className="flex gap-2"><span style={{ color: GOLD }}>✦</span> Cold-pressed, unrefined botanical actives at premium concentrations</li>
                      <li className="flex gap-2"><span style={{ color: GOLD }}>✦</span> Zero fillers — every ingredient serves a skin-wellness purpose</li>
                      <li className="flex gap-2"><span style={{ color: GOLD }}>✦</span> Dermatologically tested, pH-balanced formulation</li>
                      <li className="flex gap-2"><span style={{ color: GOLD }}>✦</span> Sustainable, eco-conscious packaging — refill-friendly</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }} className="py-8 max-w-3xl">
                <ReviewsSection productId={productIdForReviews} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t" style={{ borderColor: `${GOLD}20` }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>You May Also Love</p>
                <h2 className="text-2xl font-serif font-light" style={{ color: GRN }}>
                  More from <span className="capitalize italic">{product.category}</span>
                </h2>
              </div>
              <Link to={`/products?category=${product.category}`}
                className="text-xs font-semibold transition-colors px-5 py-2 rounded-full border"
                style={{ color: GRN, borderColor: `${GOLD}30` }}>
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}

      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {zoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
            style={{ background: 'rgba(31,77,58,0.92)' }}
            onClick={() => setZoomed(false)}>
            <motion.img initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              src={resolveImg(galleryImages[activeImg])}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-2xl"
              onClick={e => e.stopPropagation()} />
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: 'rgba(247,244,237,0.15)', color: CREAM }}
              onClick={() => setZoomed(false)}>
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Volume Guide Modal ── */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            style={{ background: 'rgba(31,77,58,0.70)' }}
            onClick={() => setShowSizeGuide(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl p-6 max-w-xl max-h-[90vh] overflow-y-auto w-full shadow-2xl"
              style={{ background: CREAM, border: `1px solid ${GOLD}25` }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Reference Guide</p>
                  <h2 className="text-xl font-serif font-light flex items-center gap-2" style={{ color: GRN }}>
                    <Package className="w-5 h-5" style={{ color: GOLD }} /> Volume & Usage Guide
                  </h2>
                </div>
                <button onClick={() => setShowSizeGuide(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{ background: `${GRN}08`, color: GRN }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Volume Chart */}
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: `${GOLD}20` }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: `${GRN}06`, borderBottom: `1px solid ${GOLD}20` }}>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: GRN }}>Size</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: GRN }}>Volume</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: GRN }}>Daily Uses</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: GRN }}>Lasts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'Mini (Travel)', volume: '15 ml', uses: '2–3 drops/use', lasts: '~2 Weeks' },
                        { size: 'Standard',      volume: '30 ml', uses: '2–3 drops/use', lasts: '~1 Month' },
                        { size: 'Regular',       volume: '50 ml', uses: '2–3 drops/use', lasts: '~6 Weeks' },
                        { size: 'Value Pack',    volume: '100 ml', uses: '2–3 drops/use', lasts: '~3 Months' },
                      ].map((row, i) => (
                        <tr key={row.size} style={{ borderBottom: i < 3 ? `1px solid ${GOLD}12` : 'none' }}>
                          <td className="px-4 py-3 font-medium text-sm" style={{ color: GRN }}>{row.size}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#444444' }}>{row.volume}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#444444' }}>{row.uses}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#444444' }}>{row.lasts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Storage details */}
                <div className="rounded-xl p-4 space-y-2" style={{ background: `${GRN}06`, border: `1px solid ${GRN}12` }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: GRN }}>🌿 Storage & Shelf Life</p>
                  <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: '#444444' }}>
                    <li>• Store in a cool, dry place away from direct sunlight and heat</li>
                    <li>• Keep tightly sealed after every use to preserve potency</li>
                    <li>• Best used within 12 months of opening</li>
                    <li>• Refrigeration recommended for serums with Vitamin C or Retinol</li>
                  </ul>
                </div>

                {/* Tip */}
                <div className="rounded-xl p-4 space-y-1.5" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: GRN }}>✦ Pro Tip</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#444444' }}>
                    For optimal absorption, apply on freshly cleansed, slightly damp skin. Layer thinnest to thickest consistency and always finish with SPF during the day.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
