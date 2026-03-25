

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Check, Leaf, Circle, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { Image } from "@/components/ui/image"
import type { Product } from "@/data/products"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const { settings } = useSettings()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const [imgHovered, setImgHovered] = useState(false)

  const variants = product.variants || [{ weight: product.weight, price: product.price }]
  const currentVariant = variants[selectedVariant]
  const currency = settings?.currency_symbol || '₹'

  // Hover image: use first gallery image (if available) as the swap target
  const secondaryImage = product.gallery?.[0]
  const showDiscount = product.discount_price && product.discount_price < product.price
  const discountPct = showDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${currentVariant.weight}`,
      name: product.name,
      price: currentVariant.price,
      weight: currentVariant.weight,
      image: product.image,
      category: product.category,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
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
        className="relative aspect-[16/11] overflow-hidden cursor-pointer"
        onMouseEnter={() => secondaryImage && setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {/* Primary image */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-500 ${imgHovered && secondaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-110'}`}
        />
        {/* Secondary hover image */}
        {secondaryImage && (
          <Image
            src={secondaryImage.startsWith('http') ? secondaryImage : secondaryImage.startsWith('/api/') ? secondaryImage : `/api${secondaryImage}`}
            alt={`${product.name} - view 2`}
            fill
            className={`object-cover transition-all duration-500 ${imgHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60" />

        {/* Hover overlay: "View Details" */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imgHovered || !secondaryImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
          <Link
            to={`/products/${product.id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20 hover:bg-[#d97706] hover:border-[#d97706] transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </Link>
        </div>

        {/* Top Left: Dietary Badge */}
        {product.isVeg !== undefined && (
          <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${
            product.isVeg 
              ? "bg-[#064e3b]/90 text-[#10b981] border border-[#10b981]/20 backdrop-blur-sm" 
              : "bg-red-900/90 text-red-400 border border-red-400/20 backdrop-blur-sm"
          }`}>
            {product.isVeg ? (
              <>
                <Leaf className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                <span className="hidden xs:inline">Pure Veg</span>
                <span className="xs:hidden">Veg</span>
              </>
            ) : (
              <>
                <Circle className="w-2 h-2 md:w-2.5 md:h-2.5 fill-current" />
                <span className="hidden xs:inline">Non Veg</span>
                <span className="xs:hidden">Non-V</span>
              </>
            )}
          </div>
        )}

        {/* Top Right: Discount badge (takes priority over Homemade) */}
        {showDiscount ? (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-wider shadow-lg">
            -{discountPct}%
          </div>
        ) : product.isHomemade ? (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 bg-[#451a03]/90 text-[#d97706] border border-[#d97706]/20 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <span className="hidden xs:inline">Homemade</span>
            <span className="xs:hidden">Home</span>
          </div>
        ) : null}

        {/* Bottom Right: Bestseller Badge */}
        {product.bestseller && (
          <div className="absolute bottom-2 right-2 z-10 px-2 md:px-3 py-0.5 md:py-1 bg-[#d97706] text-[#0f0f0f] text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
            Best
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
          <Link to={`/products/${product.id}`} className="flex-1 min-w-0">
            <h3 className="font-serif text-sm md:text-lg font-bold text-[#fef3e2] group-hover:text-[#d97706] transition-colors line-clamp-1">
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

        {/* Weight Variants */}
        {variants.length > 1 && (
          <div className="mb-3 md:mb-4">
            <p className="text-[#fef3e2]/50 text-[10px] md:text-xs mb-1.5 md:mb-2 text-center xs:text-left">Select Size:</p>
            <div className="flex flex-nowrap items-center justify-center xs:justify-start gap-1.5 md:gap-2">
              {variants.map((variant, idx) => (
                <button
                  key={variant.weight}
                  onClick={() => setSelectedVariant(idx)}
                  className={`flex-1 xs:flex-none min-w-0 px-1 md:px-3 py-1.5 md:py-2 rounded-lg text-[9px] md:text-sm font-medium transition-all truncate ${
                    selectedVariant === idx
                      ? "bg-[#d97706] text-[#0f0f0f] shadow-lg shadow-[#d97706]/20"
                      : "bg-[#1a1410] text-[#fef3e2]/70 border border-[#d97706]/20 hover:border-[#d97706]/50"
                  }`}
                >
                  {variant.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-[#d97706] text-base md:text-xl font-bold">{currency}{currentVariant.price}</p>
              {/* Show original price strikethrough only on single-variant products with a discount_price set */}
              {showDiscount && variants.length === 1 && (
                <p className="text-[#fef3e2]/40 text-xs md:text-sm line-through">{currency}{product.price}</p>
              )}
            </div>
            {variants.length === 1 && (
              <p className="text-[#fef3e2]/50 text-[10px] md:text-xs">{currentVariant.weight}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 font-medium rounded-full transition-all text-[10px] md:text-sm ${
              isAdded
                ? "bg-green-600 text-white"
                : "bg-[#d97706] text-[#0f0f0f] hover:bg-[#f59e0b]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 md:w-4 md:h-4" />
                Added
              </>
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



