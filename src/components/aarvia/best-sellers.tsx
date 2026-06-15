import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { productService } from "@/services/productService"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/data/products"

function imgUrl(src: string | null | undefined) {
  return src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : '/images/placeholder.jpg'
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [startIdx, setStartIdx] = useState(0)
  const { addToCart } = useCart()
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    productService.getBestsellers().then(data => {
      setProducts(data.slice(0, 8))
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
    <section className="py-24 lg:py-32" style={{ background: '#F7F4ED' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3"
              style={{ color: '#C8A96B' }}>
              Bestsellers
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.06, duration: 0.6 }}
              className="text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#1F4D3A' }}>
              Most Loved<br />
              <span style={{ color: '#C8A96B', fontStyle: 'italic' }}>by Our Community</span>
            </motion.h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={prev} disabled={!canPrev}
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
              style={{ borderColor: 'rgba(200,169,107,0.35)', color: '#1F4D3A' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} disabled={!canNext}
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
              style={{ borderColor: 'rgba(200,169,107,0.35)', color: '#1F4D3A' }}>
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
          <div ref={sliderRef} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {displayedItems.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="group"
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <img src={imgUrl(product.image)} alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-600 group-hover:scale-105" />
                    <div className="absolute inset-0 transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(10,28,20,0.35)' }} />

                    {product.bestseller && (
                      <div className="absolute top-3 left-3 px-2.5 py-1"
                        style={{ background: '#C8A96B', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: '#1A1A1A', textTransform: 'uppercase' }}>
                        Bestseller
                      </div>
                    )}

                    {/* Quick add */}
                    <motion.button
                      initial={{ y: 12, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }}
                      className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 py-3 opacity-0 group-hover:opacity-100 transition-all duration-400"
                      style={{ background: '#1F4D3A', color: '#F7F4ED', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                      onClick={() => addToCart({ product, quantity: 1 })}>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Bag
                    </motion.button>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-2.5 h-2.5"
                          style={{ color: j < Math.round(product.rating) ? '#C8A96B' : 'rgba(200,169,107,0.2)', fill: j < Math.round(product.rating) ? '#C8A96B' : 'transparent' }} />
                      ))}
                    </div>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold leading-snug mb-1.5 hover:text-[#1F4D3A] transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', color: '#1F1F1A' }}>
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold" style={{ color: '#1F4D3A', fontSize: '1rem' }}>
                        ₹{(product.discount_price ?? product.price).toLocaleString()}
                      </span>
                      {product.discount_price && (
                        <span className="text-sm line-through" style={{ color: '#B0ADA4' }}>₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile nav */}
        <div className="flex items-center justify-center gap-3 mt-10 md:hidden">
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
