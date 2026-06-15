'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, RefreshCw, Search, Save, AlertTriangle,
  CheckCircle2, XCircle, TrendingDown, Boxes,
  Layers, Edit3, X, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { productService, type ApiProduct } from '@/services/productService'
import { inventoryService, type InventoryRow, inventoryKey } from '@/services/inventoryService'

/* helpers */
const resolveImg = (p?: string | null) => {
  if (!p) return '/images/placeholder.jpg'
  if (p.startsWith('http') || p.startsWith('/')) return p
  return `/api${p}`
}

function groupByProduct(rows: InventoryRow[]): Record<number, InventoryRow[]> {
  const map: Record<number, InventoryRow[]> = {}
  for (const r of rows) {
    if (r.product_id == null) continue
    if (!map[r.product_id]) map[r.product_id] = []
    map[r.product_id].push(r)
  }
  return map
}

interface ProductSummary {
  product: ApiProduct
  rows: InventoryRow[]
  totalStock: number
  variantCount: number
  oosCount: number
  lowCount: number
  hasInventory: boolean
}

function buildSummary(product: ApiProduct, rows: InventoryRow[]): ProductSummary {
  const totalStock   = rows.reduce((s, r) => s + r.stock, 0)
  const variantCount = rows.length
  const oosCount     = rows.filter(r => r.stock === 0).length
  const lowCount     = rows.filter(r => r.stock > 0 && r.stock <= 10).length
  return { product, rows, totalStock, variantCount, oosCount, lowCount, hasInventory: rows.length > 0 }
}

function StatusChip({ label, variant }: { label: string; variant: 'ok' | 'low' | 'oos' | 'none' }) {
  const styles = {
    ok:   'bg-green-500/10 border-green-500/25 text-green-400',
    low:  'bg-amber-500/10 border-amber-500/25 text-amber-400',
    oos:  'bg-red-500/10   border-red-500/25   text-red-400',
    none: 'bg-gray-800     border-slate-300     text-gray-500',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${styles[variant]}`}>
      {label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border bg-slate-50 ${color}`}>
      <div className={`p-2 rounded-xl border ${color} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Inventory Drawer — 60% right side, same pattern as SEO page ── */
function InventoryDrawer({
  summary, onClose, onSaved,
}: {
  summary: ProductSummary
  onClose: () => void
  onSaved: (productId: number, rows: InventoryRow[]) => void
}) {
  const { product, rows } = summary
  const { toast } = useToast()

  const [localMap, setLocalMap] = useState<Record<string, number>>({})
  const [saving, setSaving]     = useState(false)
  const [dirty, setDirty]       = useState(false)
  // Track which product we last initialised so we can detect a product switch
  const initialisedForRef = useState<number | null>(null)
  const dirtyRef = { current: dirty }
  dirtyRef.current = dirty

  const sizes  = useMemo(() => (product.variants_json      ?? []).map(v => v.label), [product])
  const colors = useMemo(() => (product.color_variants_json ?? []).map(v => v.color), [product])

  const combos = useMemo(() => {
    if (sizes.length > 0 && colors.length > 0)
      return sizes.flatMap(s => colors.map(c => ({ size: s, color: c, key: inventoryKey(s, c) })))
    if (sizes.length > 0)
      return sizes.map(s => ({ size: s, color: null as string | null, key: inventoryKey(s, null) }))
    if (colors.length > 0)
      return colors.map(c => ({ size: null as string | null, color: c, key: inventoryKey(null, c) }))
    return [{ size: null as string | null, color: null as string | null, key: inventoryKey(null, null) }]
  }, [sizes, colors])

  useEffect(() => {
    if (initialisedForRef[0] !== product.id) {
      initialisedForRef[1](product.id)
      // Show prop rows instantly (no flash), then silently re-fetch fresh data
      // so post-order decrements are reflected without waiting for auto-refresh
      const mapFromProps: Record<string, number> = {}
      for (const r of rows) mapFromProps[inventoryKey(r.size, r.color)] = r.stock
      setLocalMap(mapFromProps)
      setDirty(false)

      inventoryService.getForProduct(product.id)
        .then(fresh => {
          if (fresh.length > 0) {
            const freshMap: Record<string, number> = {}
            for (const r of fresh) freshMap[inventoryKey(r.size, r.color)] = r.stock
            setLocalMap(freshMap)
            onSaved(product.id, fresh) // sync the parent table row too
          }
        })
        .catch(() => { /* keep prop rows on network error */ })
    } else if (!dirtyRef.current) {
      // Background 30s refresh arrived and nothing is unsaved — silently sync
      const map: Record<string, number> = {}
      for (const r of rows) map[inventoryKey(r.size, r.color)] = r.stock
      setLocalMap(map)
    }
    // If dirtyRef.current === true, skip — user has unsaved edits, don't overwrite
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, rows])

  const handleChange = (key: string, val: number) => {
    setLocalMap(prev => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const rowsToSave = combos.map(c => ({ size: c.size, color: c.color, stock: localMap[c.key] ?? 0 }))
      const saved = await inventoryService.bulkSave(product.id, rowsToSave)
      onSaved(product.id, saved)
      setDirty(false)
      toast({ title: `Stock saved for ${product.name}!` })
    } catch {
      toast({ title: 'Save failed. Please try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const totalStock   = combos.reduce((s, c) => s + (localMap[c.key] ?? 0), 0)
  const oosCount     = combos.filter(c => (localMap[c.key] ?? 0) === 0).length
  const lowCount     = combos.filter(c => { const v = localMap[c.key] ?? 0; return v > 0 && v <= 10 }).length
  const inStockCount = combos.length - oosCount

  return (
    <div className="fixed inset-0 z-60 flex">
      <div className="flex-1 bg-slate-800/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full md:w-[60%] md:min-w-[480px] md:max-w-4xl bg-white border-l border-slate-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img src={resolveImg(product.image)} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-slate-900 font-black text- leading-tight truncate">{product.name}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-xs text-gray-500 capitalize">{product.category} · ID {product.id}</p>
              <Link
                to={`/admin/products/${product.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 font-bold"
              >
                <Edit3 className="w-3 h-3" /> Edit product
              </Link>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-50 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live stat bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4 border-b border-slate-200/80 shrink-0">
          <StatCard icon={Boxes}        label="Total Stock"  value={totalStock}    sub="all variants"           color="border-amber-500/20  text-amber-400"  />
          <StatCard icon={CheckCircle2} label="In Stock"     value={inStockCount}  sub={`of ${combos.length}`}  color="border-green-500/20  text-green-400"  />
          <StatCard icon={XCircle}      label="Out of Stock" value={oosCount}      sub="variants"               color="border-red-500/20    text-red-400"    />
          <StatCard icon={TrendingDown} label="Low (<=10)"   value={lowCount}      sub="variants"               color="border-orange-500/20 text-orange-400" />
        </div>

        {/* Variant table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {combos.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
              <Layers className="w-10 h-10 mx-auto text-gray-800 mb-3" />
              <p className="text-gray-500 text-sm font-bold">No variants configured</p>
              <p className="text-gray-700 text-xs mt-1">Add size or colour variants to the product first.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {sizes.length  > 0 && <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Size</th>}
                  {colors.length > 0 && <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Color</th>}
                  <th className="text-left pb-3 pr-6 text-[10px] font-black uppercase tracking-widest text-gray-600">Stock</th>
                  <th className="text-left pb-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40">
                {combos.map(combo => {
                  const stock = localMap[combo.key] ?? 0
                  const isOos = stock === 0
                  const isLow = stock > 0 && stock <= 10
                  const cv    = product.color_variants_json?.find(x => x.color === combo.color)
                  return (
                    <tr key={combo.key} className={cn('transition-colors', isOos ? 'bg-red-500/[0.04]' : '')}>
                      {sizes.length > 0 && (
                        <td className="py-3.5 pr-4">
                          {combo.size
                            ? <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-black font-mono">{combo.size}</span>
                            : <span className="text-gray-600 text-xs">-</span>}
                        </td>
                      )}
                      {colors.length > 0 && (
                        <td className="py-3.5 pr-4">
                          {combo.color ? (
                            <div className="flex items-center gap-2">
                              {cv && <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: cv.hex }} />}
                              <span className="text-slate-800 text-sm font-semibold">{combo.color}</span>
                            </div>
                          ) : <span className="text-gray-600 text-xs">-</span>}
                        </td>
                      )}
                      <td className="py-3.5 pr-6">
                        <input
                          type="number"
                          min={0}
                          value={stock}
                          onChange={e => handleChange(combo.key, Math.max(0, parseInt(e.target.value) || 0))}
                          className={cn(
                            'w-28 px-3 py-2 rounded-xl text-sm font-bold text-center outline-none transition-all',
                            isOos
                              ? 'bg-red-500/10 border border-red-500/30 text-red-300 focus:border-red-400'
                              : isLow
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 focus:border-amber-400'
                              : 'bg-[#F4F6FB] border border-slate-200 text-slate-800 focus:border-amber-500/50',
                          )}
                        />
                      </td>
                      <td className="py-3.5">
                        {isOos ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/10 border border-red-500/20 text-red-400">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <TrendingDown className="w-3 h-3" /> Low ({stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-500/10 border border-green-500/20 text-green-400">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {combos.length > 0 && (
            <p className="text-[10px] text-gray-700 mt-5">
              Stock is validated server-side at checkout. Cancelling an order automatically restores stock.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-[11px] text-gray-600">
            {dirty ? <span className="text-amber-400 font-bold">Unsaved changes</span> : 'All changes saved'}
          </p>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all',
              dirty && !saving
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-white border border-slate-200 text-gray-600 cursor-not-allowed',
            )}
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function AdminInventoryPage() {
  const [products, setProducts]         = useState<ApiProduct[]>([])
  const [allRows, setAllRows]           = useState<InventoryRow[]>([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [loadError, setLoadError]       = useState<string | null>(null)
  const [openId, setOpenId]             = useState<number | null>(null)
  const [search, setSearch]             = useState('')
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'oos' | 'low' | 'ok'>('all')

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setLoadError(null)
    try {
      const prods = await productService.adminGetAll()
      setProducts(prods)
      try {
        const rows = await inventoryService.getAllInventory()
        setAllRows(rows)
      } catch {
        setLoadError('Could not load stock data. Products are shown but stock values may be stale.')
      }
      setLastUpdated(new Date())
    } catch {
      setLoadError('Failed to load products. Please refresh.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), 30_000)
    return () => clearInterval(timer)
  }, [load])

  const grouped   = useMemo(() => groupByProduct(allRows), [allRows])
  const summaries = useMemo<ProductSummary[]>(
    () => products.map(p => buildSummary(p, grouped[p.id] ?? [])),
    [products, grouped],
  )

  const filtered = useMemo(() => {
    let list = summaries
    const q = search.toLowerCase().trim()
    if (q) list = list.filter(s => s.product.name.toLowerCase().includes(q) || s.product.category.toLowerCase().includes(q))
    if (filterStatus === 'oos') list = list.filter(s => s.oosCount > 0)
    if (filterStatus === 'low') list = list.filter(s => s.lowCount > 0)
    if (filterStatus === 'ok')  list = list.filter(s => s.oosCount === 0)
    return list
  }, [summaries, search, filterStatus])

  const openSummary = useMemo(
    () => summaries.find(s => s.product.id === openId) ?? null,
    [summaries, openId],
  )

  const handleSaved = useCallback((productId: number, saved: InventoryRow[]) => {
    // eslint-disable-next-line eqeqeq
    setAllRows(prev => [...prev.filter(r => r.product_id != productId), ...saved])
  }, [])

  const totalProducts   = products.length
  const productsWithOos = summaries.filter(s => s.oosCount > 0).length
  const productsWithLow = summaries.filter(s => s.lowCount > 0).length
  const globalStock     = summaries.reduce((s, x) => s + x.totalStock, 0)
  const okCount         = summaries.filter(s => s.oosCount === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-amber-500" /> Inventory
          </h1>
          {lastUpdated && (
            <p className="text-[11px] text-gray-600 mt-0.5">
              Updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 30s
            </p>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-amber-500/30 text-slate-800 text-sm font-bold rounded-xl transition-all"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin text-amber-500')} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      {/* Global stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package}      label="Total Products"  value={totalProducts}   sub="in catalog"          color="border-slate-300      text-gray-400"   />
        <StatCard icon={Boxes}        label="Total Stock"     value={globalStock}     sub="units across all"    color="border-amber-500/20  text-amber-400"  />
        <StatCard icon={XCircle}      label="OOS Products"    value={productsWithOos} sub="need restocking"     color="border-red-500/20    text-red-400"    />
        <StatCard icon={TrendingDown} label="Low Stock"       value={productsWithLow} sub="has <=10 unit variant" color="border-orange-500/20 text-orange-400" />
      </div>

      {/* Filter + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500/40 transition-all"
          />
        </div>
        {([
          { key: 'all', label: `All (${totalProducts})`,       active: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
          { key: 'oos', label: `OOS (${productsWithOos})`,     active: 'bg-red-500/15 border-red-500/40 text-red-400' },
          { key: 'low', label: `Low (${productsWithLow})`,     active: 'bg-amber-500/15 border-amber-500/40 text-amber-400' },
          { key: 'ok',  label: `OK (${okCount})`,              active: 'bg-green-500/15 border-green-500/40 text-green-400' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={cn(
              'px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wide border transition-all',
              filterStatus === f.key
                ? f.active
                : 'bg-transparent border-slate-200 text-gray-600 hover:border-slate-300 hover:text-gray-400',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">
            {search ? `No products match "${search}"` : 'No products found.'}
          </div>
        ) : (
          <>
            {/* ── Mobile card list (< md) ── */}
            <div className="md:hidden divide-y divide-slate-200/60">
              {filtered.map(s => {
                const allOos = s.hasInventory && s.oosCount === s.variantCount && s.variantCount > 0
                const stockColor = !s.hasInventory ? 'text-gray-600' : allOos ? 'text-red-400' : s.lowCount > 0 ? 'text-amber-400' : 'text-slate-800'
                return (
                  <div
                    key={s.product.id}
                    className="flex items-center gap-3 p-4 active:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setOpenId(s.product.id)}
                  >
                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-white/10">
                      <img src={resolveImg(s.product.image)} alt={s.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{s.product.name}</p>
                      <p className="text-[11px] text-gray-600 capitalize mb-1">{s.product.category}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black tabular-nums ${stockColor}`}>
                          {s.hasInventory ? `${s.totalStock} pcs` : 'No data'}
                        </span>
                        {s.variantCount > 0 && (
                          <span className="text-[10px] text-gray-600">{s.variantCount} variants</span>
                        )}
                        {!s.hasInventory ? (
                          <StatusChip label="No data" variant="none" />
                        ) : allOos ? (
                          <StatusChip label="All OOS" variant="oos" />
                        ) : s.oosCount > 0 ? (
                          <StatusChip label={`${s.oosCount} OOS`} variant="oos" />
                        ) : s.lowCount > 0 ? (
                          <StatusChip label={`${s.lowCount} Low`} variant="low" />
                        ) : (
                          <StatusChip label="OK" variant="ok" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenId(s.product.id) }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Manage</span>
                    </button>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop table (≥ md) ── */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Product</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Variants</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Total Stock</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">OOS</th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Low</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Status</th>
                    <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const allOos = s.hasInventory && s.oosCount === s.variantCount && s.variantCount > 0
                    const stockColor = !s.hasInventory ? 'text-gray-600' : allOos ? 'text-red-400' : s.lowCount > 0 ? 'text-amber-400' : 'text-slate-800'
                    return (
                      <tr
                        key={s.product.id}
                        className="border-b border-slate-200 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setOpenId(s.product.id)}
                      >
                        <td className="py-3 pl-5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-white/10">
                              <img src={resolveImg(s.product.image)} alt={s.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{s.product.name}</p>
                              <p className="text-[11px] text-gray-600 capitalize">{s.product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-gray-400">{s.variantCount || '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-lg font-black tabular-nums ${stockColor}`}>
                            {s.hasInventory ? s.totalStock : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.oosCount > 0
                            ? <span className="text-sm font-bold text-red-400">{s.oosCount}</span>
                            : <span className="text-sm text-gray-700">-</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.lowCount > 0
                            ? <span className="text-sm font-bold text-amber-400">{s.lowCount}</span>
                            : <span className="text-sm text-gray-700">-</span>}
                        </td>
                        <td className="py-3 px-4">
                          {!s.hasInventory ? (
                            <StatusChip label="No data" variant="none" />
                          ) : allOos ? (
                            <StatusChip label="All OOS" variant="oos" />
                          ) : s.oosCount > 0 ? (
                            <StatusChip label={`${s.oosCount} OOS`} variant="oos" />
                          ) : s.lowCount > 0 ? (
                            <StatusChip label={`${s.lowCount} Low`} variant="low" />
                          ) : (
                            <StatusChip label="OK" variant="ok" />
                          )}
                        </td>
                        <td className="py-3 pl-4 pr-5 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); setOpenId(s.product.id) }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold transition-all"
                          >
                            <BarChart3 className="w-3.5 h-3.5" /> Manage
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Inventory Drawer */}
      {openSummary && (
        <InventoryDrawer
          key={openSummary.product.id}
          summary={openSummary}
          onClose={() => setOpenId(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
