"use client"

import { useState, useEffect } from "react"
import { Sparkles, Leaf, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductFilters } from "@/components/product-filters"
import { productService } from "@/services/productService"
import { categoryService, type Category } from "@/services/categoryService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"
import { motion } from "framer-motion"

const SLUG = "hair-care"
const FALLBACK_SLUG = "women"

export default function HairCarePage() {
  useSeo({ pageType: "page", pageSlug: "hair-care", fallbackTitle: "Premium Hair Care — Aarvia" })
  const [allItems, setAllItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [subCats, setSubCats] = useState<Category[]>([])
  const [activeSub, setActiveSub] = useState("")

  useEffect(() => {
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000))
    Promise.all([
      categoryService.getTree().catch(() => [] as Category[]),
      Promise.race([productService.getPublicProducts(), timeout]).catch(() => []),
    ]).then(([tree, products]) => {
      // Find category in tree
      let node = (tree as Category[]).find(c => c.slug === SLUG)
      let currentSlug = SLUG
      if (!node) {
        node = (tree as Category[]).find(c => c.slug === FALLBACK_SLUG)
        currentSlug = FALLBACK_SLUG
      }
      const subs = node?.subcategories ?? []
      setSubCats(subs)
      const slugSet = new Set([currentSlug, ...subs.map(s => s.slug)])
      setAllItems((products as Product[]).filter(p => slugSet.has(p.category)))
    }).catch(() => {
      import("@/data/products").then(m => setAllItems(m.getProductsByCategory(FALLBACK_SLUG)))
    }).finally(() => setLoading(false))
  }, [])

  const perks = [
    { icon: Leaf, text: "Scalp Nourishment" },
    { icon: Sparkles, text: "Active Botanicals" },
    { icon: Award, text: "Salon Quality" },
  ]

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />
      <PageHeader
        title="Hair Care Solutions"
        subtitle="Ethically sourced, science-backed botanical treatments to nourish, strengthen, and revitalize your hair."
        backgroundImage="https://images.unsplash.com/photo-1527799822367-a2505d993e51?q=80&w=1200&auto=format&fit=crop"
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
            searchPlaceholder="Search hair care collection…"
            subcategories={subCats}
            allLabel="All Hair Care"
            activeSubcategory={activeSub}
            onSubcategoryChange={setActiveSub}
            emptyIcon={<Sparkles className="w-14 h-14 mx-auto mb-6" style={{ color: "rgba(200,169,107,0.35)" }} />}
            emptyMessage="Hair Care Collection coming soon."
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
