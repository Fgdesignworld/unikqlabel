'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { productService } from '@/services/productService'
import { Image } from '@/components/ui/image'
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
  Images
} from 'lucide-react'

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
    category: 'snacks',
    price: '',
    discount_price: '',
    weight: '1kg',
    description: '',
    image: '',
    bestseller: false,
    is_veg: true,
    is_homemade: true,
    status: 'active' as 'active' | 'inactive',
  })

  const [variantRows, setVariantRows] = useState<{ weight: string; price: string }[]>([])
  const [gallery, setGallery] = useState<string[]>([])

  useEffect(() => {
    if (isEdit) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      const product = await productService.adminGetById(Number(id))
      
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
        is_veg: product.is_veg,
        is_homemade: product.is_homemade,
        status: product.status,
      })
      if (Array.isArray(product.variants)) {
        setVariantRows(product.variants.map((v: any) => ({ weight: String(v.weight ?? ''), price: String(v.price ?? '') })))
      }
      if (Array.isArray(product.gallery_images)) {
        setGallery(product.gallery_images)
      }
    } catch (err) {
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

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
      is_veg: form.is_veg ? 1 : 0,
      is_homemade: form.is_homemade ? 1 : 0,
      gallery_images: gallery.length > 0 ? gallery : null,
    }

    const filledVariants = variantRows.filter(r => r.weight.trim() && r.price.trim())
    data.variants = filledVariants.length > 0
      ? filledVariants.map(r => ({ weight: r.weight.trim(), price: parseFloat(r.price) || 0 }))
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
                    <option value="snacks">Snacks</option>
                    <option value="pickles">Pickles</option>
                    <option value="spices">Spices</option>
                    <option value="sweets">Sweets</option>
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
                    type="number" 
                    value={form.price} 
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Discount / Sale Price (₹)
                    <span className="ml-2 text-[10px] text-amber-500/60 font-normal normal-case">optional — show a "X% OFF" badge</span>
                  </label>
                  <input
                    type="number"
                    value={form.discount_price}
                    onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))}
                    placeholder="e.g. 180 (leave blank if no sale)"
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50 placeholder:text-gray-700"
                  />
                  {form.discount_price && form.price && parseFloat(form.discount_price) < parseFloat(form.price) && (
                    <p className="mt-1 text-xs text-amber-400 font-semibold">
                      {Math.round(((parseFloat(form.price) - parseFloat(form.discount_price)) / parseFloat(form.price)) * 100)}% discount will be shown
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Default Weight</label>
                  <input 
                    value={form.weight} 
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="e.g. 500g, 1kg"
                    className="w-full px-5 py-3 bg-[#0a0a0a] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-400">Weight Variants</label>
                  <button
                    type="button"
                    onClick={() => setVariantRows(r => [...r, { weight: '', price: '' }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {variantRows.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setVariantRows([{ weight: '', price: '' }])}
                    className="w-full py-6 border-2 border-dashed border-gray-800 rounded-2xl text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm font-medium flex flex-col items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add weight &amp; price variants
                    <span className="text-xs text-gray-700">(e.g. 250g → ₹219, 500g → ₹399)</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Weight</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Price (₹)</span>
                      <span className="w-8" />
                    </div>

                    {variantRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center group">
                        <input
                          type="text"
                          value={row.weight}
                          onChange={e => setVariantRows(rows => rows.map((r, i) => i === idx ? { ...r, weight: e.target.value } : r))}
                          placeholder="250g"
                          className="px-4 py-2.5 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                        />
                        <input
                          type="number"
                          value={row.price}
                          onChange={e => setVariantRows(rows => rows.map((r, i) => i === idx ? { ...r, price: e.target.value } : r))}
                          placeholder="219"
                          className="px-4 py-2.5 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => setVariantRows(rows => rows.filter((_, i) => i !== idx))}
                          className="w-8 h-9 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setVariantRows(r => [...r, { weight: '', price: '' }])}
                      className="w-full mt-1 py-2 border border-dashed border-gray-800 text-gray-600 hover:text-amber-500 hover:border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add another variant
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
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
                  { key: 'is_veg', label: 'Vegetarian' },
                  { key: 'is_homemade', label: 'Homemade' },
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
