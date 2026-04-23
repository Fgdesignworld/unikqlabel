import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Sparkles, Loader2, Crown } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"

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
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
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
                <span className="font-body text-xs md:text-sm text-center font-medium" style={{ color: 'var(--text-primary)' }}>{perk.text}</span>
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
              <Sparkles className="w-14 h-14 mx-auto mb-6" style={{ color: 'rgba(212,175,55,0.35)' }} />
              <h2 className="font-heading text-4xl md:text-5xl font-black mx-auto mb-2" style={{ color: 'var(--text-ghost)', maxWidth: '900px' }}>
                Women Collection coming soon.
              </h2>
              <p className="font-body text-lg text-amber-500 font-semibold" style={{ color: 'var(--text-ghost)', opacity: 0.9 }}>Stay fabulous.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {items.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
