


import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/productService"
import type { Product } from "@/data/products"
import { useSeo } from "@/hooks/use-seo"

export default function SpicesPage() {
  useSeo({ pageType: 'page', pageSlug: 'spices', fallbackTitle: 'Spice Powders — Lakshmi Home Foods' })
  const [spices, setSpices] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getProductsByCategory("spices")
      .then(setSpices)
      .catch(() => {
        import("@/data/products").then(m => setSpices(m.getProductsByCategory("spices")))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="Spice Powders"
        subtitle="Fresh ground spices and karam powders for authentic Andhra flavor"
        backgroundImage="/images/spices.jpg"
      />

      {/* Info Banner */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          <div className="p-6 bg-gradient-to-r from-[#d97706]/10 to-[#7f1d1d]/10 rounded-2xl border border-[#d97706]/20 text-center">
            <p className="text-[#fef3e2]/80">
              All our spice powders are available in <span className="text-[#d97706] font-bold">250g</span> packs. 
              Fresh ground and packed with authentic flavors.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#d97706] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {spices.map((product, index) => (
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
