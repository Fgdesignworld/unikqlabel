

import { useState } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { motion } from "framer-motion"
import { Star, ShoppingBag, Leaf, Award, Clock, Sparkles, ChevronRight, Check } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { useCart } from "@/context/cart-context"
import { getProductsByCategory, type Product } from "@/data/products"

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/10 overflow-hidden hover:border-[#d97706]/40 transition-all duration-500"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d97706]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image Container */}
          <div className="relative">
            <div className="relative w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-[#0f0f0f]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Jar shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Bestseller badge */}
            {product.bestseller && (
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d97706] blur-lg opacity-50" />
                  <span className="relative flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-[#0f0f0f] text-xs font-bold rounded-full shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    Bestseller
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating!)
                          ? "text-[#f59e0b] fill-[#f59e0b]"
                          : "text-[#f59e0b]/30"
                      }`}
                    />
                  ))}
                  <span className="text-[#f59e0b] text-sm font-medium ml-1">
                    {product.rating}
                  </span>
                </div>
              )}

              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#fef3e2] mb-2 group-hover:text-[#d97706] transition-colors">
                {product.name}
              </h3>
              
              <p className="text-[#fef3e2]/60 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Pure Veg
                </span>
                <span className="px-2 py-1 bg-[#d97706]/10 text-[#d97706] text-xs rounded-full">
                  Homemade
                </span>
              </div>

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
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[#d97706] text-2xl font-bold">Rs.{currentVariant.price}</p>
                {variants.length === 1 && (
                  <p className="text-[#fef3e2]/40 text-sm">{currentVariant.weight}</p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex items-center gap-2 px-5 py-3 font-bold rounded-full transition-all ${
                  isAdded
                    ? "bg-green-600 text-white"
                    : "bg-gradient-to-r from-[#d97706] to-[#b45309] text-[#0f0f0f] hover:shadow-lg hover:shadow-[#d97706]/30"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
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
  const pickles = getProductsByCategory("pickles")

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

      {/* Pickles Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pickles.map((product, index) => (
              <PickleCard key={product.id} product={product} index={index} />
            ))}
          </div>
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
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
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
