"use client"

import { useState, useEffect } from "react"
import { Sparkles, Star, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductFilters } from "@/components/product-filters"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"
import { motion } from "framer-motion"

export default function BestSellersPage() {
  useSeo({ pageType: "page", pageSlug: "best-sellers", fallbackTitle: "Best Sellers — Aarvia" })
  const [allItems, setAllItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000))
    Promise.race([productService.getPublicProducts(), timeout])
      .then((products) => {
        setAllItems((products as Product[]).filter(p => p.bestseller))
      })
      .catch(() => {
        import("@/data/products").then(m => setAllItems(m.getBestsellers()))
      })
      .finally(() => setLoading(false))
  }, [])

  const perks = [
    { icon: Star, text: "Customer Favorites" },
    { icon: Sparkles, text: "Proven Efficacy" },
    { icon: Award, text: "Award Winning" },
  ]

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />
      <PageHeader
        title="Our Best Sellers"
        subtitle="Experience our most-loved botanical formulations, recommended by skin and wellness experts."
        backgroundImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"
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
                className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl backdrop-blur-md"
                style={{ background: "rgba(31,77,58,0.03)", border: "1px solid rgba(200,169,107,0.15)" }}
              >
                <perk.icon className="w-5 h-5" style={{ color: "#C8A96B" }} />
                <span className="font-sans text-xs md:text-sm text-center font-semibold" style={{ color: "#1F4D3A" }}>{perk.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-7xl">
          <ProductFilters
            products={allItems}
            loading={loading}
            searchPlaceholder="Search our best sellers…"
            subcategories={[]}
            allLabel="All Best Sellers"
            activeSubcategory=""
            onSubcategoryChange={() => {}}
            emptyIcon={<Sparkles className="w-14 h-14 mx-auto mb-6" style={{ color: "rgba(200,169,107,0.35)" }} />}
            emptyMessage="No best sellers available yet."
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
