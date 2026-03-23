

import { useState, useEffect } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { motion } from "framer-motion"
import { Star, ShoppingBag, Leaf, Award, Clock, Sparkles, ChevronRight, Check, Circle, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useCart } from "@/context/cart-context"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"

function PickleCard({ product, index }: { product: Product; index: number }) {
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25), ease: "easeOut" }}
      className="group relative bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/10 overflow-hidden hover:border-[#d97706]/40 transition-all duration-500"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d97706]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-3 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
          {/* Image Container */}
          <div className="relative">
            <div className="relative w-full sm:w-40 aspect-[4/3] sm:h-40 rounded-xl md:rounded-2xl overflow-hidden bg-[#0f0f0f]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Jar shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60" />

              {/* Badges on Image */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {product.isVeg !== undefined && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                    product.isVeg 
                      ? "bg-[#064e3b]/90 text-[#10b981] border border-[#10b981]/20 backdrop-blur-sm" 
                      : "bg-red-900/90 text-red-400 border border-red-400/20 backdrop-blur-sm"
                  }`}>
                    {product.isVeg ? <Leaf className="w-2.5 h-2.5 fill-current" /> : <Circle className="w-2 h-2 fill-current" />}
                    <span className="hidden xs:inline">{product.isVeg ? "Veg" : "Non-Veg"}</span>
                  </div>
                )}
              </div>

              {product.bestseller && (
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-[#d97706] text-[#0f0f0f] text-[8px] font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm">
                  Best
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1 md:mb-2">
                <h3 className="font-serif text-sm md:text-2xl font-bold text-[#fef3e2] group-hover:text-[#d97706] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                {product.rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-[#f59e0b] fill-[#f59e0b]" />
                    <span className="text-[#f59e0b] text-[10px] md:text-sm font-medium">
                      {product.rating}
                    </span>
                  </div>
                )}
              </div>
              
              <p className="hidden md:block text-[#fef3e2]/60 text-[10px] md:text-sm mb-2 md:mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Weight Variants */}
              {variants.length > 1 && (
                <div className="mb-3 md:mb-4">
                  <p className="text-[#fef3e2]/50 text-[10px] md:text-xs mb-1.5 md:mb-2">Select Size:</p>
                  <div className="flex flex-nowrap items-center gap-1.5 md:gap-2">
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
            </div>

            {/* Price & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4 mt-auto pt-2 border-t border-[#d97706]/5">
              <div>
                <p className="text-[#d97706] text-base md:text-2xl font-bold">Rs.{currentVariant.price}</p>
                {variants.length === 1 && (
                  <p className="text-[#fef3e2]/40 text-[10px] md:text-sm">{currentVariant.weight}</p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 md:px-6 py-2 md:py-3 font-bold rounded-full transition-all text-xs md:text-sm ${
                  isAdded
                    ? "bg-green-600 text-white"
                    : "bg-gradient-to-r from-[#d97706] to-[#b45309] text-[#0f0f0f]"
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
        </div>
      </div>
    </motion.div>
  )
}

export default function PicklesPage() {
  const [pickles, setPickles] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getProductsByCategory("pickles")
      .then(setPickles)
      .catch(() => {
        import("@/data/products").then(m => setPickles(m.getProductsByCategory("pickles")))
      })
      .finally(() => setLoading(false))
  }, [])

  const features = [
    { icon: Leaf, text: "100% Vegetarian", color: "text-green-500" },
    { icon: Award, text: "No Preservatives", color: "text-[#d97706]" },
    { icon: Clock, text: "Traditional Recipe", color: "text-[#f59e0b]" },
  ]

  return (
    <main className="min-h-screen bg-[#0f0f0f] overflow-x-hidden">
      <Navbar />
      
      <PageHeader 
        title="Traditional Veg Pickles"
        subtitle="Handcrafted with love using grandmother's recipes. Pure ingredients, authentic taste, and generations of tradition in every jar."
        backgroundImage="/images/pickles.jpg"
      />

      {/* Feature badges (moved under header) */}
      <section className="px-4 pb-12 -mt-12 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1410]/80 backdrop-blur-md rounded-full border border-[#d97706]/20 shadow-xl"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-[#fef3e2]/80 text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pickles Grid - 2 columns on mobile */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#d97706] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
              {pickles.map((product: Product, index: number) => (
                <PickleCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Info Banner */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7f1d1d]/30 to-[#d97706]/20 p-8 md:p-12 border border-[#d97706]/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d97706]/10 rounded-full blur-3xl" />
            
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#fef3e2] mb-4">
                  Why Our Pickles are Special?
                </h2>
                <ul className="space-y-3">
                  {[
                    "Made with cold-pressed sesame oil",
                    "Sun-dried vegetables for authentic taste",
                    "No artificial colors or preservatives",
                    "Traditional stone grinding method",
                    "Perfect blend of spices from local farms",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
                      className="flex items-center gap-3 text-[#fef3e2]/80"
                    >
                      <ChevronRight className="w-5 h-5 text-[#d97706]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                <Image
                  src="/images/pickles.jpg"
                  alt="Traditional pickle making"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/60 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Combo Offer */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#d97706]/20 via-[#1a1410] to-[#7f1d1d]/20 p-8 md:p-12 border border-[#d97706]/30 text-center"
          >
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#f59e0b]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#7f1d1d]/20 rounded-full blur-3xl" />
            
            <span className="inline-block px-4 py-2 bg-[#d97706] text-[#0f0f0f] text-sm font-bold rounded-full mb-4">
              Special Combo Offer
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#fef3e2] mb-4">
              Pickle Lovers Pack
            </h2>
            <p className="text-[#fef3e2]/70 mb-6 max-w-xl mx-auto">
              Get any 3 pickles of your choice and save Rs.100! Perfect for families who love variety.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-[#fef3e2]/50 line-through">Rs.950</p>
                <p className="text-3xl font-bold text-[#d97706]">Rs.850</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://wa.me/918639424039?text=Hi! I'm interested in the Pickle Lovers Pack combo offer.", "_blank")}
                className="px-8 py-4 bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-[#0f0f0f] font-bold rounded-full hover:shadow-lg hover:shadow-[#d97706]/30 transition-all"
              >
                Order Combo Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
