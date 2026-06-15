import { useState, useEffect, useRef } from "react"
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ShoppingBag, Star, ArrowRight, Check, Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useSettings } from '@/context/settings-context'
import { productService } from "@/services/productService"
import type { Product, SizeVariant } from "@/data/products"
import { cn } from "@/lib/utils"

function MagneticButton({ children, onClick, disabled, className, style }: any) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left - rect.width / 2
    const mouseY = e.clientY - rect.top - rect.height / 2
    x.set(mouseX * 0.35)
    y.set(mouseY * 0.35)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      style={{ x: springX, y: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  )
}

function SignatureCard({ product, index }: { product: Product; index: number }) {
  const { addItem, items: cartItems } = useCart()
  const { settings } = useSettings()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 3D Card Tilt references and state
  const cardRef = useRef<HTMLDivElement>(null)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  
  const springTiltX = useSpring(tiltX, { stiffness: 100, damping: 15 })
  const springTiltY = useSpring(tiltY, { stiffness: 100, damping: 15 })

  const rotateCardX = useTransform(springTiltY, [-0.5, 0.5], [10, -10])
  const rotateCardY = useTransform(springTiltX, [-0.5, 0.5], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const x = e.clientX - rect.left - width / 2
    const y = e.clientY - rect.top - height / 2
    tiltX.set(x / width)
    tiltY.set(y / height)
  }

  const handleMouseLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
    setIsHovered(false)
  }

  // Cart logic
  const variants = product.variants || [{ weight: product.weight, price: product.price }]
  const currentVariant = variants[selectedVariant]
  const currency = settings?.currency_symbol || '₹'

  const basePrice = currentVariant.price
  const productDiscountPct = (product.discount_price && product.discount_price > 0 && product.discount_price < product.price)
    ? ((product.price - product.discount_price) / product.price) * 100
    : 0
  const discountPct = Math.round(productDiscountPct)
  const showDiscount = discountPct > 0
  const salePrice = showDiscount
    ? (currentVariant.price === product.price
        ? product.discount_price!
        : Math.round(basePrice * (1 - productDiscountPct / 100)))
    : basePrice

  const cartId = `${product.id}|${currentVariant.weight}||`
  const cartQty = cartItems.find(i => i.id === cartId)?.quantity ?? 0
  
  const maxStock = typeof product.totalStock === 'number' ? product.totalStock : null
  const remainingStock = maxStock !== null ? Math.max(0, maxStock - cartQty) : null
  const isOOS = remainingStock !== null && remainingStock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOOS) return
    addItem({
      id: cartId,
      productId: product.numericId,
      name: product.name,
      price: salePrice,
      originalPrice: discountPct > 0 ? basePrice : undefined,
      discountPercent: discountPct > 0 ? discountPct : undefined,
      weight: currentVariant.weight,
      image: product.image,
      category: product.category,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  // Descriptions helper for display
  const benefitText = product.id.includes("ashwagandha") 
    ? "Stress Relief & Focus" 
    : product.id.includes("shilajit")
      ? "Stamina & Physical Power"
      : "10g Pure Muscle Recovery"

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        rotateX: rotateCardX,
        rotateY: rotateCardY,
        transformStyle: "preserve-3d",
        background: "var(--surface-card)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "var(--card-shadow, 0 20px 40px rgba(0,0,0,0.08))"
      }}
      className="relative w-[290px] sm:w-[340px] flex-shrink-0 rounded-2xl border border-border p-6 flex flex-col group transition-all duration-300"
    >
      {/* Glow highlight behind pack */}
      <div 
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[45px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }}
      />

      {/* Floating shadow at bottom of card */}
      <div 
        className={cn(
          "absolute bottom-40 left-1/2 -translate-x-1/2 w-44 h-4 bg-black/40 rounded-full blur-md opacity-30 transition-all duration-500 pointer-events-none scale-x-[0.8] scale-y-[0.5]",
          isHovered && "scale-x-[0.95] scale-y-[0.6] blur-lg opacity-20"
        )}
      />

      {/* 3D Content Container */}
      <div style={{ transform: "translateZ(30px)" }} className="relative flex flex-col h-full">
        
        {/* Rating and weight tag */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border"
            style={{ background: "var(--surface-alt)" }}
          >
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="text-[10px] font-sans text-foreground font-bold">{product.rating}</span>
          </div>
          <span 
            className="text-[10px] tracking-wider uppercase border px-2.5 py-1 rounded-full text-primary font-sans font-bold"
            style={{
              background: "color-mix(in srgb, var(--theme-color) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--theme-color) 25%, transparent)"
            }}
          >
            {benefitText}
          </span>
        </div>

        {/* Floating Product Image */}
        <Link to={`/products/${product.id}`} className="relative h-56 flex items-center justify-center mb-6 overflow-hidden">
          <motion.img
            src={product.image}
            alt={product.name}
            animate={{
              y: isHovered ? -12 : 0,
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[80%] h-[80%] object-contain select-none pointer-events-none"
            style={{ filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.15))" }}
          />
        </Link>

        {/* Product Meta */}
        <div className="space-y-1 mb-4">
          <h3 className="font-serif text-2xl text-foreground font-medium group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Weight selection pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {variants.map((v, idx) => (
            <button
              key={v.weight}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVariant(idx) }}
              className="px-3 py-1 rounded text-[10px] font-semibold transition-all font-sans uppercase cursor-pointer"
              style={selectedVariant === idx
                ? { background: 'var(--theme-color)', color: '#0D0D0D' }
                : { background: 'var(--surface-alt)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {v.weight}
            </button>
          ))}
        </div>

        {/* Footer Pricing & CTA */}
        <div className="flex items-center justify-between mt-auto border-t border-border pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-sans text-primary">
                {currency}{salePrice}
              </span>
              {discountPct > 0 && (
                <span className="text-xs text-muted-foreground/60 line-through font-sans">{currency}{basePrice}</span>
              )}
            </div>
          </div>

          <MagneticButton
            onClick={handleAddToCart}
            disabled={isAdded || isOOS}
            className="flex items-center justify-center px-4 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 shadow-lg"
            style={isOOS
              ? { background: 'var(--surface-alt)', color: 'var(--text-ghost)', border: '1px solid var(--border)', cursor: 'not-allowed' }
              : isAdded
                ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                : { background: 'var(--theme-color)', color: '#0D0D0D' }
            }
          >
            {isAdded ? (
              <span className="flex items-center gap-1.5"><Check size={12} /> ADDED</span>
            ) : isOOS ? (
              <span>OUT OF STOCK</span>
            ) : (
              <span className="flex items-center gap-1.5"><ShoppingBag size={12} /> ADD TO CART</span>
            )}
          </MagneticButton>
        </div>

      </div>
    </motion.div>
  )
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Fetch with local fallback
  useEffect(() => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    )
    Promise.race([productService.getBestsellers(), timeout])
      .then(items => {
        // filter down to cookies or slice
        setProducts((items as Product[]).slice(0, 6))
      })
      .catch(() => {
        import("@/data/products").then(m => setProducts(m.getBestsellers()))
      })
      .finally(() => setLoading(false))
  }, [])

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = 340 + 24 // card width + gap
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <section id="collection" className="py-24 px-4 relative overflow-hidden" style={{ background: 'var(--surface-page)' }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="section-badge mb-4">Signature Collection</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mt-4 tracking-tight">
              Crafted For <br />
              <span className="text-gradient-gold italic">Pure Indulgence.</span>
            </h2>
          </div>
          
          {/* Custom navigation arrows */}
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <button
              onClick={() => scrollSlider('left')}
              className="w-12 h-12 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all focus:outline-none cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollSlider('right')}
              className="w-12 h-12 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all focus:outline-none cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : (
          <div 
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            {products.map((product, index) => (
              <div key={product.id} className="snap-start">
                <SignatureCard product={product} index={index} />
              </div>
            ))}
          </div>
        )}

        {/* Shop All Redirect */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 group hover:-translate-y-0.5"
            style={{
              border: '1px solid rgba(201, 164, 92, 0.4)',
              color: 'var(--theme-color)',
            }}
          >
            Discover All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  )
}
