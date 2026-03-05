

import { useState } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { ShoppingBag, Star, ArrowRight, Check } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { getBestsellers } from "@/data/products"

function BestSellerCard({ product, index }: { product: ReturnType<typeof getBestsellers>[0]; index: number }) {
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
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-[#d97706] text-[#0f0f0f] text-xs font-bold rounded-full">
          Bestseller
        </div>
        {product.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#0f0f0f]/80 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
            <span className="text-xs text-[#fef3e2]">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-[#fef3e2] mb-2">
          {product.name}
        </h3>

        {/* Weight Variants */}
        {variants.length > 1 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {variants.map((variant, idx) => (
                <button
                  key={variant.weight}
                  onClick={() => setSelectedVariant(idx)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
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
          <span className="text-2xl font-bold text-[#f59e0b]">Rs.{currentVariant.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-full transition-all duration-300 ${
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
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function BestSellers() {
  const products = getBestsellers().slice(0, 4)

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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <BestSellerCard key={product.id} product={product} index={index} />
          ))}
        </div>

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
