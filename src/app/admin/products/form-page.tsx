'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { productService } from '@/services/productService'
import { categoryService, type Category } from '@/services/categoryService'
import { sizeVariantService, type SizeVariantSet } from '@/services/sizeVariantService'
import { colorLibraryService, type LibraryColor } from '@/services/colorLibraryService'
import { Image } from '@/components/ui/image'
import type { SizeVariant, ColorVariant } from '@/data/products'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
  Images,
  Ruler,
  Palette,
  BookOpen,
  Boxes,
} from 'lucide-react'
import { inventoryService, inventoryKey, type InventoryRow } from '@/services/inventoryService'

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    discount_price: '',
    weight: '',
    description: '',
    image: '',
    bestseller: false,
    status: 'active' as 'active' | 'inactive',
  })

  const [variantRows, setVariantRows] = useState<{ weight: string; price: string }[]>([])
  const [sizeVariantRows, setSizeVariantRows] = useState<{ label: string; price: string }[]>([])
  const [colorVariantRows, setColorVariantRows] = useState<{ color: string; hex: string; images: string[]; uploading: boolean }[]>([])
  const [gallery, setGallery] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [variantTab, setVariantTab] = useState<'size' | 'color'>('size')

  // ── Inventory ──────────────────────────────────────────────────
  const [inventoryMap, setInventoryMap]     = useState<Record<string, number>>({})
  const [inventorySaving, setInventorySaving] = useState(false)
  const [inventoryMsg, setInventoryMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Library data for "load from library" pickers
  const [variantSets, setVariantSets] = useState<SizeVariantSet[]>([])
  const [libraryColors, setLibraryColors] = useState<LibraryColor[]>([])
  const [enableVariants, setEnableVariants] = useState(true)
  const [enableColors, setEnableColors] = useState(true)

  useEffect(() => {
    let cancelled = false

    // Load library data (variant sets + colors) for pickers
    sizeVariantService.getActive().then(sets => { if (!cancelled) setVariantSets(sets) }).catch(() => {})
    colorLibraryService.getActive().then(cols => { if (!cancelled) setLibraryColors(cols) }).catch(() => {})

    // Load categories for the dropdown
    categoryService.getAll()
      .then(cats => {
        if (cancelled) return
        const active = cats.filter(c => c.status === 'active')
        setCategories(active)
        // On create, default to the first available category
        if (!isEdit && active.length > 0) {
          setForm(f => f.category === '' ? { ...f, category: active[0].slug } : f)
        }
      })
      .catch(() => {/* silently ignore — fallback options shown */})

    if (isEdit) {
      setLoading(true)
      productService.adminGetById(Number(id))
        .then(product => {
          if (cancelled) return
          if (!product) {
            setError('Product not found')
            return
          }
          setForm({
            name: product.name,
            category: product.category,
            price: String(product.price),
            discount_price: product.discount_price ? String(product.discount_price) : '',
            weight: product.weight,
            description: product.description || '',
            image: product.image || '',
            bestseller: product.bestseller,
            status: product.status,
          })
          if (Array.isArray(product.variants)) {
            setVariantRows(product.variants.map((v: any) => ({ weight: String(v.weight ?? ''), price: String(v.price ?? '') })))
          }
          if (Array.isArray((product as any).variants_json)) {
            setSizeVariantRows((product as any).variants_json.map((v: SizeVariant) => ({ label: v.label, price: v.price != null ? String(v.price) : '' })))
          }
          if (Array.isArray((product as any).color_variants_json)) {
            setColorVariantRows((product as any).color_variants_json.map((v: ColorVariant) => ({ color: v.color, hex: v.hex, images: v.images, uploading: false })))
          }
          if (Array.isArray(product.gallery_images)) {
            setGallery(product.gallery_images)
          }
          // Load inventory
          inventoryService.getForProduct(Number(id))
            .then(rows => {
              if (cancelled) return
              const map: Record<string, number> = {}
              rows.forEach(r => { map[inventoryKey(r.size, r.color)] = r.stock })
              setInventoryMap(map)
            })
            .catch(() => {})
        })
        .catch(() => {
          if (!cancelled) setError('Failed to load product details')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    return () => { cancelled = true }
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    const data: any = {
      ...form,
      price: parseFloat(form.price) || 0,
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      bestseller: form.bestseller ? 1 : 0,
      gallery_images: gallery.length > 0 ? gallery : null,
      enable_variants: enableVariants ? 1 : 0,
      enable_colors: enableColors ? 1 : 0,
    }

    // Guard: ensure a category is selected before submitting
    if (!data.category) {
      setError('Please select a category')
      setSaving(false)
      return
    }

    const filledVariants = variantRows.filter(r => r.weight.trim() && r.price.trim())
    data.variants = filledVariants.length > 0
      ? filledVariants.map(r => ({ weight: r.weight.trim(), price: parseFloat(r.price) || 0 }))
      : null

    const filledSizeVariants = sizeVariantRows.filter(r => r.label.trim())
    data.variants_json = filledSizeVariants.length > 0
      ? filledSizeVariants.map(r => ({ label: r.label.trim(), price: r.price.trim() ? parseFloat(r.price) : null }))
      : null

    const filledColorVariants = colorVariantRows.filter(r => r.color.trim())
    data.color_variants_json = filledColorVariants.length > 0
      ? filledColorVariants.map(r => ({ color: r.color.trim(), hex: r.hex || '#000000', images: r.images }))
      : null

    try {
      if (isEdit) {
        await productService.update(Number(id), data)
      } else {
        await productService.create(data)
      }
      setSuccess(true)
      setTimeout(() => navigate('/admin/products'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInventory = async () => {
    if (!id) return
    setInventorySaving(true)
    setInventoryMsg(null)
    try {
      const rows: InventoryRow[] = Object.entries(inventoryMap).map(([key, stock]) => {
        const [size, color] = key.split('|')
        return { size: size || null, color: color || null, stock }
      })
      await inventoryService.bulkSave(Number(id), rows)
      setInventoryMsg({ type: 'ok', text: 'Inventory saved!' })
      setTimeout(() => setInventoryMsg(null), 3000)
    } catch {
      setInventoryMsg({ type: 'err', text: 'Failed to save inventory' })
    } finally {
      setInventorySaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {    const file = e.target.files?.[0]
    if (!file) return

    try {
      const path = await productService.uploadImage(file)
      setForm(prev => ({ ...prev, image: path }))
    } catch (err) {
      setError('Image upload failed')
    }
  }

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: '' }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading product details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link 
            to="/admin/products" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isEdit ? 'Edit' : 'Create'} <span className="text-amber-500">Product</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-bold animate-in fade-in slide-in-from-right-4">
              <Check className="w-4 h-4" /> Saved Successfully!
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/10"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="bg-[#111] border border-gray-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              General Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Product Name *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Nethi Sunnunda"
                  className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tell customers about this homemade goodness..."
                  rows={4}
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Category *</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50 appearance-none"
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))
                    ) : (
                      // Fallback while loading or if API unavailable
                      ['men', 'women', 'unisex', 'limited'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">URL Slug</label>
                  <input 
                    placeholder="Auto-generated or custom"
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white/40 focus:outline-none cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-600">Slug is managed by server for SEO</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Variations */}
          <section className="bg-[#111] border border-gray-800 rounded-3xl p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              Pricing & Configuration
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Base Price (₹) *</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={e => {
                      const raw = e.target.value
                      // allow only digits and one decimal point
                      let cleaned = raw.replace(/[^0-9.]/g, '')
                      const firstDot = cleaned.indexOf('.')
                      if (firstDot !== -1) {
                        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
                      }
                      setForm(f => ({ ...f, price: cleaned }))
                    }}
                    inputMode="decimal"
                    pattern="^[0-9]*\.?[0-9]*$"
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Discount Percentage (%)
                    {/* <span className="ml-2 text-[10px] text-amber-500/60 font-normal normal-case">optional — applies to all variants</span> */}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount_price}
                    onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))}
                    placeholder="e.g. 20 (means 20% off)"
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700"
                  />
                  {form.discount_price && form.price && (
                    <p className="mt-1 text-xs text-amber-400 font-semibold">
                      {parseFloat(form.price)} - {Math.round((parseFloat(form.price) * (100 - parseFloat(form.discount_price))) / 100)} (sale price at {form.discount_price}% off)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Variants Tabbed Interface ─── */}
          <section className="bg-[#111] border border-gray-800 rounded-3xl overflow-hidden group relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-4 border-b border-gray-800 bg-[#0a0a0a]">
              <button
                type="button"
                onClick={() => setVariantTab('size')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  variantTab === 'size'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-gray-500 hover:text-white border border-transparent'
                }`}
              >
                <Ruler className="w-4 h-4" />
                Size Variants
              </button>
              <button
                type="button"
                onClick={() => setVariantTab('color')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  variantTab === 'color'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-gray-500 hover:text-white border border-transparent'
                }`}
              >
                <Palette className="w-4 h-4" />
                Color Variants
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {variantTab === 'size' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs text-gray-500 font-semibold mb-2">Label only shown on buttons. Price overrides base price on selection.</h3>
                  </div>

                  {/* ─ Pick from Variant Master ─ */}
                  {variantSets.length > 0 && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-300 font-semibold">Pick from Variant Master</span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {variantSets.map(set => (
                          <div key={set.id}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">{set.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {set.variants.map(v => {
                                const already = sizeVariantRows.some(r => r.label === v.label)
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    disabled={already}
                                    onClick={() => {
                                      if (already) return
                                      setSizeVariantRows(r => [...r, {
                                        label: v.label,
                                        price: v.price_adjustment > 0 ? String(v.price_adjustment) : '',
                                      }])
                                    }}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all ${already
                                      ? 'opacity-40 cursor-not-allowed border-zinc-700 text-zinc-500'
                                      : 'border-zinc-700 hover:border-amber-500/50 text-white hover:bg-amber-500/5'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-md bg-[#1a1a1a] border border-white/15 shrink-0 flex items-center justify-center text-[9px] font-black text-amber-400">
                                      {v.label.slice(0, 3)}
                                    </span>
                                    {v.label}
                                    {already && <Check className="w-3 h-3 text-emerald-400" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {sizeVariantRows.map((row, idx) => (
                      <div key={idx} className="border border-gray-800 rounded-2xl p-3.5 space-y-2.5 relative">
                        <button type="button" onClick={() => setSizeVariantRows(r => r.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-600 block mb-1">Size</label>
                            <input
                              type="text"
                              value={row.label}
                              onChange={e => setSizeVariantRows(r => r.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                              placeholder="XS, S, M, L…"
                              className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-600 block mb-1">Price ₹</label>
                            <input
                              type="number"
                              value={row.price}
                              onChange={e => setSizeVariantRows(r => r.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))}
                              placeholder="optional"
                              className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                            />
                          </div>
                        </div>
                </div>
                  ))}

                    <button
                      type="button"
                      onClick={() => setSizeVariantRows(r => [...r, { label: '', price: '' }])}
                      className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {sizeVariantRows.length === 0 ? 'Add size' : 'Add another'}
                    </button>
                  </div>
                </div>
              )}

              {variantTab === 'color' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs text-gray-500 font-semibold mb-2">Each color can have its own images. Selecting a color swaps the gallery.</h3>
                  </div>
                  {/* ─ Pick from Color Library ─ */}
                  {libraryColors.length > 0 && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-300 font-semibold">Pick from Color Library</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {libraryColors.map(c => {
                          const already = colorVariantRows.some(r => r.color === c.name)
                          return (
                            <button
                              key={c.id}
                              type="button"
                              disabled={already}
                              onClick={() => {
                                if (already) return
                                setColorVariantRows(r => [...r, { color: c.name, hex: c.hex_code, images: [], uploading: false }])
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all ${already
                                ? 'opacity-40 cursor-not-allowed border-zinc-700 text-zinc-500'
                                : 'border-zinc-700 hover:border-amber-500/50 text-white hover:bg-amber-500/5'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.hex_code }} />
                              {c.name}
                              {already && <Check className="w-3 h-3 text-emerald-400" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {colorVariantRows.map((row, idx) => (
                      <div key={idx} className="border border-gray-800 rounded-2xl p-3.5 space-y-2.5 relative">
                        <button type="button" onClick={() => setColorVariantRows(r => r.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-600 block mb-1">Color Name</label>
                            <input type="text" value={row.color}
                              onChange={e => setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, color: e.target.value } : x))}
                              placeholder="Black, White…"
                              className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input type="color" value={row.hex || '#000000'}
                              onChange={e => setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x))}
                              className="w-9 h-9 rounded-lg border border-gray-800 bg-transparent cursor-pointer p-0.5"
                            />
                            <input type="text" value={row.hex || '#000000'}
                              onChange={e => setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, hex: e.target.value } : x))}
                              className="w-20 px-2.5 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                        </div>

                        {/* Image thumbnails */}
                        {row.images.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {row.images.map((imgSrc, imgIdx) => (
                              <div key={imgIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-800 group/img">
                                <img src={imgSrc.startsWith('/api') ? imgSrc : `/api${imgSrc}`} alt="" className="w-full h-full object-cover" />
                                <button type="button"
                                  onClick={() => setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, images: x.images.filter((_, ii) => ii !== imgIdx) } : x))}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                  <X className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button type="button"
                            disabled={row.uploading}
                            onClick={() => document.getElementById(`color-img-${idx}`)?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] border border-gray-800 rounded-lg text-gray-400 hover:text-amber-500 hover:border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50">
                            {row.uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            {row.uploading ? 'Uploading' : 'Add'}
                          </button>
                          <span className="text-[9px] text-gray-700">{row.images.length} img{row.images.length !== 1 ? 's' : ''}</span>
                          <input id={`color-img-${idx}`} type="file" accept="image/*" multiple className="hidden"
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || [])
                              setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, uploading: true } : x))
                              for (const file of files) {
                                try {
                                  const path = await productService.uploadImage(file)
                                  setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, images: [...x.images, path] } : x))
                                } catch { /* skip */ }
                              }
                              setColorVariantRows(r => r.map((x, i) => i === idx ? { ...x, uploading: false } : x))
                              e.target.value = ''
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <button type="button"
                      onClick={() => setColorVariantRows(r => [...r, { color: '', hex: '#000000', images: [], uploading: false }])}
                      className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-xs font-bold flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      {colorVariantRows.length === 0 ? 'Add color' : 'Add another'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Inventory Management (edit mode only) ── */}
          {isEdit && (() => {
            const sizes   = sizeVariantRows.filter(r => r.label.trim()).map(r => r.label.trim())
            const colors  = colorVariantRows.filter(r => r.color.trim()).map(r => r.color.trim())
            // Build combinations
            const combos: Array<{ size: string | null; color: string | null; key: string }> = []
            if (sizes.length > 0 && colors.length > 0) {
              sizes.forEach(s => colors.forEach(c => combos.push({ size: s, color: c, key: inventoryKey(s, c) })))
            } else if (sizes.length > 0) {
              sizes.forEach(s => combos.push({ size: s, color: null, key: inventoryKey(s, null) }))
            } else if (colors.length > 0) {
              colors.forEach(c => combos.push({ size: null, color: c, key: inventoryKey(null, c) }))
            } else {
              combos.push({ size: null, color: null, key: inventoryKey(null, null) })
            }

            const totalStock = combos.reduce((sum, c) => sum + (inventoryMap[c.key] ?? 0), 0)
            const outOfStock = combos.filter(c => (inventoryMap[c.key] ?? 0) === 0).length

            return (
              <section className="bg-[#111] border border-gray-800 rounded-3xl overflow-hidden group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-800 bg-[#0a0a0a]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                      <Boxes className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white">Inventory Management</h2>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {combos.length} variant{combos.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                        <span className="text-amber-400">{totalStock} total stock</span>
                        {outOfStock > 0 && <span className="text-red-400 ml-2">· {outOfStock} out of stock</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {inventoryMsg && (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${inventoryMsg.type === 'ok' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                        {inventoryMsg.text}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveInventory}
                      disabled={inventorySaving}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black rounded-xl transition-all"
                    >
                      {inventorySaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Stock
                    </button>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {sizes.length > 0 && <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Size</th>}
                        {colors.length > 0 && <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Color</th>}
                        <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Stock</th>
                        <th className="text-left pb-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {combos.map(combo => {
                        const stock = inventoryMap[combo.key] ?? 0
                        const isOos  = stock === 0
                        const isLow  = stock > 0 && stock <= 5
                        return (
                          <tr key={combo.key} className={`transition-colors ${isOos ? 'bg-red-500/5' : ''}`}>
                            {sizes.length > 0 && (
                              <td className="py-3 pr-4">
                                {combo.size ? (
                                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-black font-mono">
                                    {combo.size}
                                  </span>
                                ) : <span className="text-gray-600 text-xs">—</span>}
                              </td>
                            )}
                            {colors.length > 0 && (
                              <td className="py-3 pr-4">
                                {combo.color ? (
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const cv = colorVariantRows.find(r => r.color === combo.color)
                                      return cv ? <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: cv.hex }} /> : null
                                    })()}
                                    <span className="text-white text-xs font-semibold">{combo.color}</span>
                                  </div>
                                ) : <span className="text-gray-600 text-xs">—</span>}
                              </td>
                            )}
                            <td className="py-3 pr-6">
                              <input
                                type="number"
                                min={0}
                                value={stock}
                                onChange={e => {
                                  const v = Math.max(0, parseInt(e.target.value) || 0)
                                  setInventoryMap(prev => ({ ...prev, [combo.key]: v }))
                                }}
                                className={`w-24 px-3 py-1.5 rounded-xl text-sm font-bold text-center outline-none transition-all ${
                                  isOos
                                    ? 'bg-red-500/10 border border-red-500/30 text-red-300 focus:border-red-400'
                                    : isLow
                                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 focus:border-amber-400'
                                    : 'bg-[#0a0a0a] border border-gray-800 text-white focus:border-amber-500/50'
                                }`}
                              />
                            </td>
                            <td className="py-3">
                              {isOos ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/10 border border-red-500/20 text-red-400">
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                  Low ({stock})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-500/10 border border-green-500/20 text-green-400">
                                  In Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <p className="text-[10px] text-gray-700 mt-4">
                    Changes are saved independently with the "Save Stock" button. Stock is validated server-side at checkout.
                  </p>
                </div>
              </section>
            )
          })()}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          {/* Status & Visibility */}
          <section className="bg-[#111] border border-gray-800 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl cursor-pointer group">
                <span className="text-sm font-semibold text-white">Active Status</span>
                <select 
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                  className="bg-transparent text-amber-500 text-sm font-bold focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'bestseller', label: 'Bestseller' },
                ].map((toggle) => (
                  <label 
                    key={toggle.key}
                    className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl cursor-pointer hover:border-amber-500/20 transition-all"
                  >
                    <span className="text-sm font-semibold text-white">{toggle.label}</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={(form as any)[toggle.key]}
                        onChange={e => setForm(f => ({ ...f, [toggle.key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                  </label>
                ))}

                {/* Variant visibility toggles */}
                <label className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl cursor-pointer hover:border-amber-500/20 transition-all">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-white">Size Variants</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enableVariants} onChange={e => setEnableVariants(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl cursor-pointer hover:border-amber-500/20 transition-all">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-white">Color Variants</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enableColors} onChange={e => setEnableColors(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Image Upload */}
          <section className="bg-[#111] border border-gray-800 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Image</h2>
            
            <div className="space-y-4">
              {form.image ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-800 group">
                  <Image src={form.image} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="w-full aspect-square bg-[#0a0a0a] border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-gray-600 hover:text-amber-500"
                >
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm font-bold tracking-tight">Upload Product Image</span>
                  <span className="text-[10px] uppercase">JPG, PNG, WEBP (Max 5MB)</span>
                </button>
              )}
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </div>
          </section>

          {/* Gallery Images */}
          <section className="bg-[#111] border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Images className="w-4 h-4" /> Gallery
              </h2>
              <span className="text-[10px] text-gray-600">{gallery.length}/6</span>
            </div>

            {/* Gallery grid */}
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 group">
                    <img src={img.startsWith('http') ? img : img.startsWith('/api/') ? img : `/api${img}`} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGallery(g => g.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {gallery.length < 6 && (
              <button
                type="button"
                onClick={() => document.getElementById('gallery-upload')?.click()}
                className="w-full py-4 bg-[#0a0a0a] border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-gray-600 hover:text-amber-500 text-xs font-bold"
              >
                <Plus className="w-5 h-5" />
                Add Gallery Image
              </button>
            )}
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                for (const file of files.slice(0, 6 - gallery.length)) {
                  try {
                    const path = await productService.uploadImage(file)
                    setGallery(g => [...g, path])
                  } catch { /* skip failed */ }
                }
                e.target.value = ''
              }}
              className="hidden"
            />
            <p className="mt-2 text-[10px] text-gray-600 text-center">First gallery image appears on product card hover</p>
          </section>
        </div>
      </form>
    </div>
  )
}
