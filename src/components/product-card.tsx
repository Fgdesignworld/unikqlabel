

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Check, Eye, Share2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { Image } from "@/components/ui/image"
import type { Product, SizeVariant, ColorVariant } from "@/data/products"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items: cartItems } = useCart()
  const { settings } = useSettings()
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null)
  const [isAdded, setIsAdded] = useState(false)
  const [imgHovered, setImgHovered] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const sizeVariants: SizeVariant[] = product.sizeVariants || []
  const currency = settings?.currency_symbol || '₹'

  // Price logic: selected size price → base product price, then apply discount
  const basePrice = (selectedSizeIdx !== null && sizeVariants[selectedSizeIdx]?.price != null)
    ? sizeVariants[selectedSizeIdx].price!
    : product.price
  const discountPct = product.discount_price && product.discount_price > 0 && product.discount_price <= 100
    ? Math.round(product.discount_price) : 0
  const showDiscount = discountPct > 0
  const effectivePrice = showDiscount ? Math.round(basePrice * (100 - discountPct) / 100) : basePrice

  // Active image: color variant image if selected and has images, else product.image
  const resolveImg = (p?: string | null) => {
    if (!p) return '/images/placeholder.jpg'
    if (p.startsWith('http')) return p
    if (p.startsWith('/')) return p
    return `/api${p}`
  }
  const colorImage = selectedColor?.images?.[0] ? resolveImg(selectedColor.images[0]) : null
  const activeImage = colorImage ?? product.image
  // Hover image: when color is active → show product.image; else show first gallery image
  const hoverImage = colorImage ? product.image : (product.gallery?.[0] ?? null)

  // ── Real-time stock: totalStock minus what's already in cart for this exact variant ──
  const sizeLabel = selectedSizeIdx !== null ? (sizeVariants[selectedSizeIdx]?.label ?? '') : ''
  const colorLabel = selectedColor?.color ?? ''
  const cartId = `${product.id}|${product.weight}|${sizeLabel}|${colorLabel}`
  const cartQty = cartItems.find(i => i.id === cartId)?.quantity ?? 0

  // If we have per-variant inventory and a specific variant is selected, use that
  // row's stock so OOS is checked per-variant and not against the total across all variants.
  const variantRows = product.variantInventory
  const specificVariantStock = (variantRows && (sizeLabel || colorLabel))
    ? (() => {
        const sl = sizeLabel.toLowerCase() || null
        const cl = colorLabel.toLowerCase() || null
        // Try exact match first, then size-only, then color-only, then fallback
        const exact     = variantRows.find(r => (r.size?.toLowerCase() ?? null) === sl && (r.color?.toLowerCase() ?? null) === cl)
        const sizeOnly  = cl !== null ? variantRows.find(r => (r.size?.toLowerCase() ?? null) === sl && r.color === null) : null
        const colorOnly = sl !== null ? variantRows.find(r => r.size === null && (r.color?.toLowerCase() ?? null) === cl) : null
        const fallback  = variantRows.find(r => r.size === null && r.color === null)
        return (exact ?? sizeOnly ?? colorOnly ?? fallback)?.stock ?? null
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
      setTimeout(() => setSizeError(false), 1500)
      return
    }
    if (isOOS) return
    const salePrice = discountPct > 0 ? Math.round(basePrice * (100 - discountPct) / 100) : basePrice
    const cartImg = selectedColor?.images?.[0]
      ? (selectedColor.images[0].startsWith('/api') ? selectedColor.images[0] : `/api${selectedColor.images[0]}`)
      : product.image

    addItem({
      id: cartId,
      productId: product.numericId,
      name: product.name,
      price: salePrice,
      originalPrice: discountPct > 0 ? basePrice : undefined,
      discountPercent: discountPct > 0 ? discountPct : undefined,
      weight: product.weight,
      size: sizeLabel || undefined,
      color: colorLabel || undefined,
      image: cartImg,
      category: product.category,
      maxStock: maxStock !== null && maxStock > 0 ? maxStock : undefined,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/products/${product.id}`
    const shareData = {
      title: product.name,
      text: product.description || `Check out ${product.name} from UNIKQ LABEL!`,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25), ease: "easeOut" }}
      className="group relative bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-2xl overflow-hidden border border-[#d97706]/10 hover:border-[#d97706]/30 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] max-h-[260px] overflow-hidden cursor-pointer"
        onMouseEnter={() => hoverImage && setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {/* Active image (default or color-selected) */}
        <Image
          src={activeImage}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-500 ${imgHovered && hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-110'}`}
        />
        {/* Secondary hover image */}
        {hoverImage && (
          <Image
            src={hoverImage.startsWith('http') ? hoverImage : hoverImage.startsWith('/api') ? hoverImage : `/api${hoverImage}`}
            alt={`${product.name} - alternate`}
            fill
            className={`object-cover transition-all duration-500 ${imgHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60" />

        {/* Hover overlay: "View Details" */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imgHovered || !hoverImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
          <Link
            to={`/products/${product.id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20 hover:bg-amber-500 hover:border-amber-500 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </Link>
        </div>

        {/* Top Left: Discount Badge */}
        {showDiscount && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1 bg-red-600/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl border border-white/10">
            -{discountPct}%
          </div>
        )}

        {/* Top Right: Share button — always visible */}
        <button
          onClick={handleShare}
          aria-label="Share product"
          className="absolute top-2 right-2 z-10 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-black/50 hover:bg-amber-500 text-white backdrop-blur-sm rounded-full border border-white/10 hover:border-amber-500 transition-all duration-200 shadow-lg"
        >
          <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </button>

        {/* Bottom Right: Bestseller Badge */}
        {product.bestseller && (
          <div className="absolute bottom-3 right-3 z-10 px-3 py-1 bg-amber-500/90 backdrop-blur-md text-[#0f0f0f] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xl border border-amber-500/20">
            Trending
          </div>
        )}

        {/* Bottom Left: Out of Stock overlay badge */}
        {isOOS && (
          <div className="absolute bottom-3 left-3 z-10 px-3 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xl border border-white/10">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
          <Link to={`/products/${product.id}`} className="flex-1 min-w-0">
            <h3 className="font-serif text-sm md:text-lg font-bold text-[#fef3e2] group-hover:text-amber-500 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {product.rating && (
            <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
              <Star className="w-3 h-3 md:w-4 md:h-4 text-[#f59e0b] fill-[#f59e0b]" />
              <span className="text-[#f59e0b] text-[10px] md:text-sm font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-[#fef3e2]/60 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Color Variants */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {/* Default / Transparent swatch - clears color selection and shows default image */}
              <button
                key="__default"
                title="Default"
                onClick={() => setSelectedColor(null)}
                className={cn(
                  'shrink-0 w-5 h-5 rounded-full border-1.5 transition-all ring-offset-1.5 ring-offset-[#0f0f0f] flex items-center justify-center',
                  selectedColor === null
                    ? 'border-amber-500 ring-1.5 ring-amber-500/50 shadow-md shadow-amber-500/25'
                    : 'border-white/20 hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/15'
                )}
                style={{ background: 'transparent' }}
              >
                <span className="w-2 h-2 rounded-full bg-white/5 border border-white/25" />
              </button>

              {product.colorVariants.map(cv => {
                const isSelected = selectedColor?.color === cv.color
                return (
                  <button
                    key={cv.color}
                    title={cv.color}
                    onClick={() => setSelectedColor(cv)}
                    className={cn(
                      'shrink-0 w-5 h-5 rounded-full border-1.5 transition-all ring-offset-1.5 ring-offset-[#0f0f0f]',
                      isSelected
                        ? 'border-amber-500 ring-1.5 ring-amber-500/50 shadow-md shadow-amber-500/25 scale-105'
                        : 'border-white/20 hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/15'
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
          <div className="mb-2">
            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-0">
              {sizeVariants.map((sv, idx) => (
                <button
                  key={sv.label}
                  onClick={() => { setSelectedSizeIdx(idx); setSizeError(false) }}
                  className={cn(
                    'shrink-0 snap-center w-12 px-0 py-1.5 rounded-md text-[7px] md:text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap',
                    selectedSizeIdx === idx
                      ? 'bg-amber-500 text-[#0f0f0f] shadow-md shadow-amber-500/20 scale-100'
                      : sizeError
                        ? 'bg-red-500/10 text-red-400 border border-red-500/60 animate-pulse'
                        : 'bg-[#1a1410] text-[#fef3e2]/70 border border-[#d97706]/20 hover:border-[#d97706]/60 hover:text-[#fef3e2]'
                  )}
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

        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {/* Low stock label — real-time: subtracts qty already in cart */}
            {!isOOS && remainingStock !== null && remainingStock <= 10 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1.5">
                Only {remainingStock} left
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <p className="text-amber-500 text-base md:text-xl font-bold">{currency}{effectivePrice.toLocaleString('en-IN')}</p>
              {showDiscount && (
                <p className="text-[#fef3e2]/40 text-xs md:text-sm line-through">{currency}{basePrice.toLocaleString('en-IN')}</p>
              )}
            </div>
            <p className="text-[#fef3e2]/50 text-[10px] md:text-xs">
              {selectedColor ? selectedColor.color : (sizeVariants.length === 0 ? product.weight : '')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdded || isOOS}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 font-medium rounded-full transition-all text-[10px] md:text-sm ${
              isOOS
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : isAdded
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 text-[#0f0f0f] hover:bg-amber-400'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 md:w-4 md:h-4" />
                Added
              </>
            ) : isOOS ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}



