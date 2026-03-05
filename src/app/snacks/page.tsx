

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { getProductsByCategory } from "@/data/products"

export default function SnacksPage() {
  const snacks = getProductsByCategory("snacks")

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="Traditional Snacks"
        subtitle="Crispy, crunchy, and delicious homemade snacks made with authentic recipes"
      />

      {/* Products Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {snacks.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
