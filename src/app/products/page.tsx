


import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, SlidersHorizontal, X, Leaf, Circle, ChevronDown, ChevronUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { useSeo } from "@/hooks/use-seo"
import { productService } from "@/services/productService"
import { categories } from "@/data/products"
import type { Product } from "@/data/products"

// ─── helpers ───────────────────────────────────────────────────
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export default function ProductsPage() {
  useSeo({ pageType: 'page', pageSlug: 'products', fallbackTitle: 'All Products — Lakshmi Home Foods' })

  const [searchParams, setSearchParams] = useSearchParams()

  // ── All products (fetched once) ──────────────────────────────
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── Price bounds (computed from loaded data) ─────────────────
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 5000])

  // ── Filter state — read initially from URL ───────────────────
  const [category, setCategory]     = useState(searchParams.get('category') || 'all')
  const [vegFilter, setVegFilter]   = useState<'all' | 'veg' | 'non-veg'>(
    (searchParams.get('veg') as 'all' | 'veg' | 'non-veg') || 'all'
  )
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get('min_price')) || 0)
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('max_price')) || 9999)

  // ── Load products ─────────────────────────────────────────────
  useEffect(() => {
    productService.getPublicProducts()
      .then(data => {
        setAllProducts(data)
        const prices = data.map(p => p.price)
        const lo = Math.floor(Math.min(...prices))
        const hi = Math.ceil(Math.max(...prices))
        setPriceBounds([lo, hi])
        // Only initialise price range from URL or full range
        setMinPrice(prev => prev === 0 && !searchParams.get('min_price') ? lo : prev)
        setMaxPrice(prev => prev === 9999 && !searchParams.get('max_price') ? hi : prev)
      })
      .catch(() => import("@/data/products").then(m => setAllProducts(m.products)))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync filters → URL ────────────────────────────────────────
  useEffect(() => {
    const params: Record<string, string> = {}
    if (category !== 'all')   params.category  = category
    if (vegFilter !== 'all')  params.veg       = vegFilter
    if (minPrice > priceBounds[0]) params.min_price = String(minPrice)
    if (maxPrice < priceBounds[1]) params.max_price = String(maxPrice)
    setSearchParams(params, { replace: true })
  }, [category, vegFilter, minPrice, maxPrice, priceBounds, setSearchParams])

  // ── Derived: filtered list ────────────────────────────────────
  const filtered = useMemo(() => {
    return allProducts.filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (vegFilter === 'veg' && !p.isVeg)               return false
      if (vegFilter === 'non-veg' && p.isVeg !== false)  return false
      if (p.price < minPrice || p.price > maxPrice)      return false
      return true
    })
  }, [allProducts, category, vegFilter, minPrice, maxPrice])

  const hasActiveFilters =
    category !== 'all' || vegFilter !== 'all' ||
    minPrice > priceBounds[0] || maxPrice < priceBounds[1]

  const clearFilters = useCallback(() => {
    setCategory('all')
    setVegFilter('all')
    setMinPrice(priceBounds[0])
    setMaxPrice(priceBounds[1])
  }, [priceBounds])

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="Our Products"
        subtitle="Authentic homemade traditional foods made with love and care"
        backgroundImage="/images/hero-bg.jpg"
      />

      <div className="container mx-auto max-w-7xl px-4 pb-20">
        {/* ── Category Tabs ── */}
        <section className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => setCategory('all')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                category === 'all' ? "bg-[#d97706] text-[#0f0f0f]" : "bg-[#d97706]/10 text-[#fef3e2] hover:bg-[#d97706]/20"
              }`}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all capitalize ${
                  category === cat.id ? "bg-[#d97706] text-[#0f0f0f]" : "bg-[#d97706]/10 text-[#fef3e2] hover:bg-[#d97706]/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </motion.div>
        </section>

        {/* ── Filter Bar ── */}
        <section className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle filter panel */}
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                filtersOpen || hasActiveFilters
                  ? "bg-[#d97706] text-[#0f0f0f] border-[#d97706]"
                  : "border-[#d97706]/20 text-[#fef3e2]/70 hover:border-[#d97706]/50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-black/20 text-[10px] font-black px-1.5 py-0.5 rounded-full">ON</span>
              )}
              {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Active filter chips */}
            {vegFilter !== 'all' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706]/10 border border-[#d97706]/20 text-[#d97706] rounded-xl text-xs font-semibold">
                {vegFilter === 'veg' ? <Leaf className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {vegFilter === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                <button onClick={() => setVegFilter('all')} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {(minPrice > priceBounds[0] || maxPrice < priceBounds[1]) && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706]/10 border border-[#d97706]/20 text-[#d97706] rounded-xl text-xs font-semibold">
                ₹{minPrice} – ₹{maxPrice}
                <button onClick={() => { setMinPrice(priceBounds[0]); setMaxPrice(priceBounds[1]) }} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#fef3e2]/40 hover:text-[#fef3e2]/80 underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            )}

            {/* Result count */}
            {!loading && (
              <span className="ml-auto text-xs text-[#fef3e2]/40 font-medium">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ── Expanded Filter Panel ── */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-6 bg-[#111] border border-[#d97706]/10 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Veg / Non-Veg Toggle */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#fef3e2]/40 mb-3">Dietary</p>
                    <div className="flex gap-2">
                      {(['all', 'veg', 'non-veg'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setVegFilter(v)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            vegFilter === v
                              ? v === 'veg' ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-400'
                                : v === 'non-veg' ? 'bg-red-900/60 border-red-500/50 text-red-400'
                                : 'bg-[#d97706]/20 border-[#d97706]/40 text-[#d97706]'
                              : 'border-white/10 text-[#fef3e2]/50 hover:border-white/20'
                          }`}
                        >
                          {v === 'veg' && <Leaf className="w-3 h-3" />}
                          {v === 'non-veg' && <Circle className="w-3 h-3" />}
                          {v === 'all' ? 'All' : v === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#fef3e2]/40 mb-3">
                      Price Range &nbsp;<span className="text-[#d97706] normal-case font-semibold tracking-normal">₹{minPrice} – ₹{maxPrice}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-[#fef3e2]/30 mb-1 block">Min price (₹)</label>
                        <input
                          type="number"
                          min={priceBounds[0]}
                          max={maxPrice}
                          value={minPrice}
                          onChange={e => setMinPrice(clamp(Number(e.target.value), priceBounds[0], maxPrice))}
                          className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d97706]/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#fef3e2]/30 mb-1 block">Max price (₹)</label>
                        <input
                          type="number"
                          min={minPrice}
                          max={priceBounds[1]}
                          value={maxPrice}
                          onChange={e => setMaxPrice(clamp(Number(e.target.value), minPrice, priceBounds[1]))}
                          className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d97706]/50"
                        />
                      </div>
                    </div>
                    {/* Visual range track */}
                    <div className="mt-3 relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 h-full bg-[#d97706] rounded-full transition-all"
                        style={{
                          left:  `${((minPrice - priceBounds[0]) / (priceBounds[1] - priceBounds[0])) * 100}%`,
                          right: `${100 - ((maxPrice - priceBounds[0]) / (priceBounds[1] - priceBounds[0])) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#d97706] animate-spin" />
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#fef3e2]/60 text-lg mb-4">No products match your filters.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-[#d97706] text-[#0f0f0f] font-semibold rounded-full hover:bg-[#f59e0b] transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
