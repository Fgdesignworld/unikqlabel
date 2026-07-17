"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { Leaf, Droplets, Heart } from "lucide-react"

export default function OrvivPage() {
  useSeo({ pageType: 'page', pageSlug: 'orviv', fallbackTitle: 'ORVIV — Home Wellness' })

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch products related to home wellness
    productService.getPublicProducts().then(products => {
      // For now, filter locally to simulate brand products
      const orvivProducts = products.filter(p => 
        p.category === 'home-wellness' || 
        p.category === 'kitchen-care' || 
        p.category === 'laundry-care' ||
        p.category === 'home-fragrance'
      )
      // Fallback if none found
      setProducts(orvivProducts.length > 0 ? orvivProducts.slice(0, 8) : products.slice(0, 4))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#FDFBF7' }}>
      <Navbar />

      <PageHeader 
        title="ORVIV" 
        subtitle="Home Wellness"
        backgroundImage="/images/heroes/shop-hero.png" 
      />

      {/* About Brand */}
      <section className="py-24 lg:py-32 bg-[#1F4D3A] text-[#FDFBF7] text-center px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] mb-6"
          >
            About ORVIV
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-light leading-tight mb-8"
          >
            Inspired by Nature. <br/> Crafted for Life.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-light font-sans opacity-90 leading-relaxed"
          >
            Helping create cleaner, healthier, and more beautiful homes through thoughtfully designed products. ORVIV brings the purity of botanical ingredients into your daily home rituals.
          </motion.p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 lg:py-28 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Leaf className="w-8 h-8 text-[#1F4D3A] mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-[#1F4D3A] mb-4">Plant Powered</h3>
              <p className="text-[#6A6A60] font-light">Harnessing the natural cleaning and purifying power of active botanicals.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Heart className="w-8 h-8 text-[#1F4D3A] mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-[#1F4D3A] mb-4">Family Safe</h3>
              <p className="text-[#6A6A60] font-light">Gentle formulations free from harsh synthetics, ensuring a safe haven for your loved ones.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Droplets className="w-8 h-8 text-[#1F4D3A] mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-[#1F4D3A] mb-4">Pure Fragrance</h3>
              <p className="text-[#6A6A60] font-light">Naturally scented with essential oils to uplift your home and mind.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Products */}
      <section className="py-20 lg:py-28 bg-[#F9F6F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1F4D3A] mb-4">Core Collection</h2>
            <p className="text-[#6A6A60]">Discover the essentials for a healthier home.</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-none overflow-hidden animate-pulse" style={{ aspectRatio: '3/4', background: 'rgba(31,77,58,0.06)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
