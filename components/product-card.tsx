

import { useState } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { motion } from "framer-motion"
import { Star, ShoppingBag, Check } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/data/products"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [isAdded, setIsAdded] = useState(false)

  const variants = product.variants || [{ weight: product.weight, price: product.price }]
  const currentVariant = variants[selectedVariant]

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-2xl overflow-hidden border border-[#d97706]/10 hover:border-[#d97706]/30 transition-all duration-300"
    >
      {/* Bestseller Badge */}
      {product.bestseller && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-[#d97706] text-[#0f0f0f] text-xs font-bold rounded-full">
          Bestseller
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg font-bold text-[#fef3e2] group-hover:text-[#d97706] transition-colors">
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
              <span className="text-[#f59e0b] text-sm font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-[#fef3e2]/60 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Weight Variants */}
        {variants.length > 1 && (
          <div className="mb-4">
            <p className="text-[#fef3e2]/50 text-xs mb-2">Select Size:</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant, idx) => (
                <button
                  key={variant.weight}
                  onClick={() => setSelectedVariant(idx)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedVariant === idx
                      ? "bg-[#d97706] text-[#0f0f0f]"
                      : "bg-[#1a1410] text-[#fef3e2]/70 border border-[#d97706]/20 hover:border-[#d97706]/50"
                  }`}
                >
                  {variant.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#d97706] text-xl font-bold">Rs.{currentVariant.price}</p>
            {variants.length === 1 && (
              <p className="text-[#fef3e2]/50 text-xs">{currentVariant.weight}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-full transition-all text-sm ${
              isAdded
                ? "bg-green-600 text-white"
                : "bg-[#d97706] text-[#0f0f0f] hover:bg-[#f59e0b]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
