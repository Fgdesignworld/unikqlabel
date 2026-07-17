import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Share2, ArrowRight } from "lucide-react"
import { productService } from "@/services/productService"
import { useCart } from "@/context/cart-context"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/data/products"

function imgUrl(src: string | null | undefined) {
  return src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : '/images/placeholder.jpg'
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [startIdx, setStartIdx] = useState(0)
  const { addItem, setIsCartOpen } = useCart()
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    productService.getBestsellers().then(async data => {
      let bestSellers = data
      if (bestSellers.length === 0) {
        // Fallback to recent products if no bestsellers are flagged
        const all = await productService.getProducts({ limit: 6 })
        bestSellers = all.data
      }
      setProducts(bestSellers.slice(0, 6))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 lg:py-20" style={{ background: '#FDFBF7' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-center mb-12">
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] mb-4"
            >
              Featured Collection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#1F4D3A' }}>
              Our Best Sellers
            </motion.h2>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-none overflow-hidden animate-pulse" style={{ aspectRatio: '3/4', background: 'rgba(31,77,58,0.06)' }} />
            ))}
          </div>
        ) : products.length === 0 ? null : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}


        <div className="text-center mt-10">
          <Link to="/products"
            className="inline-flex items-center gap-2 font-semibold tracking-widest uppercase transition-all hover:gap-3"
            style={{ color: '#1F4D3A', fontSize: '0.75rem', letterSpacing: '0.14em' }}>
            View All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
