'use client'

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star, ShoppingBag, Check, Leaf,
  ChevronLeft, ChevronRight, Loader2, ZoomIn, Zap,
  MessageSquare, FileText, Send, AlertCircle, CheckCircle2,
  ShieldCheck, ThumbsUp, ArrowLeft, Truck, Package, Award,
  FlameKindling, Sparkles, BadgeCheck, Share2,
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

/* ──────────────────────────────────────────────────────────────── */
/*  Helpers                                                          */
/* ──────────────────────────────────────────────────────────────── */

const resolveImg = (p?: string | null) => {
  if (!p) return '/images/placeholder.jpg'
  if (p.startsWith('http')) return p
  if (p.startsWith('/')) return p
  return `/api${p}`
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn(s, i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700 fill-gray-800')} />
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-4 shrink-0">{label}</span>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div className="h-full bg-amber-400 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
      </div>
      <span className="text-gray-500 w-5 text-right">{count}</span>
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
          <Star className={cn('w-8 h-8 transition-all', i <= (hover || value) ? 'text-amber-400 fill-amber-400 scale-110' : 'text-gray-600')} />
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
      className="bg-[#111] border border-gray-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-black">
            {initials}
          </div>
          <div>
            <p className="text-white text-sm font-bold">{review.name}</p>
            <p className="text-gray-600 text-[10px]">{date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRow rating={review.rating} />
          {review.is_verified && (
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
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
      .catch(() => {})
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
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-8 bg-[#111] border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center sm:border-r sm:border-gray-800 sm:pr-8 shrink-0">
          <span className="text-6xl font-black text-amber-400">{avgDisplay}</span>
          <StarRow rating={stats?.average ?? 0} size="md" />
          <span className="text-gray-500 text-xs mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
        </div>
        {totalReviews > 0 && stats ? (
          <div className="flex-1 space-y-2.5 justify-center flex flex-col">
            {[5,4,3,2,1].map(n => (
              <RatingBar key={n} label={String(n)} count={stats.breakdown[n] ?? 0} total={totalReviews} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
            <p className="text-gray-500 text-sm text-center">No reviews yet.</p>
            <p className="text-gray-600 text-xs text-center">Be the first to share your experience!</p>
          </div>
        )}
      </div>

      {/* Submit feedback */}
      <AnimatePresence>
        {submitState === 'success' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex gap-3 items-start bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-300 text-sm font-bold">Review submitted!</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">{submitMessage}</p>
            </div>
          </motion.div>
        )}
        {submitState === 'error' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex gap-3 items-start bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{submitMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!productId ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-amber-500 animate-spin" /></div>
      ) : submitState !== 'success' && (
        <button onClick={() => { setFormVisible(v => !v); setSubmitState('idle') }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-xl transition-all">
          <MessageSquare className="w-4 h-4" />
          {formVisible ? 'Cancel' : 'Write a Review'}
        </button>
      )}

      <AnimatePresence>
        {formVisible && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handleSubmit} className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-white font-black text-base">Share Your Experience</h3>
                <p className="text-gray-500 text-xs mt-1">Requires email verification before appearing.</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Your Rating *</label>
                <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full bg-white/4 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-white/4 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Review *</label>
                <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Tell us about your experience..." rows={4}
                  className="w-full bg-white/4 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all resize-none" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-gray-600 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-500/60" /> Verification email will be sent
                </p>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-sm rounded-xl transition-all">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Sending...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingReviews ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-amber-500 animate-spin" /></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{totalReviews} Verified Review{totalReviews !== 1 ? 's' : ''}</p>
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : submitState !== 'success' && !formVisible && (
        <div className="text-center py-10 border border-dashed border-gray-800 rounded-2xl">
          <ThumbsUp className="w-8 h-8 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-500 text-sm font-bold">No reviews yet</p>
          <p className="text-gray-700 text-xs mt-1">Be the first to review this product!</p>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────── */
/*  Page                                                             */
/* ──────────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Leaf,         label: 'Premium Fabric',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Sparkles,     label: 'Trendy Designs',     color: 'text-purple-400',  bg: 'bg-purple-500/10  border-purple-500/20'  },
  { icon: BadgeCheck,   label: 'Authentic Brand',    color: 'text-sky-400',     bg: 'bg-sky-500/10     border-sky-500/20'     },
  { icon: Award,        label: 'Premium Quality',    color: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20'   },
  { icon: FlameKindling,label: 'Style Crafted',      color: 'text-orange-400',  bg: 'bg-orange-500/10  border-orange-500/20'  },
  { icon: Truck,        label: 'Pan India Delivery', color: 'text-rose-400',    bg: 'bg-rose-500/10    border-rose-500/20'    },
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

  const currency = settings?.currency_symbol || '\u20b9'

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
        // Set OG meta tags for social sharing
        const ogImg = resolveImg(mapped.image)
        const absImg = ogImg.startsWith('http') ? ogImg : `${window.location.origin}${ogImg}`
        const setMeta = (prop: string, val: string) => {
          let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null
          if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el) }
          el.content = val
        }
        const storeName = (settings as any)?.store_name || 'UNIKQ Label'
        document.title = `${mapped.name} — ${storeName}`
        setMeta('og:title', `${mapped.name} — ${storeName}`)
        setMeta('og:description', mapped.description || `Shop ${mapped.name} at ${storeName}.`)
        setMeta('og:image', absImg)
        setMeta('og:url', window.location.href)
        setMeta('og:type', 'product')
        productService.getPublicProducts().then(all => {
          setRelated(all.filter(x => x.category === mapped.category && x.id !== mapped.id).slice(0, 4))
        }).catch(() => {})
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
      .catch(() => {})
    return () => { cancelled = true }
  }, [productIdForReviews])

  // Auto-clamp quantity whenever the selected variant changes and the known
  // stock drops below the current quantity (e.g. user switches from a well-
  // stocked colour to one with only 1 unit left).
  // NOTE: we use a plain effect that depends on inventory rows + selections.
  // currentStock is computed below the guard returns so we replicate the
  // resolution inline here to avoid the "used before declaration" error.
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <p className="text-5xl">🥺</p>
          <h1 className="text-2xl font-bold text-white">Product not found</h1>
          <Link to="/products" className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-[#0f0f0f] font-bold rounded-full hover:bg-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const mainImage = product.image || '/images/placeholder.jpg'
  // Default images: main product image + all gallery images
  const defaultImages = [
    mainImage,
    ...(Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : []),
  ]
  // Color variant images merged with default gallery (color images first)
  const colorImages = selectedColor && selectedColor.images.length > 0
    ? selectedColor.images
    : []
  const galleryImages = colorImages.length > 0
    ? [...colorImages, ...defaultImages]
    : defaultImages

  const variants     = product.variants || [{ weight: product.weight, price: product.price }]
  const sizeVariants = product.sizeVariants || []

  // Inventory stock resolution
  const _sizeLabel = selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant]?.label ?? null : null
  const _colorLabel = selectedColor?.color ?? null
  const currentStock = resolveStock(inventory, _sizeLabel, _colorLabel)
  const stockStatus = getStockStatus(currentStock)

  // True when the product has colour variants with inventory configured but
  // the user has not yet picked a colour — we must require a selection so we
  // always know which variant's stock to enforce.
  const colorRequired = !!(
    product.colorVariants && product.colorVariants.length > 0 &&
    selectedColor === null &&
    inventory.length > 0
  )

  // True when the product has size variants with inventory configured but
  // the user has not yet picked a size — we must require a selection so we
  // always know which variant's stock to enforce.
  const sizeRequired = !!(
    sizeVariants.length > 0 &&
    selectedSizeVariant === null &&
    inventory.length > 0
  )

  // Maximum order quantity: capped by known stock (and hard limit of 10)
  const maxQty = currentStock !== null && currentStock > 0
    ? Math.min(10, currentStock)
    : 10

  // Price resolution: size variant price > base weight-variant price > product.price
  const weightBasePrice = variants[selectedVariant]?.price ?? product.price
  const sizePriceOverride = selectedSizeVariant !== null && sizeVariants[selectedSizeVariant]?.price != null
    ? sizeVariants[selectedSizeVariant].price!
    : null
  const basePrice = sizePriceOverride ?? weightBasePrice

  const discountPct  = product.discount_price && product.discount_price > 0 && product.discount_price <= 100 ? Math.round(product.discount_price) : 0
  const showDiscount = discountPct > 0
  const currentPrice = showDiscount ? Math.round(basePrice * (100 - discountPct) / 100) : basePrice

  const prevImg = () => setActiveImg(i => (i - 1 + galleryImages.length) % galleryImages.length)
  const nextImg = () => setActiveImg(i => (i + 1) % galleryImages.length)

  const doAddToCart = (qty = quantity) => {
    const discountPct = product.discount_price && product.discount_price > 0 && product.discount_price <= 100 ? Math.round(product.discount_price) : 0
    const weightBasePrice = variants[selectedVariant]?.price ?? product.price
    const sizePriceOverride = selectedSizeVariant !== null && sizeVariants[selectedSizeVariant]?.price != null
      ? sizeVariants[selectedSizeVariant].price!
      : null
    const bp = sizePriceOverride ?? weightBasePrice
    const salePrice = discountPct > 0 ? Math.round(bp * (100 - discountPct) / 100) : bp

    // Cart item ID: productSlug|weight|size|color — same format as product-card so
    // adding from either surface merges into one cart entry instead of duplicating
    const sizeLabel = selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant]?.label ?? '' : ''
    const colorLabel = selectedColor?.color ?? ''
    const cartId = `${product.id}|${variants[selectedVariant].weight}|${sizeLabel}|${colorLabel}`
    const cartImg = (selectedColor && selectedColor.images[0])
      ? (selectedColor.images[0].startsWith('/api') ? selectedColor.images[0] : resolveImg(selectedColor.images[0]))
      : (product.image || '')

    for (let i = 0; i < qty; i++) {
      addItem({
        id: cartId,
        productId: numericProductId ?? undefined,
        name: product.name,
        price: salePrice,
        originalPrice: discountPct > 0 ? bp : undefined,
        discountPercent: discountPct > 0 ? discountPct : undefined,
        weight: variants[selectedVariant].weight,
        size: sizeLabel || undefined,
        color: colorLabel || undefined,
        image: cartImg,
        category: product.category,
        // Pass known stock cap so cart sidebar / checkout can enforce it
        maxStock: currentStock !== null && currentStock > 0 ? currentStock : undefined,
      })
    }
    // Optimistically update local inventory so the badge is immediately accurate
    localDecrementInventory(_sizeLabel, _colorLabel, qty)
    // Reset quantity to 1 after adding
    setQuantity(1)
  }

  const handleAddToCart = () => { doAddToCart(); setIsAdded(true); setTimeout(() => setIsAdded(false), 2000) }
  const handleBuyNow    = () => { doAddToCart(); navigate('/checkout') }

  // After adding to cart, optimistically decrement the local inventory so the
  // stock badge and quantity cap update instantly without a page reload.
  const localDecrementInventory = (sizeLabel: string | null, colorLabel: string | null, qty: number) => {
    if (!inventory.length) return
    const norm = (v: string | null | undefined) => (v && v.trim() !== '' ? v.trim() : null)
    const s = norm(sizeLabel), c = norm(colorLabel)
    let targetIdx = -1, priority = 99
    inventory.forEach((r, idx) => {
      const rs = norm(r.size), rc = norm(r.color)
      if (rs === s && rc === c             && priority > 1) { targetIdx = idx; priority = 1 }
      else if (rs === s && rc === null && c !== null && priority > 2) { targetIdx = idx; priority = 2 }
      else if (rc === c && rs === null && s !== null && priority > 3) { targetIdx = idx; priority = 3 }
      else if (rs === null && rc === null              && priority > 4) { targetIdx = idx; priority = 4 }
    })
    if (targetIdx >= 0) {
      setInventory(prev => prev.map((r, i) =>
        i === targetIdx ? { ...r, stock: Math.max(0, r.stock - qty) } : r
      ))
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: `${product.name} — Lakshmi Home Foods`,
      text: product.description || `Check out ${product.name} from Lakshmi Home Foods!`,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    }
  }

  const tabs = [
    { key: 'description' as const, label: 'Description', icon: FileText },
    { key: 'reviews'     as const, label: 'Reviews',     icon: MessageSquare },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-white/25 mb-6 flex-wrap">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to="/products" className="hover:text-amber-400 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to={`/products?category=${product.category}`} className="hover:text-amber-400 transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-white/50 truncate max-w-50">{product.name}</span>
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 hover:bg-amber-500/10 border border-white/8 hover:border-amber-500/20 text-white/35 hover:text-amber-400 transition-all text-[10px] font-semibold shrink-0"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
        </nav>


        {/* ── Main Product Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[550px_500px] gap-5 lg:items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:sticky lg:top-22 lg:self-start flex gap-3 lg:max-w-130">

            {/* Vertical Thumbnail Strip — desktop only */}
            <div className="hidden lg:flex flex-col gap-2 w-14 shrink-0 max-h-140 overflow-y-auto scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={cn(
                    'relative w-full aspect-2/3 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0',
                    activeImg === idx
                      ? 'border-amber-500 opacity-100'
                      : 'border-transparent opacity-40 hover:opacity-70 hover:border-white/15',
                  )}
                >
                  <img src={resolveImg(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>

            {/* Main Image + mobile strip */}
            <div className="flex-1 flex flex-col gap-2.5">
              <div
                className="relative w-full rounded-2xl overflow-hidden bg-[#111] cursor-zoom-in group" style={{ maxHeight: '560px', aspectRatio: '3/4' }}
                onClick={() => setZoomed(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${selectedColor?.color ?? 'default'}-${activeImg}`}
                    src={resolveImg(galleryImages[activeImg])}
                    alt={`${product.name} - image ${activeImg + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

                {/* Nav arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); prevImg() }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); nextImg() }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>

                {/* Badges */}
                {showDiscount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg">
                    -{discountPct}% OFF
                  </div>
                )}
                {product.bestseller && (
                  <div className={cn('absolute top-3 bg-amber-500 text-black text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg', showDiscount ? 'right-3' : 'left-3')}>
                    ⭐ Bestseller
                  </div>
                )}

                {/* OOS overlay */}
                {currentStock === 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-5 py-2.5 bg-red-600/90 text-white font-black text-sm rounded-full shadow-xl tracking-wide">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile thumbnail strip */}
              {galleryImages.length > 1 && (
                <div className="flex lg:hidden gap-2 overflow-x-auto scrollbar-none pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={cn(
                        'shrink-0 w-12 aspect-2/3 rounded-lg overflow-hidden border-2 transition-all',
                        activeImg === idx ? 'border-amber-500' : 'border-transparent opacity-40 hover:opacity-70',
                      )}
                    >
                      <img src={resolveImg(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info Panel */}
          <div className="lg:sticky lg:top-22 lg:self-start flex flex-col gap-2.5">

            {/* Brand label + name */}
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em] mb-2">UNIKQ Label</p>
              <h1 className="text-2xl md:text-[27px] font-bold text-white leading-snug">{product.name}</h1>
            </div>

            {/* Rating chip */}
            <div className="flex items-center gap-2">
              {(() => {
                const avg = reviewStats?.average ?? 0
                const count = reviewStats?.total ?? 0
                const displayRating = avg > 0 ? avg : (product.rating ?? 0)
                return (
                  <>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-600/80 rounded text-white text-xs font-bold">
                      <span>{displayRating > 0 ? displayRating.toFixed(1) : '4.0'}</span>
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                    <span className="text-white/15 text-xs">|</span>
                    <span className="text-white/35 text-xs">{count} Review{count !== 1 ? 's' : ''}</span>
                  </>
                )
              })()}
            </div>

            {/* Price block */}
            <div className="border-t border-b border-white/6 py-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-bold text-white leading-none">{currency}{currentPrice.toLocaleString('en-IN')}</span>
                {showDiscount && (
                  <>
                    <span className="text-base text-white/25 line-through">{currency}{basePrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-bold text-green-400">({discountPct}% OFF)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-white/25 mt-1.5">inclusive of all taxes</p>
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-sm text-white/45 leading-relaxed border-l-2 border-amber-500/25 pl-3.5">
                {product.description.slice(0, 160)}{product.description.length > 160 ? '…' : ''}
              </p>
            )}

            {/* Color Variants */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-2">
                  Colour: <span className="text-amber-400 normal-case font-bold">{selectedColor ? selectedColor.color : 'Default'}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Default swatch */}
                  <button
                    title="Default"
                    onClick={() => { setSelectedColor(null); setActiveImg(0) }}
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center',
                      selectedColor === null
                        ? 'border-amber-500 ring-2 ring-amber-500/30 ring-offset-1 ring-offset-[#0a0a0a]'
                        : 'border-white/12 hover:border-white/30'
                    )}
                  >
                    <span className="w-3 h-3 rounded-full bg-linear-to-br from-white/10 to-white/5 border border-white/10" />
                  </button>
                  {product.colorVariants.map((cv) => {
                    const cStock = inventory.length > 0 ? resolveStock(inventory, _sizeLabel, cv.color) : null
                    const cDisabled = cStock !== null && cStock === 0
                    return (
                      <button
                        key={cv.color}
                        title={cDisabled ? `${cv.color} — Out of Stock` : cv.color}
                        onClick={() => { if (!cDisabled) { setSelectedColor(cv); setActiveImg(0) } }}
                        disabled={cDisabled}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 transition-all',
                          cDisabled
                            ? 'opacity-20 cursor-not-allowed border-gray-700'
                            : selectedColor?.color === cv.color
                              ? 'border-amber-500 ring-2 ring-amber-500/30 ring-offset-1 ring-offset-[#0a0a0a] scale-110'
                              : 'border-white/12 hover:border-white/35 hover:scale-105'
                        )}
                        style={{ background: cv.hex }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {sizeVariants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">
                    Size: <span className="text-amber-400 normal-case font-bold">
                      {selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant].label : 'Not selected'}
                    </span>
                  </p>
                  <button className="text-[11px] text-amber-500/50 hover:text-amber-400 transition-colors underline underline-offset-2">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Clear selection */}
                  <button
                    title="Clear size selection"
                    onClick={() => setSelectedSizeVariant(null)}
                    className={cn(
                      'w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center',
                      selectedSizeVariant === null
                        ? 'border-amber-500 bg-amber-500/8 text-amber-400'
                        : 'border-white/8 text-white/25 hover:border-white/20 hover:text-white/45'
                    )}
                  >
                    <span className="w-3 h-3 rounded-full border border-current opacity-50" />
                  </button>
                  {sizeVariants.map((sv, idx) => {
                    const sStock = inventory.length > 0 ? resolveStock(inventory, sv.label, _colorLabel) : null
                    const sDisabled = sStock !== null && sStock === 0
                    return (
                      <button
                        key={sv.label}
                        title={sDisabled ? `${sv.label} — Out of Stock` : sv.label}
                        onClick={() => { if (!sDisabled) setSelectedSizeVariant(idx) }}
                        disabled={sDisabled}
                        className={cn(
                          'h-8 min-w-8 px-2.5 rounded-xl border-2 transition-all text-[11px] font-bold uppercase tracking-wide',
                          sDisabled
                            ? 'border-white/6 text-white/15 cursor-not-allowed line-through decoration-white/20'
                            : selectedSizeVariant === idx
                              ? 'border-amber-500 bg-amber-500/8 text-amber-400'
                              : 'border-white/8 text-white/40 hover:border-white/25 hover:text-white/70 hover:bg-white/3'
                        )}
                      >
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
                <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-3">Weight</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => (
                    <button
                      key={v.weight}
                      onClick={() => setSelectedVariant(idx)}
                      className={cn(
                        'h-10 px-4 rounded-xl border-2 text-xs font-bold uppercase tracking-wide transition-all',
                        selectedVariant === idx
                          ? 'border-amber-500 bg-amber-500/8 text-amber-400'
                          : 'border-white/8 text-white/40 hover:border-white/25 hover:text-white/70'
                      )}
                    >
                      {v.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            {colorRequired ? (
              <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/6 border border-amber-500/15 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-xs">Please select a colour to check availability</span>
              </div>
            ) : sizeRequired ? (
              <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/6 border border-amber-500/15 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-xs">Please select a size to check availability</span>
              </div>
            ) : currentStock !== null && currentStock > 0 && currentStock <= 5 ? (
              <p className="text-xs text-red-400 font-semibold">Only {currentStock} left — order soon!</p>
            ) : currentStock === 0 ? (
              <div className="inline-flex items-center gap-2 text-xs text-red-400 bg-red-500/6 border border-red-500/15 rounded-xl px-4 py-2.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
              </div>
            ) : null}

            {/* Quantity + CTA */}
            <div className="space-y-3">
              {/* Qty stepper */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider w-14">Qty</span>
                <div className="flex items-center border border-white/8 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-lg leading-none"
                  >&#x2212;</button>
                  <span className="w-10 text-center font-bold text-white text-sm select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={currentStock !== null && quantity >= maxQty}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-lg leading-none disabled:opacity-20 disabled:cursor-not-allowed"
                  >+</button>
                </div>
                {quantity > 1 && (
                  <span className="text-xs text-white/25">
                    = {currency}{(currentPrice * quantity).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: (stockStatus.disabled || colorRequired || sizeRequired) ? 1 : 0.97 }}
                  onClick={handleAddToCart}
                  disabled={isAdded || stockStatus.disabled || colorRequired || sizeRequired}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all',
                    (stockStatus.disabled || colorRequired || sizeRequired)
                      ? 'bg-white/4 text-white/20 cursor-not-allowed border border-white/6'
                      : isAdded
                        ? 'bg-green-600 text-white border border-green-500'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 border border-amber-400/50'
                  )}
                >
                  {stockStatus.disabled ? 'Out of Stock'
                    : colorRequired ? 'Select Colour'
                    : sizeRequired ? 'Select Size'
                    : isAdded ? <><Check className="w-4 h-4" /> Added!</>
                    : <><ShoppingBag className="w-4 h-4" /> Add to Bag</>}
                </motion.button>
                <motion.button
                  whileTap={{ scale: (stockStatus.disabled || colorRequired || sizeRequired) ? 1 : 0.97 }}
                  onClick={handleBuyNow}
                  disabled={stockStatus.disabled || colorRequired || sizeRequired}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all border',
                    (stockStatus.disabled || colorRequired || sizeRequired)
                      ? 'border-white/6 text-white/15 cursor-not-allowed'
                      : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/60'
                  )}
                >
                  <Zap className="w-4 h-4" /> Buy Now
                </motion.button>
              </div>
            </div>


          </div>
        </div>

        {/* ── Guarantees & Features — full width ── */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: Truck,       color: 'text-amber-500',  title: 'Fast Delivery',           desc: 'Pan India in 2–3 business days' },
              { icon: ShieldCheck, color: 'text-emerald-400', title: 'Authenticity Guaranteed',  desc: '100% genuine UNIKQ Label product' },
              { icon: Package,     color: 'text-sky-400',    title: 'Safe Packaging',            desc: 'Carefully packed, never damaged' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 px-4 py-3 bg-white/2 border border-white/6 rounded-xl">
                <item.icon className={cn('w-4 h-4 shrink-0', item.color)} />
                <div>
                  <p className="text-xs font-bold text-white/70">{item.title}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FEATURES.map(f => (
              <div key={f.label} className={cn('flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center', f.bg)}>
                <f.icon className={cn('w-4 h-4', f.color)} />
                <span className={cn('text-[10px] font-bold leading-tight', f.color)}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-14">
          <div className="flex gap-0 border-b border-white/6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'text-amber-400 border-amber-400'
                    : 'text-white/25 border-transparent hover:text-white/55 hover:border-white/15'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'reviews' && reviewStats && reviewStats.total > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/12 text-amber-400 text-[10px] font-black rounded">
                    {reviewStats.total}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="py-8 max-w-4xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {product.description && (
                    <div className="md:col-span-2 bg-[#111] border border-white/6 rounded-2xl p-6">
                      <h3 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> About this Product
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed">{product.description}</p>
                    </div>
                  )}
                  <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
                    <p className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <Package className="w-3.5 h-3.5" /> Fabric Care
                    </p>
                    <ul className="space-y-1.5 text-white/35 text-xs leading-relaxed">
                      <li>&#x2022; Machine wash in cold water</li>
                      <li>&#x2022; Wash with similar colours only</li>
                      <li>&#x2022; Dry in shade, avoid direct sunlight</li>
                      <li>&#x2022; Iron on low to medium heat</li>
                    </ul>
                  </div>
                  <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
                    <p className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5" /> Why UNIKQ Label?
                    </p>
                    <ul className="space-y-1.5 text-white/35 text-xs leading-relaxed">
                      <li>&#x2022; Premium quality fabrics &amp; materials</li>
                      <li>&#x2022; Trendy, authentic designs</li>
                      <li>&#x2022; Crafted by skilled artisans</li>
                      <li>&#x2022; Packed with precision &amp; care</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="py-8 max-w-3xl"
              >
                <ReviewsSection productId={productIdForReviews} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mt-14 border-t border-white/5 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white">
                More from <span className="text-amber-400 capitalize">{product.category}</span>
              </h2>
              <Link
                to={`/products?category=${product.category}`}
                className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors"
              >
                View all &#x2192;
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-black/96 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              src={resolveImg(galleryImages[activeImg])}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setZoomed(false)}
            >&#x2715;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/6 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-bold text-base leading-none">{currency}{currentPrice.toLocaleString('en-IN')}</p>
            {showDiscount && (
              <p className="text-white/20 text-[10px] mt-0.5 flex items-center gap-1">
                <span className="line-through">{currency}{basePrice.toLocaleString('en-IN')}</span>
                <span className="text-green-400 font-semibold">{discountPct}% off</span>
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdded || stockStatus.disabled || colorRequired || sizeRequired}
            className={cn(
              'flex items-center gap-2 px-5 h-11 rounded-xl font-black text-sm transition-all',
              (stockStatus.disabled || colorRequired || sizeRequired)
                ? 'bg-white/6 text-white/25 cursor-not-allowed'
                : isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-amber-500 text-black active:scale-95'
            )}
          >
            {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
            {isAdded ? 'Added' : stockStatus.disabled ? 'Out of Stock' : colorRequired ? 'Pick Colour' : sizeRequired ? 'Pick Size' : 'Add to Bag'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={stockStatus.disabled || colorRequired || sizeRequired}
            className={cn(
              'flex items-center justify-center h-11 w-11 rounded-xl border transition-all active:scale-95',
              (stockStatus.disabled || colorRequired || sizeRequired)
                ? 'border-white/6 text-white/15 cursor-not-allowed'
                : 'border-amber-500/25 text-amber-500 hover:bg-amber-500/8'
            )}
          >
            <Zap size={18} />
          </button>
        </div>
      </div>
      <div className="lg:hidden h-20" />

      <Footer />
    </main>
  )
}
