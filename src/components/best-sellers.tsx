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
  const { addItem } = useCart()
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

  const handleAddToCart = () => {
    // Require size selection if size variants exist
    if (sizeVariants.length > 0 && selectedSizeIdx === null) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 1500)
      return
    }
    const sizeLabel = selectedSizeIdx !== null ? (sizeVariants[selectedSizeIdx]?.label ?? '') : ''
    const variantKey = [currentVariant.weight, sizeLabel].filter(Boolean).join('-')
    addItem({
      id: `${product.id}-${variantKey || currentVariant.weight}`,
      name: product.name,
      price: salePrice,
      originalPrice: discountPct > 0 ? basePrice : undefined,
      discountPercent: discountPct > 0 ? discountPct : undefined,
      weight: currentVariant.weight,
      size: sizeLabel || undefined,
      image: product.image,
      category: product.category,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const badge = getBadge(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(20,18,14,0.7)',
        border: '1px solid rgba(212,175,55,0.08)',
        backdropFilter: 'blur(8px)',
        boxShadow: isHovered
          ? '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.08)'
          : '0 8px 30px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.2) 50%, transparent 100%)',
        }} />

        {/* Badge top-left */}
        {badge && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: badge.bg, border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(8px)' }}>
            {badge.text === 'Trending' ? <Flame size={9} style={{ color: badge.color }} /> : <Sparkles size={9} className="text-amber-500" />}
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: badge.color }}>{badge.text}</span>
          </div>
        )}

        {/* Rating top-right */}
        {product.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(13,13,13,0.85)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(8px)' }}>
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span className="text-[10px] font-semibold" style={{ color: '#F5F0E8' }}>{product.rating}</span>
          </div>
        )}

        {/* Quick Add – appears on hover at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-3">
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300"
            style={{
              background: isAdded ? 'rgba(34,197,94,0.9)' : 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))',
              color: '#0D0D0D',
            }}
          >
            {isAdded ? <><Check size={12} /> Added!</> : <><ShoppingBag size={12} /> Quick Add</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-sm md:text-base font-bold mb-1 line-clamp-1" style={{ color: '#F5F0E8' }}>
          {product.name}
        </h3>

        {/* Variant selectors */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {variants.map((variant, idx) => (
              <button
                key={variant.weight}
                onClick={() => setSelectedVariant(idx)}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium transition-all"
                style={selectedVariant === idx
                  ? { background: 'var(--theme-color)', color: '#0D0D0D' }
                  : { background: 'rgba(212,175,55,0.08)', color: 'rgba(245,240,232,0.6)', border: '1px solid rgba(212,175,55,0.15)' }
                }
              >
                {variant.weight}
              </button>
            ))}
          </div>
        )}

        {/* Size Variants */}
        {sizeVariants.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0">
              {sizeVariants.map((sv, idx) => (
                <button
                  key={sv.label}
                  onClick={() => { setSelectedSizeIdx(idx); setSizeError(false) }}
                  className={cn(
                    'shrink-0 w-12 px-0 py-1.5 rounded-md text-[7px] md:text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap',
                    selectedSizeIdx === idx
                      ? 'bg-amber-500 text-[#0D0D0D] shadow-md shadow-amber-500/20'
                      : sizeError
                        ? 'bg-red-500/10 text-red-400 border border-red-500/60 animate-pulse'
                        : 'text-[rgba(245,240,232,0.6)] border border-[rgba(212,175,55,0.15)] hover:border-[rgba(212,175,55,0.5)]'
                  )}
                  style={selectedSizeIdx !== idx && !sizeError ? { background: 'rgba(212,175,55,0.08)' } : {}}
                >
                  {sv.label}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-red-400 text-[10px] mt-1 font-medium">Please select a size</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-black" style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white), var(--theme-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {currency}{salePrice.toLocaleString('en-IN')}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 md:hidden"
            style={isAdded
              ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
              : { background: 'color-mix(in srgb, var(--theme-color) 12%, transparent)', color: 'var(--theme-color)', border: '1px solid color-mix(in srgb, var(--theme-color) 25%, transparent)', backdropFilter: 'blur(4px)' }
            }
          >
            {isAdded ? <Check size={12} /> : <ShoppingBag size={12} />}
            {isAdded ? 'Added' : 'Add'}
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
    <section className="py-5 px-4" style={{ background: '#0D0D0D' }}>
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
          <h2 className="font-heading text-4xl md:text-5xl font-black mt-3" style={{ color: '#F5F0E8' }}>
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
