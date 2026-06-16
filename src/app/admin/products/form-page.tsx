'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { productService } from '@/services/productService'
import { categoryService, type Category } from '@/services/categoryService'
import { Image } from '@/components/ui/image'
import type { SizeVariant } from '@/data/products'
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
  Boxes,
} from 'lucide-react'
import { inventoryService, inventoryKey, type InventoryRow } from '@/services/inventoryService'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { AdminSelect } from '@/components/admin/AdminSelect'
import { useImageCompress } from '@/hooks/use-image-compress'

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
  const [gallery, setGallery] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // ── Image compression ─────────────────────────────────────────────────
  const imgCompress     = useImageCompress({ maxSizeKB: 300, maxWidthPx: 2000 })
  const galleryCompress = useImageCompress({ maxSizeKB: 300, maxWidthPx: 2000 })

  const categoryOptions = React.useMemo(() => {
    if (categories.length > 0) {
      const list: { value: string; label: string; group?: string }[] = []
      categories.forEach(cat => {
        const subs = cat.subcategories?.filter(s => s.status === 'active') ?? []
        if (subs.length > 0) {
          subs.forEach(sub => {
            list.push({
              value: sub.slug,
              label: sub.name,
              group: cat.name,
            })
          })
        } else {
          list.push({
            value: cat.slug,
            label: cat.name,
          })
        }
      })
      return list
    }
    return ['men', 'women', 'unisex', 'limited'].map(c => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
    }))
  }, [categories])

  // ── Inventory ──────────────────────────────────────────────────
  const [inventoryMap, setInventoryMap]     = useState<Record<string, number>>({})
  const [inventorySaving, setInventorySaving] = useState(false)
  const [inventoryMsg, setInventoryMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false

    // Load categories (tree) for the dropdown
    categoryService.getTree()
      .then(tree => {
        if (cancelled) return
        // Flatten into all active categories for default-value logic
        const allActive: Category[] = []
        tree.forEach(parent => {
          if (parent.status === 'active') allActive.push(parent)
          parent.subcategories?.forEach(sub => { if (sub.status === 'active') allActive.push(sub) })
        })
        setCategories(tree) // store tree for grouped rendering
        // On create, default to first leaf category (sub if available, else parent)
        if (!isEdit && allActive.length > 0) {
          const firstLeaf = allActive.find(c => !c.parent_id && !(tree.find(t => t.id === c.id)?.subcategories?.length)) ||
                            allActive.find(c => !!c.parent_id) ||
                            allActive[0]
          setForm(f => f.category === '' ? { ...f, category: firstLeaf.slug } : f)
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

    try {
      if (isEdit) {
        await productService.update(Number(id), data)
      } else {
        const createdProduct = await productService.create(data)
        if (createdProduct?.id) {
          // Construct bulk stock rows for all combos
          const sizes = filledSizeVariants.map(r => r.label.trim())
          const colors: string[] = []
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

          const rows: InventoryRow[] = combos.map(c => ({
            size: c.size,
            color: c.color,
            stock: inventoryMap[c.key] ?? 0
          }))

          await inventoryService.bulkSave(createdProduct.id, rows)
        }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const compressed = await imgCompress.compress(file)
      imgCompress.markUploading()
      const path = await productService.uploadImage(compressed)
      imgCompress.markDone()
      setForm(prev => ({ ...prev, image: path }))
    } catch {
      imgCompress.markError()
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
            className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
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
          <section className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
            
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              General Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Product Name *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Classic Black T-Shirt"
                  className="w-full px-5 py-3 bg-[#F4F6FB] border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Description</label>
                <RichTextEditor
                  value={form.description}
                  onChange={html => setForm(f => ({ ...f, description: html }))}
                  placeholder="Write a detailed product description — supports bold, lists, headings, links and more…"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Category *</label>
                  <AdminSelect
                    value={form.category}
                    onChange={val => setForm(f => ({ ...f, category: val }))}
                    options={categoryOptions}
                    placeholder="Select Category"
                  />
                  <p className="mt-1 text-xs text-gray-600">Select the main or sub category for this product</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">URL Slug</label>
                  <input 
                    placeholder="Auto-generated or custom"
                    className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 focus:outline-none cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-600">Slug is managed by server for SEO</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Variations */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
            
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
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
                    className="w-full px-5 py-3 bg-[#F4F6FB] border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Offer Price (₹)
                  </label>
                  <input
                    type="text"
                    value={form.discount_price}
                    onChange={e => {
                      const raw = e.target.value;
                      // allow only digits and one decimal point
                      let cleaned = raw.replace(/[^0-9.]/g, '');
                      const firstDot = cleaned.indexOf('.');
                      if (firstDot !== -1) {
                        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
                      }
                      setForm(f => ({ ...f, discount_price: cleaned }));
                    }}
                    inputMode="decimal"
                    pattern="^[0-9]*\.?[0-9]*$"
                    placeholder="e.g. 999 (direct sale price)"
                    className="w-full px-5 py-3 bg-[#F4F6FB] border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700"
                  />
                  {(() => {
                    const priceNum = parseFloat(form.price);
                    const offerNum = parseFloat(form.discount_price);
                    if (priceNum > 0 && offerNum > 0 && offerNum < priceNum) {
                      const discountPct = ((priceNum - offerNum) / priceNum) * 100;
                      return (
                        <p className="mt-1 text-xs text-amber-400 font-semibold">
                          {priceNum} - {offerNum} (sale price at {discountPct.toFixed(2)}% off)
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* ── Product Variants ─── */}
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden group relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
            {/* Header */}
            <div className="flex items-center gap-3 px-8 py-5 border-b border-slate-200 bg-[#F4F6FB]">
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                <Ruler className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Size / Weight Variants</h2>
                <p className="text-[10px] text-gray-600 mt-0.5">Add weight or size options (e.g. 100g, 200g). Each can have its own price.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2.5">
                {sizeVariantRows.map((row, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl p-3.5 space-y-2.5 relative">
                    <button type="button" onClick={() => setSizeVariantRows(r => r.filter((_, i) => i !== idx))}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-600 block mb-1">Label</label>
                        <input
                          type="text"
                          value={row.label}
                          onChange={e => setSizeVariantRows(r => r.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                          placeholder="100g, 200g, 500g…"
                          className="w-full px-3 py-2 bg-[#F4F6FB] border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-600 block mb-1">Price ₹</label>
                        <input
                          type="number"
                          value={row.price}
                          onChange={e => setSizeVariantRows(r => r.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))}
                          placeholder="optional"
                          className="w-full px-3 py-2 bg-[#F4F6FB] border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSizeVariantRows(r => [...r, { label: '', price: '' }])}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {sizeVariantRows.length === 0 ? 'Add variant' : 'Add another'}
                </button>
              </div>
            </div>
          </section>

{/* ── Inventory Management ── */}
          {(() => {
            const sizes   = sizeVariantRows.filter(r => r.label.trim()).map(r => r.label.trim())
            const colors: string[] = []
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
              <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-[#F4F6FB]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                      <Boxes className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">Inventory Management</h2>
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
                    {isEdit ? (
                      <button
                        type="button"
                        onClick={handleSaveInventory}
                        disabled={inventorySaving}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black rounded-xl transition-all"
                      >
                        {inventorySaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Stock
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-semibold italic bg-gray-900/50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
                        Saved automatically with product
                      </span>
                    )}
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {sizes.length > 0 && <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Size</th>}
                        {colors.length > 0 && <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Color</th>}
                        <th className="text-left pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Stock</th>
                        <th className="text-left pb-3 text-[10px] font-black uppercase tracking-widest text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
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
                                <span className="text-slate-700 text-xs font-semibold">{combo.color}</span>
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
                                    : 'bg-[#F4F6FB] border border-slate-200 text-slate-800 focus:border-amber-500/50'
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
          <section className="bg-white border border-slate-200 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#F4F6FB] border border-slate-200 rounded-2xl cursor-pointer group">
                <span className="text-sm font-semibold text-slate-800">Active Status</span>
                <AdminSelect
                  value={form.status}
                  onChange={val => setForm(f => ({ ...f, status: val as 'active' | 'inactive' }))}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  variant="inline"
                />
              </label>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'bestseller', label: 'Bestseller' },
                ].map((toggle) => (
                  <label 
                    key={toggle.key}
                    className="flex items-center justify-between p-4 bg-[#F4F6FB] border border-slate-200 rounded-2xl cursor-pointer hover:border-amber-500/20 transition-all"
                  >
                    <span className="text-sm font-semibold text-slate-800">{toggle.label}</span>
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


              </div>
            </div>
          </section>

          {/* Image Upload */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Image</h2>
            
            <div className="space-y-4">
              {form.image ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                  <Image src={form.image} alt="Preview" fill className="object-cover" />
                  {/* Mobile: buttons visible top-right, Desktop: hover overlay */}
                  <div className="absolute top-2 right-2 sm:inset-0 sm:bg-slate-800/40 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity flex items-center gap-2 sm:justify-center">
                    <button 
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="p-2 bg-amber-500 hover:bg-amber-400 sm:bg-white/10 sm:hover:bg-white/20 text-white rounded-full transition-colors shadow-lg"
                      title="Change image"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-red-500 hover:bg-red-400 sm:bg-red-500/20 sm:hover:bg-red-500/30 text-white rounded-full transition-colors shadow-lg"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white sm:text-red-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => !imgCompress.busy && document.getElementById('image-upload')?.click()}
                  disabled={imgCompress.busy}
                  className="w-full aspect-square bg-[#F4F6FB] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-gray-600 hover:text-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {imgCompress.busy
                    ? <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    : <ImageIcon className="w-10 h-10" />}
                  <span className="text-sm font-bold tracking-tight">
                    {imgCompress.status === 'compressing' ? 'Compressing…'
                      : imgCompress.status === 'uploading' ? 'Uploading…'
                      : 'Upload Product Image'}
                  </span>
                  <span className="text-[10px] uppercase">JPG · PNG · WEBP · Auto-compressed</span>
                </button>
              )}
              {imgCompress.info && (
                <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-green-600">
                  <Check className="w-3 h-3" /> {imgCompress.info}
                </p>
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
          <section className="bg-white border border-slate-200 rounded-3xl p-6">
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
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img.startsWith('http') ? img : img.startsWith('/api/') ? img : `/api${img}`} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGallery(g => g.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
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
                onClick={() => !galleryCompress.busy && document.getElementById('gallery-upload')?.click()}
                disabled={galleryCompress.busy}
                className="w-full py-4 bg-[#F4F6FB] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-gray-600 hover:text-amber-500 text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {galleryCompress.busy
                  ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  : <Plus className="w-5 h-5" />}
                {galleryCompress.status === 'compressing' ? 'Compressing…'
                  : galleryCompress.status === 'uploading' ? 'Uploading…'
                  : 'Add Gallery Image'}
              </button>
            )}
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                e.target.value = ''
                for (const file of files.slice(0, 6 - gallery.length)) {
                  try {
                    const compressed = await galleryCompress.compress(file)
                    galleryCompress.markUploading()
                    const path = await productService.uploadImage(compressed)
                    galleryCompress.markDone()
                    setGallery(g => [...g, path])
                  } catch { /* skip failed */ }
                }
              }}
              className="hidden"
            />
            {galleryCompress.info && (
              <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-green-600">
                <Check className="w-3 h-3" /> {galleryCompress.info}
              </p>
            )}
            <p className="mt-2 text-[10px] text-gray-600 text-center">First gallery image appears on product card hover</p>
          </section>
        </div>
      </form>
    </div>
  )
}
