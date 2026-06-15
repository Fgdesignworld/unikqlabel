

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Check, Eye, Share2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { Image } from "@/components/ui/image"
import { reviewService, type ReviewStats } from "@/services/reviewService"
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
  const [colorError, setColorError] = useState(false)
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)

  // Auto-select when there is exactly one option — no user action needed
  useEffect(() => {
    if (product.colorVariants?.length === 1) setSelectedColor(product.colorVariants[0])
    else setSelectedColor(null)
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sv = product.sizeVariants || []
    if (sv.length === 1) setSelectedSizeIdx(0)
    else setSelectedSizeIdx(null)
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch review stats for this product
  useEffect(() => {
    if (!product.numericId) return
    let cancelled = false
    reviewService.getByProduct(product.numericId)
      .then(data => {
        if (!cancelled) setReviewStats(data.stats)
      })
      .catch(() => {
        // Silently ignore errors
      })
    return () => { cancelled = true }
  }, [product.numericId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sizeVariants: SizeVariant[] = product.sizeVariants || []
  const currency = settings?.currency_symbol || '₹'

  // Price logic: selected size price → base product price, then apply discount
  const basePrice = (selectedSizeIdx !== null && sizeVariants[selectedSizeIdx]?.price != null)
    ? sizeVariants[selectedSizeIdx].price!
    : product.price
  const productDiscountPct = (product.discount_price && product.discount_price > 0 && product.discount_price < product.price)
    ? ((product.price - product.discount_price) / product.price) * 100
    : 0
  const discountPct = Math.round(productDiscountPct)
  const showDiscount = discountPct > 0
  const effectivePrice = showDiscount
    ? ((selectedSizeIdx !== null && sizeVariants[selectedSizeIdx]?.price != null)
        ? Math.round(basePrice * (1 - productDiscountPct / 100))
        : product.discount_price!)
    : basePrice

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Require colour selection if multiple colours exist and none is selected
    if (product.colorVariants && product.colorVariants.length > 1 && !selectedColor) {
      setColorError(true)
      setTimeout(() => setColorError(false), 1500)
      return
    }
    // Require size selection if multiple size variants exist and none is selected
    if (sizeVariants.length > 1 && selectedSizeIdx === null) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 1500)
      return
    }
    if (isOOS) return
    const salePrice = effectivePrice
    const cartImg = selectedColor?.images?.[0]
      ? (selectedColor.images[0].startsWith('/api') ? selectedColor.images[0] : `/api${selectedColor.images[0]}`)
      : product.image

    addItem({
      id: cartId,
      productId: product.numericId,
      name: product.name,
      price: salePrice,
      originalPrice: showDiscount ? basePrice : undefined,
      discountPercent: showDiscount ? discountPct : undefined,
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
      text: product.description || `Check out ${product.name} from KoffeeKup!`,
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
      className="group relative rounded-2xl overflow-hidden border border-[#1F4D3A]/5 hover:border-[#C8A96B]/30 transition-all duration-500 flex flex-col hover:-translate-y-1.5 bg-white hover:shadow-[0_20px_40px_rgba(200,169,107,0.08)]"
    >
      {/* Stretched Link for entire card clickability */}
      <Link
        to={`/products/${product.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View details of ${product.name}`}
      />

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
          className={`object-cover transition-all duration-500 ${imgHovered && hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-105'}`}
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

        {/* Top Left: Discount Badge */}
        {showDiscount && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-0.5 bg-[#C8A96B]/15 backdrop-blur-md text-[#C8A96B] rounded-md text-[9px] font-bold uppercase tracking-wider border border-[#C8A96B]/30 shadow-[0_4px_12px_rgba(200,169,107,0.1)]">
            -{discountPct}%
          </div>
        )}

        {/* Top Right: Share button — always visible */}
        <button
          onClick={handleShare}
          aria-label="Share product"
          className="absolute top-3 right-3 z-20 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-[#1F4D3A]/40 text-[#F7F4ED]/80 hover:text-[#C8A96B] backdrop-blur-md rounded-full border border-white/10 hover:border-[#C8A96B]/40 hover:bg-[#1F4D3A]/90 transition-all duration-300 shadow-md cursor-pointer hover:shadow-[0_0_12px_rgba(200,169,107,0.2)]"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Bottom Right: Bestseller Badge */}
        {product.bestseller && (
          <div className="absolute bottom-3 right-3 z-20 px-3 py-1 bg-[#1F4D3A] backdrop-blur-md text-[#F7F4ED] text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-lg border border-[#C8A96B]/30">
            Trending
          </div>
        )}

        {/* Bottom Left: Out of Stock overlay badge */}
        {isOOS && (
          <div className="absolute bottom-3 left-3 z-20 px-3 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xl border border-white/10">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-1 relative bg-white">
        <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-sm md:text-lg font-bold text-[#1F4D3A] group-hover:text-[#C8A96B] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>
          {(() => {
            const reviewCount = reviewStats?.total ?? 0
            const avgRating = reviewStats?.average ?? 0
            if (reviewCount === 0) return null
            return (
              <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                <Star className="w-3 h-3 md:w-4 md:h-4 text-[#C8A96B] fill-[#C8A96B]" />
                <span className="text-[#1F4D3A] text-[10px] md:text-sm font-semibold">{avgRating.toFixed(1)}</span>
              </div>
            )
          })()}
        </div>

        {/* Review Count Badge */}
        {(() => {
          const reviewCount = reviewStats?.total ?? 0
          if (reviewCount === 0) return null
          return (
            <div className="mb-2 flex items-center gap-1">
              <span className="text-[10px] md:text-xs font-semibold text-[#C8A96B]">
                {reviewCount} Review{reviewCount !== 1 ? 's' : ''}
              </span>
            </div>
          )
        })()}

        {/* Color Variants */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {product.colorVariants.map(cv => {
                const isSelected = selectedColor?.color === cv.color
                return (
                  <button
                    key={cv.color}
                    title={cv.color}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedColor(cv)
                    }}
                    className={cn(
                      'shrink-0 w-5 h-5 rounded-full border border-black/10 transition-all ring-offset-1.5 relative z-20 cursor-pointer',
                      isSelected
                        ? 'border-[#C8A96B] ring-1.5 ring-[#C8A96B]/50 shadow-md shadow-[#C8A96B]/25 scale-105'
                        : colorError
                          ? 'border-red-400 ring-1 ring-red-500/50 animate-pulse'
                          : 'border-black/10 hover:border-[#C8A96B]/50 hover:shadow-md hover:shadow-[#C8A96B]/15'
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
          <div className="mb-3">
            <div className="flex flex-wrap items-center gap-1.5 pb-0">
              {sizeVariants.map((sv, idx) => (
                <button
                  key={sv.label}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedSizeIdx(idx)
                    setSizeError(false)
                  }}
                  className={cn(
                    'shrink-0 min-w-[42px] h-[26px] px-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer border relative z-20',
                    selectedSizeIdx === idx
                      ? 'bg-[#1F4D3A] text-[#F7F4ED] border-[#1F4D3A] shadow-sm shadow-[#1F4D3A]/20 scale-100'
                      : sizeError
                        ? 'bg-red-500/10 text-red-500 border-red-500/60 animate-pulse'
                        : 'border-[#C8A96B]/25 bg-transparent text-[#1F4D3A]/70 hover:border-[#1F4D3A]/50 hover:text-[#1F4D3A]'
                  )}
                >
                  {sv.label}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-red-500 text-[10px] mt-1 font-medium">Please select a size</p>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[#1F4D3A]/5">
          <div className="min-w-0">
            {/* Low stock label — real-time: subtracts qty already in cart */}
            {!isOOS && remainingStock !== null && remainingStock <= 10 && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C8A96B]/10 text-[#C8A96B] border border-[#C8A96B]/20 mb-1">
                Only {remainingStock} left
              </div>
            )}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <p className="text-[#1F4D3A] text-base md:text-lg font-serif font-semibold">{currency}{effectivePrice.toLocaleString('en-IN')}</p>
              {showDiscount && (
                <p className="text-[10px] md:text-xs line-through text-[#1F4D3A]/40">{currency}{basePrice.toLocaleString('en-IN')}</p>
              )}
            </div>
            <p className="text-[9px] md:text-[10px] text-[#1F4D3A]/50 truncate">
              {selectedColor ? selectedColor.color : (sizeVariants.length === 0 ? product.weight : '')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdded || isOOS}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 font-semibold rounded-full transition-all duration-300 text-[10px] tracking-wider uppercase relative z-20 cursor-pointer border ${
              isOOS
                ? 'bg-[#F7F4ED] border-black/5 text-[#1F4D3A]/20 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10 border-emerald-600'
                : 'bg-[#1F4D3A] hover:bg-[#C8A96B] text-[#F7F4ED] hover:text-[#1F4D3A] shadow-md shadow-[#1F4D3A]/10 border-[#1F4D3A] hover:border-[#C8A96B]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" />
                Added
              </>
            ) : isOOS ? (
              'Out'
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}



