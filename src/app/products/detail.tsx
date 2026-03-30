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
    setProduct(null)
    setNotFound(false)
    setReviewStats(null)

    productService.getApiBySlug(slug)
      .then(raw => {
        if (cancelled) return
        if (!raw) { setNotFound(true); return }
        setProductIdForReviews(raw.id)
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

    // Cart item ID encodes weight + size + color for uniqueness
    const sizeLabel = selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant]?.label ?? '' : ''
    const colorLabel = selectedColor?.color ?? ''
    const variantKey = [variants[selectedVariant].weight, sizeLabel, colorLabel].filter(Boolean).join('-')
    const cartImg = (selectedColor && selectedColor.images[0])
      ? (selectedColor.images[0].startsWith('/api') ? selectedColor.images[0] : resolveImg(selectedColor.images[0]))
      : (product.image || '')

    for (let i = 0; i < qty; i++) {
      addItem({
        id: `${product.id}-${variantKey}`,
        name: product.name,
        price: salePrice,
        originalPrice: discountPct > 0 ? bp : undefined,
        discountPercent: discountPct > 0 ? discountPct : undefined,
        weight: variants[selectedVariant].weight,
        size: sizeLabel || undefined,
        color: colorLabel || undefined,
        image: cartImg,
        category: product.category,
      })
    }
  }

  const handleAddToCart = () => { doAddToCart(); setIsAdded(true); setTimeout(() => setIsAdded(false), 2000) }
  const handleBuyNow    = () => { doAddToCart(); navigate('/checkout') }

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
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/40 mb-8">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-amber-500 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/70 capitalize">{product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">{product.name}</span>
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#111] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-white/50 hover:text-amber-500 rounded-xl transition-all text-[10px] font-semibold"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
        </nav>

        {/* ── Main Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Image Gallery */}
          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div
              className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#111] border border-amber-500/10 cursor-zoom-in group"
              onClick={() => setZoomed(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${selectedColor?.color ?? 'default'}-${activeImg}`}
                  src={resolveImg(galleryImages[activeImg])}
                  alt={`${product.name} - image ${activeImg + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {galleryImages.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); prevImg() }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); nextImg() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 p-2 bg-black/40 rounded-xl text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>
              {showDiscount && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  -{discountPct}% OFF
                </div>
              )}
              {product.bestseller && (
                <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ Bestseller
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)}
                    className={cn(
                      'relative shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all',
                      activeImg === idx ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-white/10 opacity-60 hover:opacity-100'
                    )}>
                    <img src={resolveImg(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">

            {/* Name + Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white font-serif leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {(() => {
                  const avg = reviewStats?.average ?? 0
                  const count = reviewStats?.total ?? 0
                  const displayRating = avg > 0 ? avg : (product.rating ?? 0)
                  return (
                    <>
                      <StarRow rating={displayRating} />
                      <span className="text-amber-500 font-bold text-sm">
                        {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-gray-600 text-xs">({count} review{count !== 1 ? 's' : ''})</span>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="text-4xl font-black text-[#d97706]">{currency}{currentPrice.toLocaleString('en-IN')}</p>
              {showDiscount && (
                <>
                  <p className="text-xl text-[#fef3e2]/30 line-through">{currency}{basePrice.toLocaleString('en-IN')}</p>
                  <span className="text-xs font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">{discountPct}% OFF</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Delivery in 2–3 business days</span>
              <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Carefully packed</span>
            </div>

            {/* Description (short) */}
            {product.description && (
              <p className="text-white/70 leading-relaxed text-sm border-l-2 border-amber-500/40 pl-4">
                {product.description.slice(0, 180)}{product.description.length > 180 ? '…' : ''}
              </p>
            )}

            {/* Color Variants */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-2.5">
                  Color:{' '}
                  <span className="text-amber-400 font-bold">
                    {selectedColor ? selectedColor.color : 'Default'}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Default / transparent swatch to show product default image */}
                  <button
                    key="__default"
                    title="Default"
                    onClick={() => { setSelectedColor(null); setActiveImg(0) }}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-all ring-offset-1.5 ring-offset-[#0f0f0f] flex items-center justify-center',
                      selectedColor === null
                        ? 'border-amber-500 ring-1.5 ring-amber-500/50 shadow-md shadow-amber-500/25'
                        : 'border-white/20 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/15'
                    )}
                    style={{ background: 'transparent' }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/6 border border-white/20" />
                  </button>

                  {product.colorVariants.map((cv) => (
                    <button
                      key={cv.color}
                      title={cv.color}
                      onClick={() => { setSelectedColor(cv); setActiveImg(0) }}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 transition-all ring-offset-1.5 ring-offset-[#0f0f0f] focus:outline-none hover:shadow-md',
                        selectedColor?.color === cv.color
                          ? 'border-amber-500 ring-1.5 ring-amber-500/50 shadow-md shadow-amber-500/25 scale-105'
                          : 'border-white/20 hover:border-amber-500/40 hover:shadow-amber-500/15 hover:ring-1 hover:ring-amber-500/20'
                      )}
                      style={{ background: cv.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Variants */}
            {sizeVariants.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-2.5">
                  Size:{' '}
                  <span className="text-amber-400 font-bold">
                    {selectedSizeVariant !== null ? sizeVariants[selectedSizeVariant].label : 'Not selected'}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Deselect / "None" option — mirrors the default colour swatch */}
                  <button
                    title="Clear size selection"
                    onClick={() => setSelectedSizeVariant(null)}
                    className={cn(
                      'h-10 min-w-10 px-3 rounded-full border-2 transition-all ring-offset-[#0f0f0f] flex items-center justify-center',
                      selectedSizeVariant === null
                        ? 'border-amber-500 ring-[1.5px] ring-amber-500/50 shadow-md shadow-amber-500/25'
                        : 'border-white/20 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/15'
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/6 border border-white/20" />
                  </button>

                  {sizeVariants.map((sv, idx) => (
                    <button
                      key={sv.label}
                      title={sv.price != null ? `${sv.label} — ${currency}${sv.price.toLocaleString('en-IN')}` : sv.label}
                      onClick={() => setSelectedSizeVariant(idx)}
                      className={cn(
                        'h-10 min-w-10 px-3 rounded-full border-2 transition-all ring-offset-[#0f0f0f] focus:outline-none text-xs font-bold uppercase tracking-wide',
                        selectedSizeVariant === idx
                          ? 'border-amber-500 ring-[1.5px] ring-amber-500/50 shadow-md shadow-amber-500/25 text-amber-400 scale-105'
                          : 'border-white/20 text-white/70 hover:border-amber-500/40 hover:text-white hover:shadow-md hover:shadow-amber-500/15 hover:ring-[1px] hover:ring-amber-500/20'
                      )}
                    >
                      {sv.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight Variants (existing — only show if no size variants) */}
            {sizeVariants.length === 0 && variants.length > 1 && (
              <div>
                <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
                  {variants.map((v, idx) => (
                    <button key={v.weight} onClick={() => setSelectedVariant(idx)}
                      className={cn(
                        'shrink-0 snap-center px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap',
                        selectedVariant === idx
                          ? 'bg-amber-500 text-[#0f0f0f] shadow-md shadow-amber-500/20 scale-100'
                          : 'bg-[#1a1410] text-white/70 border border-amber-500/20 hover:border-amber-500/50 hover:text-white hover:bg-[#1a1410]/80'
                      )}>
                      {v.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-[#fef3e2]/50 uppercase tracking-widest mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-[#111] border border-[#d97706]/20 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#fef3e2] hover:bg-[#d97706]/10 transition-colors text-xl font-bold">–</button>
                  <span className="w-12 text-center font-bold text-[#fef3e2] text-lg select-none">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#fef3e2] hover:bg-[#d97706]/10 transition-colors text-xl font-bold">+</button>
                </div>
                <p className="text-sm text-[#fef3e2]/40">Max 10 per order</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart} disabled={isAdded}
                className={cn('flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all',
                  isAdded ? 'bg-green-600 text-white' : 'bg-[#d97706] text-[#0f0f0f] hover:bg-[#f59e0b] shadow-xl shadow-[#d97706]/20')}>
                {isAdded ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingBag className="w-5 h-5" /> Add {quantity > 1 ? `${quantity} ` : ''}to Cart</>}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base border border-[#d97706]/40 text-[#d97706] hover:bg-[#d97706]/10 transition-all">
                <Zap className="w-5 h-5" /> Buy Now
              </motion.button>
            </div>

            {quantity > 1 && (
              <div className="flex justify-between items-center px-4 py-3 bg-[#d97706]/5 border border-[#d97706]/15 rounded-xl text-sm">
                <span className="text-[#fef3e2]/60">Total ({quantity} × {currency}{currentPrice.toLocaleString('en-IN')})</span>
                <span className="text-[#d97706] font-black">{currency}{(currentPrice * quantity).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Product Features Strip ──────────────────────────────── */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURES.map(f => (
            <div key={f.label} className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border text-center', f.bg)}>
              <f.icon className={cn('w-6 h-6', f.color)} />
              <span className={cn('text-xs font-bold', f.color)}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabbed Section ─────────────────────────────────────── */}
        <section className="mt-14">
          <div className="flex border-b border-gray-800 mb-8 gap-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn('flex items-center gap-2 px-6 py-3.5 text-sm font-black transition-all border-b-2 -mb-px',
                  activeTab === tab.key ? 'text-amber-400 border-amber-400' : 'text-gray-500 border-transparent hover:text-gray-300')}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'reviews' && productIdForReviews && (
                  <span className="ml-1 text-[10px] text-amber-500/60 font-bold">★</span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="max-w-3xl space-y-8">
                  {product.description ? (
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
                      <h3 className="text-white font-black text-base mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" /> About this Product
                      </h3>
                      <p className="text-[#fef3e2]/70 leading-relaxed text-sm">{product.description}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm italic">No description available.</p>
                  )}

                  {/* Care & Brand Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
                      <p className="text-amber-400 font-black text-sm mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Fabric Care
                      </p>
                      <ul className="space-y-1.5 text-gray-400 text-xs leading-relaxed">
                        <li>• Machine wash in cold water</li>
                        <li>• Wash with similar colours only</li>
                        <li>• Dry in shade, avoid direct sunlight</li>
                        <li>• Iron on low to medium heat</li>
                      </ul>
                    </div>
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
                      <p className="text-amber-400 font-black text-sm mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Why UNIKQ Label?
                      </p>
                      <ul className="space-y-1.5 text-gray-400 text-xs leading-relaxed">
                        <li>• Premium quality fabrics &amp; materials</li>
                        <li>• Trendy, authentic designs</li>
                        <li>• Crafted by skilled artisans</li>
                        <li>• Packed with precision &amp; care</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="max-w-2xl">
                  <ReviewsSection productId={productIdForReviews} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Delivery & Guarantee Section ───────────────────────── */}
        <section className="mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Truck,      title: 'Fast Delivery',      desc: 'Pan India delivery in 2–3 business days' },
              { icon: ShieldCheck,title: 'Quality Guaranteed',  desc: 'Premium fabric quality, 100% authentic' },
              { icon: Package,    title: 'Safe Packaging',      desc: 'Carefully packed, never mishandled' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 bg-[#111] border border-gray-800 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Related Products ───────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-[#fef3e2]">
                More from <span className="text-[#d97706] capitalize">{product.category}</span>
              </h2>
              <Link to={`/products?category=${product.category}`}
                className="text-sm text-[#d97706] hover:text-[#f59e0b] font-semibold transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {zoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={resolveImg(galleryImages[activeImg])} alt={product.name}
              className="max-w-full max-h-full object-contain rounded-2xl"
              onClick={e => e.stopPropagation()} />
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setZoomed(false)}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky CTA ─────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] z-50">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-amber-500 font-black text-lg">{currency}{currentPrice.toLocaleString('en-IN')}</span>
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest truncate">{product.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={cn(
                'flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-black text-sm transition-all',
                isAdded ? 'bg-green-600 text-white' : 'bg-[#d97706] text-black active:scale-95'
              )}
            >
              {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
              {isAdded ? 'Added' : 'Add'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10 text-amber-500 active:scale-95"
            >
              <Zap size={20} className="fill-current" />
            </button>
          </div>
        </div>
      </div>
      <div className="lg:hidden h-28" />

      <Footer />
    </main>
  )
}