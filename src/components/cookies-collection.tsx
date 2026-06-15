import { useState, useEffect } from "react"
import { ShoppingBag, Check, ChevronLeft, ChevronRight, Eye, Share2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { productService } from "@/services/productService"
import { useNavigate } from "react-router-dom"
import type { Product } from "@/data/products"

interface CookiesCardProps {
  product: Product
  onProductClick?: (product: Product) => void
}

function CookiesCard({ product, onProductClick }: CookiesCardProps) {
  const { addItem } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const currency = "₹"

  const discountPrice = product.discount_price ?? null
  const basePrice = product.price
  const hasDiscount = discountPrice !== null && discountPrice > 0 && discountPrice < basePrice
  const displayPrice = hasDiscount ? discountPrice : basePrice
  const originalPrice = hasDiscount ? basePrice : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      id: `${product.id}|${product.weight}||`,
      productId: product.numericId,
      name: product.name,
      price: displayPrice,
      originalPrice: originalPrice ?? undefined,
      discountPercent: hasDiscount ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : undefined,
      weight: product.weight,
      image: product.image,
      category: product.category,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = window.location.origin + `/products/${product.id}`
    const shareText = `Check out ${product.name} from KoffeeKup!`
    
    if (navigator.share) {
      navigator.share({
        title: "KoffeeKup",
        text: shareText,
        url: shareUrl,
      }).catch(() => {})
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert("Product link copied to clipboard!")
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onProductClick) {
      onProductClick(product)
    }
  }

  const resolveImg = (p?: string | null) => {
    if (!p) return "/images/placeholder.jpg"
    if (p.startsWith("http") || p.startsWith("/")) return p
    return `/api${p}`
  }

  return (
    <div 
      onClick={() => onProductClick && onProductClick(product)}
      className="bg-[#fcfaf7] border border-[#e8dfd1] rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.08)] hover:border-[#C9A45C]/40 transition-all duration-300 group cursor-pointer">
      {/* Product Image Container */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-center mb-6 overflow-hidden rounded-2xl" style={{ backgroundImage: "linear-gradient(to bottom right, #faf6f0, #f5ede3)" }}>
        <img
          src={resolveImg(product.image)}
          alt={product.name}
          className="w-[82%] h-[82%] object-contain transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.06))" }}
        />
        
        {/* Quick Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white text-[#1A1613] hover:bg-[#A57E37] hover:text-white shadow-lg transition-all duration-300"
            title="Share Product"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={handleViewDetails}
            className="p-3 rounded-full bg-white text-[#1A1613] hover:bg-[#A57E37] hover:text-white shadow-lg transition-all duration-300"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-[#A57E37] text-white px-4 py-2 rounded-full text-sm font-bold">
            -{Math.round(((basePrice - discountPrice) / basePrice) * 100)}%
          </div>
        )}
      </div>

      {/* Product Title */}
      <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1613] mb-2 leading-tight line-clamp-2">
        {product.name}
      </h3>

      {/* Price */}
      <div className="flex items-baseline justify-center gap-2 mb-6">
        <span className="text-[#1A1613] text-base md:text-lg font-bold font-mono">
          {currency}{displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {hasDiscount && (
          <span className="text-neutral-400 text-sm line-through font-mono">
            {currency}{originalPrice!.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {/* Action Buttons - Single Line */}
      <div className="w-full flex flex-row gap-3">
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3 px-6 rounded-full font-bold text-xs uppercase tracking-widest border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
            isAdded
              ? "bg-green-600 border-green-600 text-white"
              : "border-[#1A1613] text-[#1A1613] hover:bg-[#1A1613] hover:text-[#FAF6F0]"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={16} /> Added
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> Cart
            </>
          )}
        </button>
        <button
          onClick={handleViewDetails}
          className="flex-1 py-3 px-6 rounded-full font-bold text-xs uppercase tracking-widest border border-[#A57E37] text-[#A57E37] hover:bg-[#A57E37] hover:text-white transition-all duration-300 cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  )
}


export function CookiesCollection() {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    // Responsive items per view
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 3000)
    )
    Promise.race([productService.getPublicProducts(), timeout])
      .then((data) => {
        // Load all products for slider
        setProducts((data as Product[]).slice(0, 10))
      })
      .catch(() => {
        import("@/data/products").then((m) => setProducts(m.products.slice(0, 10)))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`, { state: { product } })
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = Math.max(0, products.length - itemsPerView)
      return prev >= maxSlide ? 0 : prev + 1
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = Math.max(0, products.length - itemsPerView)
      return prev <= 0 ? maxSlide : prev - 1
    })
  }

  const visibleProducts = products.slice(currentSlide, currentSlide + itemsPerView)
  const canSlide = products.length > itemsPerView

  return (
    <section
      id="collection"
      className="py-24 px-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/light_wood_texture.png')" }}
    >
      {/* Wood grain texturing overlays for warm luxury feel */}
      <div className="absolute inset-0 bg-[#F8F3EA]/35 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[#F5EBDD]/20 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-[#e2d6c3] pb-8">
          <div>
            <h2 className="font-sans text-lg md:text-xl font-bold uppercase tracking-wider text-neutral-800">
              KoffeeKup
            </h2>
            <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl font-black text-[#A57E37] mt-2 tracking-tight">
              Cookies Collection
            </h3>
          </div>

          {/* Top Right Section - Stats & Controls */}
          <div className="flex items-center gap-8 md:gap-12 flex-wrap">
            <div className="flex flex-col">
              <span className="font-serif text-3xl md:text-4xl font-black text-neutral-800 leading-none">10</span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mt-1">Products</span>
            </div>
            <div className="w-px h-8 bg-[#e2d6c3] hidden sm:block" />
            <div className="flex flex-col">
              <span className="font-serif text-3xl md:text-4xl font-black text-neutral-800 leading-none">20+</span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mt-1">Our Team</span>
            </div>
            <div className="w-px h-8 bg-[#e2d6c3] hidden sm:block" />
            <div className="flex flex-col">
              <span className="font-serif text-3xl md:text-4xl font-black text-neutral-800 leading-none">50+</span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mt-1">Happy Customers</span>
            </div>

            {/* Slider Controls */}
            {canSlide && (
              <div className="flex items-center gap-3">
                <div className="w-px h-8 bg-[#e2d6c3] hidden sm:block" />
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full border border-[#A57E37] text-[#A57E37] hover:bg-[#A57E37] hover:text-white transition-all duration-300 group"
                  title="Previous"
                  aria-label="Previous products"
                >
                  <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <div className="flex gap-2">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(Math.min(index, Math.max(0, products.length - itemsPerView)))}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index >= currentSlide && index < currentSlide + itemsPerView
                          ? "bg-[#A57E37] w-6"
                          : "bg-[#e2d6c3] hover:bg-[#d4c9b8]"
                      }`}
                      aria-label={`Go to product ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full border border-[#A57E37] text-[#A57E37] hover:bg-[#A57E37] hover:text-white transition-all duration-300 group"
                  title="Next"
                  aria-label="Next products"
                >
                  <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Slider */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {visibleProducts.map((product) => (
                <CookiesCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            {/* Mobile Slider Info */}
            {canSlide && (
              <div className="flex justify-center gap-2 mt-8 md:hidden">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(Math.min(index, Math.max(0, products.length - itemsPerView)))}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index >= currentSlide && index < currentSlide + itemsPerView
                        ? "bg-[#A57E37] w-6"
                        : "bg-[#e2d6c3]"
                    }`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
