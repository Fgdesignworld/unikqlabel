import { useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { ShoppingBag, Star, ArrowRight, Check, Loader2, Flame, Sparkles } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useSettings } from '@/context/settings-context'
import { Image } from "@/components/ui/image"
import { productService } from "@/services/productService"
import type { Product, SizeVariant } from "@/data/products"
import { cn } from "@/lib/utils"

// Maps to fashion label words instead of food ones
function getBadge(product: Product): { text: string; color: string; bg: string } | null {
  if (product.bestseller) return { text: 'Trending', color: '#0D0D0D', bg: 'var(--theme-color)' }
  if ((product.rating ?? 0) >= 4.9) return { text: 'New Drop', color: '#F5F0E8', bg: 'rgba(212,175,55,0.15)' }
  return null
}

function BestSellerCard({ product, index }: { product: Product; index: number }) {
  const { addItem, items: cartItems } = useCart()
  const { settings } = useSettings()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // ── Keep existing cart logic ──
  const variants = product.variants || [{ weight: product.weight, price: product.price }]
  const currentVariant = variants[selectedVariant]
  const sizeVariants: SizeVariant[] = product.sizeVariants || []
  const currency = settings?.currency_symbol || '₹'

  // Price: size variant price overrides weight variant price, then discount applies
  const weightBasePrice = currentVariant.price
  const sizePriceOverride = selectedSizeIdx !== null && sizeVariants[selectedSizeIdx]?.price != null
    ? sizeVariants[selectedSizeIdx].price!
    : null
  const basePrice = sizePriceOverride ?? weightBasePrice
  const discountPct = product.discount_price && product.discount_price > 0 && product.discount_price <= 100 ? Math.round(product.discount_price) : 0
  const salePrice = discountPct > 0 ? Math.round(basePrice * (100 - discountPct) / 100) : basePrice

  // ── Real-time stock: totalStock minus what's already in the cart for this variant ──
  const sizeLabel = selectedSizeIdx !== null ? (sizeVariants[selectedSizeIdx]?.label ?? '') : ''
  const colorLabel = '' // best-sellers has no color picker; color defaults to empty
  const cartId = `${product.id}|${currentVariant.weight}|${sizeLabel}|${colorLabel}`
  const cartQty = cartItems.find(i => i.id === cartId)?.quantity ?? 0

  // Per-variant stock check — avoids showing in-stock when only THIS specific variant is OOS
  const variantRows = product.variantInventory
  const specificVariantStock = (variantRows && sizeLabel)
    ? (() => {
        const sl = sizeLabel.toLowerCase()
        const exact    = variantRows.find(r => (r.size?.toLowerCase() ?? null) === sl && r.color === null)
        const fallback = variantRows.find(r => r.size === null && r.color === null)
        return (exact ?? fallback)?.stock ?? null
      })()
    : null

  const maxStock = specificVariantStock !== null
    ? specificVariantStock
    : (typeof product.totalStock === 'number' ? product.totalStock : null)
  const remainingStock = maxStock !== null ? Math.max(0, maxStock - cartQty) : null
  const isOOS = remainingStock !== null && remainingStock === 0

  const handleAddToCart = () => {
    // Require size selection if size variants exist
    if (sizeVariants.length > 0 && selectedSizeIdx === null) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    if (isOOS) return
    addItem({
      id: cartId,
      productId: product.numericId,
      name: product.name,
      price: salePrice,
      originalPrice: discountPct > 0 ? basePrice : undefined,
      discountPercent: discountPct > 0 ? discountPct : undefined,
      weight: currentVariant.weight,
      size: sizeLabel || undefined,
      color: colorLabel || undefined,
      image: product.image,
      category: product.category,
      maxStock: maxStock !== null && maxStock > 0 ? maxStock : undefined,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const badge = getBadge(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--surface-card)',
        border: isHovered ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(212,175,55,0.08)',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Image — compact square */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-[#0a0a0a] shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badge && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: badge.bg, border: '1px solid rgba(212,175,55,0.25)', backdropFilter: 'blur(6px)' }}>
              {badge.text === 'Trending' ? <Flame size={8} style={{ color: badge.color }} /> : <Sparkles size={8} className="text-amber-500" />}
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: badge.color }}>{badge.text}</span>
            </div>
          )}
          {discountPct > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black w-fit">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(6px)' }}>
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-semibold text-white/80">{product.rating}</span>
          </div>
        )}

        {/* OOS overlay */}
        {isOOS && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-2.5 py-1 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Quick add on hover */}
        {!isOOS && (
          <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-250 p-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all"
              style={{
                background: isAdded ? 'rgba(34,197,94,0.9)' : 'rgba(212,175,55,0.92)',
                color: '#0D0D0D',
                backdropFilter: 'blur(4px)',
              }}
            >
              {isAdded ? <><Check size={11} /> Added</> : <><ShoppingBag size={11} /> Quick Add</>}
            </button>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-xs font-semibold line-clamp-1 text-white/80 hover:text-white transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Variant selectors */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {variants.map((variant, idx) => (
              <button
                key={variant.weight}
                onClick={() => setSelectedVariant(idx)}
                className="px-1.5 py-0.5 rounded text-[9px] font-medium transition-all"
                style={selectedVariant === idx
                  ? { background: 'var(--theme-color)', color: '#0D0D0D' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {variant.weight}
              </button>
            ))}
          </div>
        )}

        {/* Size Variants */}
        {sizeVariants.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1">
              {sizeVariants.map((sv, idx) => (
                <button
                  key={sv.label}
                  onClick={() => { setSelectedSizeIdx(idx); setSizeError(false) }}
                  className={cn(
                    'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide transition-all',
                    selectedSizeIdx === idx
                      ? 'bg-amber-500 text-[#0D0D0D]'
                      : sizeError
                        ? 'bg-red-500/10 text-red-400 border border-red-500/50 animate-pulse'
                        : 'text-white/40 border border-white/8 hover:border-white/20 hover:text-white/70'
                  )}
                  style={selectedSizeIdx !== idx && !sizeError ? { background: 'rgba(255,255,255,0.04)' } : {}}
                >
                  {sv.label}
                </button>
              ))}
            </div>
            {sizeError && (
              <div className="mt-1.5 px-2.5 py-1.5 bg-red-500/8 border border-red-500/20 rounded-lg flex items-center gap-1.5 text-[10px] text-red-400 font-semibold">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                Size: Not selected
              </div>
            )}
          </div>
        )}

        {/* Price + Add button row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            {remainingStock !== null && remainingStock > 0 && remainingStock <= 5 && (
              <span className="block text-[8px] font-black text-amber-400 mb-0.5">Only {remainingStock} left</span>
            )}
            <span className="text-sm font-black" style={{ color: 'var(--theme-color)' }}>
              {currency}{salePrice.toLocaleString('en-IN')}
            </span>
            {discountPct > 0 && (
              <span className="text-[9px] text-white/25 line-through">{currency}{basePrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdded || isOOS}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
            style={isOOS
              ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
              : isAdded
                ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                : { background: 'rgba(212,175,55,0.1)', color: 'var(--theme-color)', border: '1px solid rgba(212,175,55,0.2)' }
            }
          >
            {isAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // ── Data fetching with 3s timeout → fallback to local data ──
  useEffect(() => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    )
    Promise.race([productService.getBestsellers(), timeout])
      .then(items => setProducts((items as typeof items).slice(0, 8)))
      .catch(() => {
        import("@/data/products").then(m => setProducts(m.getBestsellers().slice(0, 8)))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-5 px-4" style={{ background: 'var(--surface-page)' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4 inline-block">Fan Favorites</span>
          <h2 className="font-heading text-4xl md:text-5xl font-black mt-3" style={{ color: 'var(--text-primary)' }}>
            Best{" "}
            <span style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white) 0%, var(--theme-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Sellers</span>
          </h2>
          <div className="w-20 h-0.5 mx-auto mt-5" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color), transparent)' }} />
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <BestSellerCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 group hover:-translate-y-1"
            style={{
              border: '1.5px solid rgba(212,175,55,0.45)',
              color: 'var(--theme-color)',
            }}
          >
            View All Styles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
