

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { products, categories } from "@/data/products"

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter)

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="Our Products"
        subtitle="Authentic homemade traditional foods made with love and care"
      />

      {/* Filter Buttons */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                activeFilter === "all"
                  ? "bg-[#d97706] text-[#0f0f0f]"
                  : "bg-[#d97706]/10 text-[#fef3e2] hover:bg-[#d97706]/20"
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all capitalize ${
                  activeFilter === category.id
                    ? "bg-[#d97706] text-[#0f0f0f]"
                    : "bg-[#d97706]/10 text-[#fef3e2] hover:bg-[#d97706]/20"
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#fef3e2]/60 text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
