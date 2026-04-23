import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Search, X, Crown } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ProductCard } from "@/components/product-card"
import { useSeo } from "@/hooks/use-seo"
import { productService } from "@/services/productService"
import { categoryService } from "@/services/categoryService"
import type { Category as ApiCategory } from "@/services/categoryService"
import { categories as staticCategories } from "@/data/products"
import type { Product } from "@/data/products"

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

function DualRangeSlider({ min, max, lo, hi, onChange }: {
  min: number; max: number; lo: number; hi: number
  onChange: (lo: number, hi: number) => void
}) {
  const range = max - min || 1
  const loP   = ((lo - min) / range) * 100
  const hiP   = ((hi - min) / range) * 100
  return (
    <div className="relative h-6 flex items-center select-none">
      <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)' }}>
        <div className="absolute h-full rounded-full" style={{
          left: `${loP}%`, right: `${100 - hiP}%`,
          background: 'linear-gradient(90deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 90%, white))',
        }} />
      </div>
      <div className="absolute w-4 h-4 rounded-full border-2 shadow-lg pointer-events-none"
        style={{ left: `calc(${loP}% - 8px)`, background: 'var(--theme-color)', borderColor: '#0D0D0D', boxShadow: '0 0 10px color-mix(in srgb, var(--theme-color) 40%, transparent)' }} />
      <div className="absolute w-4 h-4 rounded-full border-2 shadow-lg pointer-events-none"
        style={{ left: `calc(${hiP}% - 8px)`, background: 'var(--theme-color)', borderColor: '#0D0D0D', boxShadow: '0 0 10px color-mix(in srgb, var(--theme-color) 40%, transparent)' }} />
      <input type="range" min={min} max={max} value={lo} step={1}
        onChange={e => onChange(Math.min(+e.target.value, hi - 1), hi)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ zIndex: loP > 90 ? 5 : 3 }} />
      <input type="range" min={min} max={max} value={hi} step={1}
        onChange={e => onChange(lo, Math.max(+e.target.value, lo + 1))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ zIndex: 4 }} />
    </div>
  )
}

export default function ProductsPage() {
  useSeo({ pageType: 'page', pageSlug: 'products', fallbackTitle: 'All Collections — UNIKQ LABEL' })

  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 5000])
  const [search,    setSearch]    = useState(searchParams.get('q') || '')
  const [category,  setCategory]  = useState(searchParams.get('category') || 'all')
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get('min_price')) || 0)
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('max_price')) || 9999)
  const [dynamicCategories, setDynamicCategories] = useState<ApiCategory[]>([])

  // Load categories from API, fallback to static list
  useEffect(() => {
    categoryService.getActive()
      .then(cats => {
        if (cats && cats.length > 0) setDynamicCategories(cats)
        else setDynamicCategories(staticCategories.map((c, i) => ({ id: i + 1, name: c.name, slug: c.id, image: null, status: 'active' as const, sort_order: i })))
      })
      .catch(() => {
        setDynamicCategories(staticCategories.map((c, i) => ({ id: i + 1, name: c.name, slug: c.id, image: null, status: 'active' as const, sort_order: i })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    Promise.race([productService.getPublicProducts(), t])
      .then(data => {
        const d = data as Product[]
        setAllProducts(d)
        if (d.length > 0) {
          const prices = d.map(p => p.price)
          const lo = Math.floor(Math.min(...prices))
          const hi = Math.ceil(Math.max(...prices))
          setPriceBounds([lo, hi])
          setMinPrice(prev => prev === 0 && !searchParams.get('min_price') ? lo : prev)
          setMaxPrice(prev => prev === 9999 && !searchParams.get('max_price') ? hi : prev)
        }
      })
      .catch(() => import("@/data/products").then(m => setAllProducts(m.products)))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (search)               params.q         = search
    if (category !== 'all')   params.category  = category
    if (minPrice > priceBounds[0]) params.min_price = String(minPrice)
    if (maxPrice < priceBounds[1]) params.max_price = String(maxPrice)
    setSearchParams(params, { replace: true })
  }, [search, category, minPrice, maxPrice, priceBounds, setSearchParams])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allProducts.filter(p => {
      if (q && !p.name.toLowerCase().includes(q))        return false
      if (category !== 'all' && p.category !== category) return false
      if (p.price < minPrice || p.price > maxPrice)      return false
      return true
    })
  }, [allProducts, search, category, minPrice, maxPrice])

  const hasActiveFilters = !!search || category !== 'all' || minPrice > priceBounds[0] || maxPrice < priceBounds[1]
  const clearFilters = useCallback(() => {
    setSearch('')
    setCategory('all')
    setMinPrice(priceBounds[0])
    setMaxPrice(priceBounds[1])
  }, [priceBounds])

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-page)' }}>
      <Navbar />
      <PageHeader
        title="All Collections"
        subtitle="Shop the full UNIKQ LABEL universe — King, Queen, and Essentials"
        backgroundImage="/images/hero-bg.jpg"
      />

      <div className="container mx-auto max-w-7xl px-4 pb-24">

        {/* ── Search ── */}
        <section className="pt-8 pb-5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
              style={{ color: 'rgba(212,175,55,0.4)' }} />
            <input
              type="text"
              placeholder="Search styles, collections…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm transition-all outline-none"
              style={{
                background: 'rgba(212,175,55,0.04)',
                border: '1px solid rgba(212,175,55,0.12)',
                color: 'var(--text-primary)',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-ghost)' }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* ── Collection Filter Tabs ── */}
        <section className="pb-5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => setCategory('all')}
              className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
              style={category === 'all'
                ? { background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))', color: '#0D0D0D' }
                : { background: 'color-mix(in srgb, var(--theme-color) 8%, transparent)', color: 'var(--text-muted)', border: '1px solid color-mix(in srgb, var(--theme-color) 15%, transparent)' }
              }
            >
              <Crown className="w-3 h-3" /> All
            </button>
            {dynamicCategories.map(cat => (
              <button key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className="shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all"
                style={category === cat.slug
                  ? { background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))', color: '#0D0D0D' }
                  : { background: 'color-mix(in srgb, var(--theme-color) 8%, transparent)', color: 'var(--text-muted)', border: '1px solid color-mix(in srgb, var(--theme-color) 15%, transparent)' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Price Filter ── */}
        <section className="mb-5">
          <div className="p-5 rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid rgba(212,175,55,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>Price Range</p>
              <span className="font-body text-xs font-bold text-amber-500">₹{minPrice} – ₹{maxPrice}</span>
            </div>
            <DualRangeSlider min={priceBounds[0]} max={priceBounds[1]} lo={minPrice} hi={maxPrice}
              onChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi) }} />
            <div className="flex justify-between mt-2">
              <span className="font-body text-[10px]" style={{ color: 'var(--text-trace)' }}>₹{priceBounds[0]}</span>
              <span className="font-body text-[10px]" style={{ color: 'var(--text-trace)' }}>₹{priceBounds[1]}</span>
            </div>
          </div>
        </section>

        {/* ── Results Meta ── */}
        <div className="flex items-center gap-3 mb-6 min-h-6">
          {!loading && (
            <span className="font-body text-xs" style={{ color: 'var(--text-ghost)' }}>
              {filtered.length} style{filtered.length !== 1 ? 's' : ''} found
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="ml-auto flex items-center gap-1.5 text-xs transition-colors hover:opacity-100"
              style={{ color: 'rgba(212,175,55,0.6)' }}>
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(212,175,55,0.3)' }} />
            <p className="font-body text-lg mb-4" style={{ color: 'var(--text-ghost)' }}>No styles match your filters.</p>
            <button onClick={clearFilters} className="btn-primary text-sm"><span>Clear Filters</span></button>
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

      </div>
      <Footer />
    </main>
  )
}
