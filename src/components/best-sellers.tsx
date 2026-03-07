

import { useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { ShoppingBag, Star, ArrowRight, Check, Loader2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Image } from "@/components/ui/image"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"

function BestSellerCard({ product, index }: { product: Product; index: number }) {
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group glass rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#d97706]/90 backdrop-blur-sm text-[#0f0f0f] text-[10px] font-bold rounded-full">
          Bestseller
        </div>
        {product.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0f0f0f]/80 backdrop-blur-sm">
            <Star className="w-2.5 h-2.5 fill-[#f59e0b] text-[#f59e0b]" />
            <span className="text-[10px] text-[#fef3e2]">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-5">
        <h3 className="font-serif text-sm md:text-lg font-bold text-[#fef3e2] mb-1 md:mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Weight Variants - Smaller on mobile */}
        {variants.length > 1 && (
          <div className="mb-2 md:mb-3">
            <div className="flex flex-wrap gap-1 md:gap-1.5">
              {variants.map((variant, idx) => (
                <button
                  key={variant.weight}
                  onClick={() => setSelectedVariant(idx)}
                  className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium transition-all ${
                    selectedVariant === idx
                      ? "bg-[#d97706] text-[#0f0f0f]"
                      : "bg-[#1a1410] text-[#fef3e2]/70 border border-[#d97706]/20"
                  }`}
                >
                  {variant.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-base md:text-2xl font-bold text-[#f59e0b]">Rs.{currentVariant.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 text-xs md:font-medium rounded-full transition-all duration-300 ${
              isAdded
                ? "bg-green-600 text-white"
                : "bg-[#d97706] text-[#0f0f0f] hover:bg-[#f59e0b]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getBestsellers()
      .then(items => setProducts(items.slice(0, 4)))
      .catch(() => {
        import("@/data/products").then(m => setProducts(m.getBestsellers().slice(0, 4)))
      })
      .finally(() => setLoading(false))
  }, [])


  return (
    <section className="py-20 px-4 bg-[#0f0f0f]">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase">Customer Favorites</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#fef3e2] mt-2">
            Best Sellers
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Products Grid - 2 columns on mobile */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#d97706] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <BestSellerCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#d97706] text-[#d97706] font-medium rounded-full hover:bg-[#d97706] hover:text-[#0f0f0f] transition-all duration-300 group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
