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
import { Sparkles, Sun, ShieldCheck } from "lucide-react"

export default function AarviaPage() {
  useSeo({ pageType: 'page', pageSlug: 'aarvia', fallbackTitle: 'AARVIA — Personal Care' })

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch products related to personal care
    productService.getProducts({ limit: 8 }).then(res => {
      // For now, filter locally to simulate brand products
      const aarviaProducts = res.data.filter(p => p.category_id === 'personal-care')
      // Fallback if none found
      setProducts(aarviaProducts.length > 0 ? aarviaProducts : res.data.slice(0, 4))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: '#FDFBF7' }}>
      <Navbar />

      <PageHeader 
        title="AARVIA" 
        subtitle="Personal Care"
        backgroundImage="/images/botanical_banner.png" 
      />

      {/* About Brand */}
      <section className="py-24 lg:py-32 bg-[#F5F2EC] text-[#1F4D3A] text-center px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] mb-6"
          >
            About AARVIA
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-light leading-tight mb-8"
          >
            Naturally You.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-light font-sans opacity-90 leading-relaxed text-[#6A6A60]"
          >
            Gentle personal care inspired by nature for everyday wellbeing. AARVIA is dedicated to nourishing your skin and body with the purest botanical extracts.
          </motion.p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 lg:py-28 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Sun className="w-8 h-8 text-[#C8A96B] mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-[#1F4D3A] mb-4">Everyday Glow</h3>
              <p className="text-[#6A6A60] font-light">Restoring your natural radiance with formulations that respect your skin's balance.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Sparkles className="w-8 h-8 text-[#C8A96B] mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-[#1F4D3A] mb-4">Luxurious Textures</h3>
              <p className="text-[#6A6A60] font-light">Elevating your daily routine into a moment of pure indulgence and self-care.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <ShieldCheck className="w-8 h-8 text-[#C8A96B] mx-auto mb-6" />
              <h3 className="font-serif text-2xl text-[#1F4D3A] mb-4">Dermatologically Tested</h3>
              <p className="text-[#6A6A60] font-light">Clinically validated for safety and efficacy without compromising on natural purity.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Products */}
      <section className="py-20 lg:py-28 bg-white border-t border-[#C8A96B]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1F4D3A] mb-4">Core Collection</h2>
            <p className="text-[#6A6A60]">Nourishing care for your body and mind.</p>
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
