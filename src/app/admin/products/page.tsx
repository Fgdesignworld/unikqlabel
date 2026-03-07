'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService, type ApiProduct } from '@/services/productService'
import { Image } from '@/components/ui/image'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Package, 
  Tag, 
  Layers, 
  Eye,
  MoreVertical,
  AlertCircle
} from 'lucide-react'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.adminGetAll()
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    try {
      await productService.delete(id)
      loadProducts()
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-500 font-medium">Fetching catalog...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Inventory</p>
          <h1 className="text-2xl font-black text-white">Product <span className="text-amber-500">Catalog</span></h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-gray-800 rounded-2xl text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all" 
            />
          </div>
          <button 
            onClick={() => navigate('/admin/products/new')} 
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-bold text-sm rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Product List */}
      <div className="bg-[#111] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#151515] border-b border-gray-800">
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Product Info</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Price</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Weight</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-right text-[11px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(p => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-gray-800 overflow-hidden flex-shrink-0 relative group-hover:border-amber-500/30 transition-colors">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-800" />
                          </div>
                        )}
                        {p.bestseller && (
                          <div className="absolute top-0 left-0 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#0a0a0a] translate-x-1 translate-y-1" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm leading-tight group-hover:text-amber-500 transition-colors">{p.name}</p>
                        <p className="text-gray-600 text-[10px] font-bold mt-1 uppercase tracking-tighter">ID: LHF-P{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <Tag className="w-3 h-3" /> {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white font-bold text-sm tracking-tight">₹{p.price}</p>
                    {p.variants && p.variants.length > 0 && (
                      <p className="text-gray-600 text-[10px] mt-0.5">{p.variants.length} Variants</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-400 text-sm font-medium">{p.weight}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                       <span className={`text-[11px] font-black uppercase tracking-widest ${p.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                        {p.status}
                       </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/products/${p.id}`)} 
                        className="p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-[#0a0a0a] border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-gray-800" />
            </div>
            <p className="text-white font-bold">No products found</p>
            <p className="text-gray-600 text-sm mt-1 max-w-[200px]">We couldn't find anything matching your search terms.</p>
          </div>
        )}

        {/* Footer info */}
        <div className="bg-[#151515] px-6 py-4 border-t border-gray-800 flex items-center justify-between text-[11px] font-bold text-gray-600 uppercase tracking-widest">
           <span>Total: {filtered.length} Items</span>
           <span className="text-amber-500/50 italic">Professional Catalog Management</span>
        </div>
      </div>
    </div>
  )
}

