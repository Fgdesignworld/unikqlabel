import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Award, Sparkles, ChevronRight, Check, Loader2, Crown } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"

function CollectionCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart()
  const { settings } = useSettings()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const currency = settings?.currency_symbol || '₹'
  const variants = product.variants || [{ weight: product.weight, price: product.price }]
  const current = variants[selectedVariant]

  const handleAddToCart = () => {
    const discountPct = product.discount_price && product.discount_price > 0 && product.discount_price <= 100 ? Math.round(product.discount_price) : 0
    const basePrice = current.price
    const salePrice = discountPct > 0 ? Math.round(basePrice * (100 - discountPct) / 100) : basePrice
    
    addItem({
      id: `${product.id}-${current.weight}`,
      name: product.name,
      price: salePrice,
      originalPrice: discountPct > 0 ? basePrice : undefined,
      discountPercent: discountPct > 0 ? discountPct : undefined,
      weight: current.weight,
      image: product.image,
      category: product.category
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
      className="group relative rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
      style={{
        background: 'rgba(20,18,14,0.8)',
        border: '1px solid rgba(212,175,55,0.08)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />

      <div className="flex flex-col sm:flex-row gap-0">
        {/* Image */}
        <div className="relative w-full sm:w-44 flex-shrink-0 aspect-[4/3] sm:aspect-auto sm:h-44 overflow-hidden bg-[#111]">
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.7) 0%, transparent 60%)' }} />

          {/* Bestseller badge */}
          {product.bestseller && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'var(--theme-color)', color: '#0D0D0D' }}>
              <Crown className="w-2.5 h-2.5" />
              <span className="text-[8px] font-bold uppercase tracking-wider">Trending</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading text-base md:text-xl font-bold leading-tight group-hover:text-amber-500 transition-colors line-clamp-1"
              style={{ color: '#F5F0E8' }}>{product.name}</h3>
            {product.rating && (
              <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-body text-xs font-semibold text-amber-500">{product.rating}</span>
              </div>
            )}
          </div>

          {product.description && (
            <p className="font-body text-xs mb-3 line-clamp-2 hidden md:block" style={{ color: 'rgba(245,240,232,0.5)' }}>
              {product.description}
            </p>
          )}

          {/* Variants */}
          {variants.length > 1 && (
            <div className="mb-3">
              <p className="font-body text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(212,175,55,0.6)' }}>Size / Weight</p>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v, idx) => (
                  <button key={v.weight} onClick={() => setSelectedVariant(idx)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={selectedVariant === idx
                      ? { background: 'var(--theme-color)', color: '#0D0D0D' }
                      : { background: 'rgba(212,175,55,0.06)', color: 'rgba(245,240,232,0.6)', border: '1px solid rgba(212,175,55,0.15)' }
                    }>{v.weight}</button>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-3"
            style={{ borderTop: '1px solid rgba(212,175,55,0.06)' }}>
            <div>
              <p className="font-heading text-lg md:text-2xl font-black" style={{
                background: 'linear-gradient(135deg, #F0D060, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{currency}{current.price}</p>
              {variants.length === 1 && (
                <p className="font-body text-[10px]" style={{ color: 'rgba(245,240,232,0.4)' }}>{current.weight}</p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart} disabled={isAdded}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all"
              style={isAdded
                ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                : { background: 'linear-gradient(135deg, #D4AF37, #B8960A)', color: '#0D0D0D' }
              }
            >
              {isAdded ? <><Check className="w-3.5 h-3.5" /> Added</> : <><ShoppingBag className="w-3.5 h-3.5" /> Add</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function WomenPage() {
  useSeo({ pageType: 'page', pageSlug: 'women', fallbackTitle: 'Women Collection — UNIKQ LABEL' })
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    Promise.race([productService.getProductsByCategory("women"), t])
      .then(d => setItems(d as Product[]))
      .catch(() => import("@/data/products").then(m => setItems(m.getProductsByCategory("women"))))
      .finally(() => setLoading(false))
  }, [])

  const perks = [
    { icon: Award,    text: "Premium Quality" },
    { icon: Sparkles, text: "Exclusive Style" },
    { icon: Crown,    text: "Her Signature" },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#0D0D0D' }}>
      <Navbar />
      <PageHeader
        title="Women Collection"
        subtitle="Elegant, empowering, exclusive — curated pieces for the modern queen"
        backgroundImage="/images/collection-queen.jpg"
      />

      {/* Perks */}
      <section className="px-4 pb-10 -mt-8 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-3">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.1 }}
                className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl"
                style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.10)' }}
              >
                <perk.icon className="w-5 h-5 text-amber-500" />
                <span className="font-body text-xs md:text-sm text-center font-medium" style={{ color: '#F5F0E8' }}>{perk.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(212,175,55,0.3)' }} />
              <p className="font-body text-lg" style={{ color: 'rgba(245,240,232,0.4)' }}>Women Collection launching soon. Stay fabulous.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((product, index) => (
                <CollectionCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
