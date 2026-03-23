


import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"

export default function SnacksPage() {
  useSeo({ pageType: 'page', pageSlug: 'snacks', fallbackTitle: 'Traditional Snacks — Lakshmi Home Foods' })
  const [snacks, setSnacks] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getProductsByCategory("snacks")
      .then(setSnacks)
      .catch(() => {
        import("@/data/products").then(m => setSnacks(m.getProductsByCategory("snacks")))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="Traditional Snacks"
        subtitle="Crispy, crunchy, and delicious homemade snacks made with authentic recipes"
        backgroundImage="/images/snacks.jpg"
      />

      {/* Products Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#d97706] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {snacks.map((product, index) => (
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
