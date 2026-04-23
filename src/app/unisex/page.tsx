import { useState, useEffect } from "react"
import { Loader2, Crown, Star, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"
import { motion } from "framer-motion"

const features = [
  { icon: Crown,    text: "Unisex Design", desc: "Made for all" },
  { icon: Star,     text: "Daily Fits",    desc: "Wear everywhere" },
  { icon: Sparkles, text: "Essential Styles", desc: "Wardrobe staples" },
]

export default function UnisexPage() {
  useSeo({ pageType: 'page', pageSlug: 'unisex', fallbackTitle: 'Unisex Collection — UNIKQ LABEL' })
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    Promise.race([productService.getProductsByCategory("unisex"), t])
      .then(d => setItems(d as Product[]))
      .catch(() => import("@/data/products").then(m => setItems(m.getProductsByCategory("unisex"))))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      <Navbar />
      <PageHeader
        title="Unisex Collection"
        subtitle="Rule together, dress together — the unisex collection for every king and queen"
        backgroundImage="/images/collection-essentials.jpg"
      />

      {/* Feature pills */}
      <section className="px-4 pb-10 -mt-8 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'var(--surface-card)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(12px)' }}
              >
                <f.icon className="w-4 h-4 text-amber-500" />
                <span className="font-body text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.text}</span>
                <span className="font-body text-xs" style={{ color: 'var(--text-faint)' }}>· {f.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro Banner */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl text-center"
            style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.10)' }}
          >
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
              UNIKQ Unisex are crafted for{' '}
              <span className="text-amber-500 font-semibold">both kings and queens</span>
              {' '}— versatile wardrobe staples you'll reach for every day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products */}
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
                Unisex Collection coming soon.
              </h2>
              <p className="font-body text-lg text-amber-500 font-semibold" style={{ color: 'var(--text-ghost)', opacity: 0.9 }}>Stay tuned.</p>
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
