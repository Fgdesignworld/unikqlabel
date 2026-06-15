import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Leaf } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductFilters } from "@/components/product-filters"
import { useSeo } from "@/hooks/use-seo"
import { productService } from "@/services/productService"
import { categoryService } from "@/services/categoryService"
import type { Category as ApiCategory } from "@/services/categoryService"
import { categories as staticCategories } from "@/data/products"
import type { Product } from "@/data/products"

export default function ProductsPage() {
  useSeo({ pageType: 'page', pageSlug: 'products', fallbackTitle: 'Collections — Aarvia' })

  const [searchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [category,  setCategory]  = useState(searchParams.get('category') || 'all')
  const [subcategory, setSubcategory] = useState(searchParams.get('sub') || '')
  const [categoryTree, setCategoryTree] = useState<ApiCategory[]>([])

  // Load category tree from API (with subcategories)
  useEffect(() => {
    categoryService.getTree()
      .then(tree => {
        if (tree && tree.length > 0) setCategoryTree(tree)
        else setCategoryTree(staticCategories.map((c, i) => ({ id: i + 1, name: c.name, slug: c.id, image: null, status: 'active' as const, sort_order: i, parent_id: null })))
      })
      .catch(() => {
        setCategoryTree(staticCategories.map((c, i) => ({ id: i + 1, name: c.name, slug: c.id, image: null, status: 'active' as const, sort_order: i, parent_id: null })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    Promise.race([productService.getPublicProducts(), t])
      .then(data => {
        setAllProducts(data as Product[])
      })
      .catch(() => import("@/data/products").then(m => setAllProducts(m.products)))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Build slug set for category filtering — pre-filter products for the selected main category
  const categoryFiltered = useMemo(() => {
    if (category === 'all') return allProducts
    const mainCat = categoryTree.find(c => c.slug === category)
    const slugs = new Set<string>([category])
    mainCat?.subcategories?.forEach(s => slugs.add(s.slug))
    return allProducts.filter(p => slugs.has(p.category))
  }, [allProducts, category, categoryTree])

  // Subcategories of the currently selected main category
  const activeSubs = useMemo(() => {
    if (category === 'all') return []
    return categoryTree.find(c => c.slug === category)?.subcategories ?? []
  }, [category, categoryTree])

  return (
    <main className="min-h-screen" style={{ background: '#F7F4ED' }}>
      <Navbar />
      
      {/* Page Hero */}
      <div className="relative pt-20" style={{ background: '#1F4D3A', minHeight: '220px', display: 'flex', alignItems: 'flex-end', paddingBottom: '0' }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pb-12 pt-16">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#C8A96B' }}>Collections</p>
          <h1 className="text-4xl md:text-5xl leading-tight font-serif font-light text-[#F7F4ED]">
            All Rituals & Products
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 pt-8">

        {/* ── Main Category Tabs ── */}
        <section className="pb-4 pt-2 border-b" style={{ borderColor: 'rgba(200,169,107,0.15)' }}>
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            <button 
              onClick={() => { setCategory('all'); setSubcategory('') }}
              className="shrink-0 flex items-center gap-1.5 px-6 py-3 font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-full border"
              style={category === 'all'
                ? { background: '#1F4D3A', color: '#F7F4ED', borderColor: '#1F4D3A' }
                : { background: 'transparent', color: '#1F4D3A', borderColor: 'rgba(200,169,107,0.25)' }}
            >
              <Leaf className="w-3.5 h-3.5" /> All
            </button>
            {categoryTree.map(cat => (
              <button 
                key={cat.slug}
                onClick={() => { setCategory(cat.slug); setSubcategory('') }}
                className="shrink-0 px-6 py-3 font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer rounded-full border"
                style={category === cat.slug
                  ? { background: '#1F4D3A', color: '#F7F4ED', borderColor: '#1F4D3A' }
                  : { background: 'transparent', color: '#1F4D3A', borderColor: 'rgba(200,169,107,0.25)' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Shared Filters + Grid ── */}
        <ProductFilters
          products={categoryFiltered}
          loading={loading}
          searchPlaceholder="Search products, collections, ingredients…"
          subcategories={activeSubs}
          allLabel={category === 'all' ? 'All' : `All ${categoryTree.find(c => c.slug === category)?.name}`}
          activeSubcategory={subcategory}
          onSubcategoryChange={setSubcategory}
        />

      </div>
      <Footer />
    </main>
  )
}
