import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Share2, Sparkles, ArrowRight } from "lucide-react"
import { productService } from "@/services/productService"
import { useCart } from "@/context/cart-context"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/data/products"

function imgUrl(src: string | null | undefined) {
  return src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : '/images/placeholder.jpg'
}

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [startIdx, setStartIdx] = useState(0)
  const { addItem, setIsCartOpen } = useCart()
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    productService.getPublicProducts().then(data => {
      // For "New Arrivals", we reverse the array to simulate getting the most recently added products
      const latest = [...data].reverse().slice(0, 8)
      setProducts(latest)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const VISIBLE = 4
  const canPrev = startIdx > 0
  const canNext = startIdx + VISIBLE < products.length

  const prev = () => { if (canPrev) setStartIdx(i => i - 1) }
  const next = () => { if (canNext) setStartIdx(i => i + 1) }

  const displayedItems = products.slice(startIdx, startIdx + VISIBLE)

  return (
    <section className="py-16 lg:py-20" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: '#1F4D3A' }}>
            New Arrivals
          </motion.h2>
          
          <div className="hidden md:flex items-center gap-2.5">
            <button onClick={prev} disabled={!canPrev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:bg-[#1F4D3A]/5 active:scale-95"
              style={{ border: '1px solid rgba(200,169,107,0.4)', color: '#1F4D3A' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} disabled={!canNext}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:bg-[#1F4D3A]/5 active:scale-95"
              style={{ border: '1px solid rgba(200,169,107,0.4)', color: '#1F4D3A' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-none overflow-hidden animate-pulse" style={{ aspectRatio: '3/4', background: 'rgba(31,77,58,0.06)' }} />
            ))}
          </div>
        ) : products.length === 0 ? null : (
          <div ref={sliderRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {displayedItems.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-8 mt-10">
          <div className="flex items-center justify-center gap-3 md:hidden">
            <button onClick={prev} disabled={!canPrev}
              className="w-10 h-10 rounded-full flex items-center justify-center border disabled:opacity-30"
              style={{ borderColor: 'rgba(200,169,107,0.35)', color: '#1F4D3A' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} disabled={!canNext}
              className="w-10 h-10 rounded-full flex items-center justify-center border disabled:opacity-30"
              style={{ borderColor: 'rgba(200,169,107,0.35)', color: '#1F4D3A' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

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
