import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronDown, SlidersHorizontal, ArrowUpDown, Percent, Star, Loader2, Crown } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/data/products"
import type { Category } from "@/services/categoryService"

// ── Types ──

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'rating' | 'discount' | 'popularity'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance',  label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc',   label: 'Name: A to Z' },
  { value: 'name_desc',  label: 'Name: Z to A' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'rating',     label: 'Customer Rating' },
  { value: 'discount',   label: 'Discount' },
]

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']

// ── Sub-components ──

function DualRangeSlider({ min, max, lo, hi, onChange }: {
  min: number; max: number; lo: number; hi: number
  onChange: (lo: number, hi: number) => void
}) {
  const range = max - min || 1
  const loP   = ((lo - min) / range) * 100
  const hiP   = ((hi - min) / range) * 100
  return (
    <div className="relative h-6 flex items-center select-none">
      <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: 'rgba(200,169,107,0.15)' }}>
        <div className="absolute h-full rounded-full" style={{
          left: `${loP}%`, right: `${100 - hiP}%`,
          background: 'linear-gradient(90deg, #1F4D3A, #C8A96B)',
        }} />
      </div>
      <div className="absolute w-4 h-4 rounded-full border-2 shadow-md pointer-events-none"
        style={{ left: `calc(${loP}% - 8px)`, background: '#C8A96B', borderColor: '#1F4D3A', boxShadow: '0 2px 6px rgba(31,77,58,0.2)' }} />
      <div className="absolute w-4 h-4 rounded-full border-2 shadow-md pointer-events-none"
        style={{ left: `calc(${hiP}% - 8px)`, background: '#C8A96B', borderColor: '#1F4D3A', boxShadow: '0 2px 6px rgba(31,77,58,0.2)' }} />
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

function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const current = SORT_OPTIONS.find(o => o.value === value)
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="h-[45px] flex items-center gap-2 px-3.5 rounded-xl text-xs font-semibold transition-all duration-300 hover:bg-[#1F4D3A]/5 hover:border-[#1F4D3A]/30 hover:text-[#1F4D3A] cursor-pointer whitespace-nowrap"
        style={{ background: 'rgba(31,77,58,0.03)', border: '1px solid rgba(200,169,107,0.25)', color: '#1F4D3A' }}>
        <ArrowUpDown className="w-3.5 h-3.5 text-[#C8A96B]" />
        <span className="hidden sm:inline">Sort:</span> {current?.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-xl z-50"
            style={{ background: '#F7F4ED', border: '1px solid rgba(200,169,107,0.25)' }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: value === opt.value ? '#1F4D3A' : '#6F6A63',
                  background: value === opt.value ? 'rgba(31,77,58,0.06)' : 'transparent',
                }}>
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: 'rgba(200,169,107,0.08)', color: '#1F4D3A', border: '1px solid rgba(200,169,107,0.2)' }}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity cursor-pointer"><X className="w-3 h-3" /></button>
    </motion.span>
  )
}

// ── Sort helper ──

/** discount_price is the direct offer price (₹). Returns the final effective price. */
function effectivePrice(p: Product): number {
  if (p.discount_price && p.discount_price > 0 && p.discount_price < p.price) {
    return p.discount_price
  }
  return p.price
}

function getDiscountPct(p: Product): number {
  if (p.discount_price && p.discount_price > 0 && p.discount_price < p.price) {
    return ((p.price - p.discount_price) / p.price) * 100
  }
  return 0
}

function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const result = [...products]
  switch (sortBy) {
    case 'price_asc':
      result.sort((a, b) => effectivePrice(a) - effectivePrice(b))
      break
    case 'price_desc':
      result.sort((a, b) => effectivePrice(b) - effectivePrice(a))
      break
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'newest':
      result.sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0))
      break
    case 'rating':
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
    case 'discount':
      // sort by highest discount percentage first
      result.sort((a, b) => getDiscountPct(b) - getDiscountPct(a))
      break
    case 'popularity':
      result.sort((a, b) => {
        if (a.bestseller && !b.bestseller) return -1
        if (!a.bestseller && b.bestseller) return 1
        return (b.rating ?? 0) - (a.rating ?? 0)
      })
      break
    default:
      break
  }
  return result
}

// ── Main Component ──

export interface ProductFiltersProps {
  products: Product[]
  loading: boolean
  searchPlaceholder?: string
  /** Subcategories to show as pills (optional) */
  subcategories?: Category[]
  /** Label for "All" subcategory pill */
  allLabel?: string
  /** Active subcategory slug */
  activeSubcategory?: string
  /** Callback when subcategory changes */
  onSubcategoryChange?: (slug: string) => void
  /** Empty state icon override */
  emptyIcon?: React.ReactNode
  /** Empty state message when no products at all (no filters) */
  emptyMessage?: string
}

export function ProductFilters({
  products,
  loading,
  searchPlaceholder = 'Search styles, collections…',
  subcategories = [],
  allLabel = 'All',
  activeSubcategory = '',
  onSubcategoryChange,
  emptyIcon,
  emptyMessage = 'Collection coming soon.',
}: ProductFiltersProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set())
  const [onlyDiscount, setOnlyDiscount] = useState(false)
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Price bounds computed from effective (post-discount) prices
  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 5000]
    const prices = products.map(p => effectivePrice(p))
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [products])

  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(9999)

  // Reset price bounds when products load
  useEffect(() => {
    if (products.length > 0) {
      setMinPrice(prev => prev === 0 ? priceBounds[0] : prev)
      setMaxPrice(prev => prev === 9999 ? priceBounds[1] : prev)
    }
  }, [products.length, priceBounds])

  // Extract all available sizes
  const allSizes = useMemo(() => {
    const sizeSet = new Set<string>()
    products.forEach(p => {
      p.sizeVariants?.forEach(sv => sizeSet.add(sv.label))
    })
    return Array.from(sizeSet).sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.toUpperCase())
      const bi = SIZE_ORDER.indexOf(b.toUpperCase())
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
  }, [products])

  const toggleSize = useCallback((size: string) => {
    setSelectedSizes(prev => {
      const next = new Set(prev)
      if (next.has(size)) next.delete(size); else next.add(size)
      return next
    })
  }, [])

  // Filter + Sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let result = products.filter(p => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (activeSubcategory && p.category !== activeSubcategory) return false
      const ep = effectivePrice(p)
      if (ep < minPrice || ep > maxPrice) return false
      if (selectedSizes.size > 0 && p.sizeVariants) {
        const productSizes = p.sizeVariants.map(sv => sv.label)
        if (!productSizes.some(s => selectedSizes.has(s))) return false
      }
      if (selectedSizes.size > 0 && !p.sizeVariants) return false
      if (onlyDiscount && (!p.discount_price || p.discount_price <= 0 || p.discount_price >= p.price)) return false
      if (hideOutOfStock && p.totalStock !== null && p.totalStock !== undefined && p.totalStock <= 0) return false
      return true
    })
    return sortProducts(result, sortBy)
  }, [products, search, activeSubcategory, minPrice, maxPrice, selectedSizes, onlyDiscount, hideOutOfStock, sortBy])

  const activeFilterCount = (minPrice > priceBounds[0] || maxPrice < priceBounds[1] ? 1 : 0) + selectedSizes.size + (onlyDiscount ? 1 : 0) + (hideOutOfStock ? 1 : 0)
  const hasActiveFilters = !!search || activeFilterCount > 0 || sortBy !== 'relevance' || !!activeSubcategory

  const clearFilters = useCallback(() => {
    setSearch('')
    setSortBy('relevance')
    setSelectedSizes(new Set())
    setOnlyDiscount(false)
    setHideOutOfStock(false)
    setMinPrice(priceBounds[0])
    setMaxPrice(priceBounds[1])
    onSubcategoryChange?.('')
  }, [priceBounds, onSubcategoryChange])

  return (
    <>
      {/* ── Search + Sort Bar ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors text-[#1F4D3A]/40 group-focus-within:text-[#C8A96B]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-[45px] pl-11 pr-10 rounded-xl text-sm transition-all outline-none bg-white/40 backdrop-blur-sm border border-[#C8A96B]/20 focus:border-[#1F4D3A] focus:bg-white text-[#1F4D3A] placeholder-[#1F4D3A]/45"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-[#1F4D3A]/40 hover:text-[#1F4D3A] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* ── Subcategory Pills ── */}
      {subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-3">
          <button
            onClick={() => onSubcategoryChange?.('')}
            className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-102 cursor-pointer border ${
              !activeSubcategory
                ? 'bg-[#1F4D3A] text-[#F7F4ED] border-[#1F4D3A] shadow-sm shadow-[#1F4D3A]/10'
                : 'bg-[#1F4D3A]/5 hover:bg-[#1F4D3A]/10 text-[#1F4D3A]/70 hover:text-[#1F4D3A] border-transparent'
            }`}
          >
            {allLabel}
          </button>
          {subcategories.map(sub => {
            const isActive = activeSubcategory === sub.slug
            return (
              <button key={sub.slug}
                onClick={() => onSubcategoryChange?.(sub.slug)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-102 cursor-pointer border ${
                  isActive
                    ? 'bg-[#1F4D3A] text-[#F7F4ED] border-[#1F4D3A] shadow-sm shadow-[#1F4D3A]/10'
                    : 'bg-[#1F4D3A]/5 hover:bg-[#1F4D3A]/10 text-[#1F4D3A]/70 hover:text-[#1F4D3A] border-transparent'
                }`}
              >
                {sub.name}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Filter Toggle + Quick Filters ── */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button onClick={() => setShowFilters(!showFilters)}
          className="h-[45px] flex items-center gap-2 px-4 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer active:scale-95 border"
          style={{
            background: showFilters ? 'rgba(31,77,58,0.08)' : 'rgba(31,77,58,0.03)',
            borderColor: showFilters ? '#1F4D3A' : 'rgba(200,169,107,0.25)',
            color: '#1F4D3A',
          }}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: '#1F4D3A', color: '#F7F4ED', minWidth: '18px', height: '18px' }}>
              {activeFilterCount}
            </span>
          )}
        </button>
        <button onClick={() => setOnlyDiscount(!onlyDiscount)}
          className="h-[45px] flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer active:scale-95 border"
          style={{
            background: onlyDiscount ? 'rgba(31,77,58,0.08)' : 'rgba(31,77,58,0.03)',
            borderColor: onlyDiscount ? '#1F4D3A' : 'rgba(200,169,107,0.25)',
            color: '#1F4D3A',
          }}>
          <Percent className="w-3.5 h-3.5 text-[#C8A96B]" /> On Sale
        </button>
        <button onClick={() => setHideOutOfStock(!hideOutOfStock)}
          className="h-[45px] flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer active:scale-95 border"
          style={{
            background: hideOutOfStock ? 'rgba(31,77,58,0.08)' : 'rgba(31,77,58,0.03)',
            borderColor: hideOutOfStock ? '#1F4D3A' : 'rgba(200,169,107,0.25)',
            color: '#1F4D3A',
          }}>
          <Star className="w-3.5 h-3.5 text-[#C8A96B]" /> In Stock
        </button>
      </div>

      {/* ── Expandable Filter Panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Price Range */}
              <div className="p-4 rounded-xl bg-white/40 border border-[#C8A96B]/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/60">Price Range</p>
                </div>
                <DualRangeSlider min={priceBounds[0]} max={priceBounds[1]} lo={minPrice} hi={maxPrice}
                  onChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi) }} />
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1F4D3A]/40">₹</span>
                    <input type="number" value={minPrice}
                      onChange={e => { const v = Math.max(priceBounds[0], Math.min(Number(e.target.value) || 0, maxPrice - 1)); setMinPrice(v) }}
                      className="w-full pl-7 pr-2 py-2 rounded-lg text-xs font-semibold text-center outline-none bg-[#1F4D3A]/3 border border-[#C8A96B]/15 text-[#1F4D3A]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1F4D3A]/40">to</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1F4D3A]/40">₹</span>
                    <input type="number" value={maxPrice}
                      onChange={e => { const v = Math.min(priceBounds[1], Math.max(Number(e.target.value) || 0, minPrice + 1)); setMaxPrice(v) }}
                      className="w-full pl-7 pr-2 py-2 rounded-lg text-xs font-semibold text-center outline-none bg-[#1F4D3A]/3 border border-[#C8A96B]/15 text-[#1F4D3A]" />
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              {allSizes.length > 0 && (
                <div className="p-4 rounded-xl bg-white/40 border border-[#C8A96B]/20">
                  <p className="font-body text-[10px] font-bold uppercase tracking-widest mb-3 text-[#1F4D3A]/60">Variants / Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => {
                      const active = selectedSizes.has(size)
                      return (
                        <button key={size} onClick={() => toggleSize(size)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
                          style={{
                            background: active ? '#1F4D3A' : 'rgba(31,77,58,0.03)',
                            borderColor: active ? '#1F4D3A' : 'rgba(200,169,107,0.15)',
                            color: active ? '#F7F4ED' : '#1F4D3A',
                          }}>
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Filter Chips ── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 flex-wrap mb-5">
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {activeSubcategory && (
              <FilterChip
                label={subcategories.find(s => s.slug === activeSubcategory)?.name || activeSubcategory}
                onRemove={() => onSubcategoryChange?.('')}
              />
            )}
            {(minPrice > priceBounds[0] || maxPrice < priceBounds[1]) && (
              <FilterChip label={`₹${minPrice} – ₹${maxPrice}`} onRemove={() => { setMinPrice(priceBounds[0]); setMaxPrice(priceBounds[1]) }} />
            )}
            {Array.from(selectedSizes).map(size => (
              <FilterChip key={size} label={`Size: ${size}`} onRemove={() => toggleSize(size)} />
            ))}
            {onlyDiscount && <FilterChip label="On Sale" onRemove={() => setOnlyDiscount(false)} />}
            {hideOutOfStock && <FilterChip label="In Stock" onRemove={() => setHideOutOfStock(false)} />}
            {sortBy !== 'relevance' && (
              <FilterChip label={`Sort: ${SORT_OPTIONS.find(o => o.value === sortBy)?.label}`} onRemove={() => setSortBy('relevance')} />
            )}
            <button onClick={clearFilters}
              className="text-[11px] font-semibold transition-colors hover:opacity-80 ml-1 text-[#C8A96B] cursor-pointer">
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results Meta ── */}
      {!loading && (
        <div className="flex items-center justify-between mb-6 min-h-6">
          <span className="font-body text-xs text-[#1F4D3A]/60">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#1F4D3A]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          {emptyIcon || <Crown className="w-12 h-12 mx-auto mb-4 text-[#C8A96B]/30" />}
          <p className="font-body text-lg mb-4 text-[#1F4D3A]/60">
            {hasActiveFilters ? 'No products match your filters.' : emptyMessage}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1F4D3A] hover:bg-[#C8A96B] text-[#F7F4ED] hover:text-[#1F4D3A] transition-all duration-300 shadow-md cursor-pointer">Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </>
  )
}
