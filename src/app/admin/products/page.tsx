import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService, type ApiProduct } from '@/services/productService'
import { categoryService, type Category } from '@/services/categoryService'
import { useToast } from '@/hooks/use-toast'
import DOMPurify from 'dompurify'
import { Image } from '@/components/ui/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Package, 
  Tag, 
  Layers, 
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Eye,
  Info,
  BadgeInfo,
  IndianRupee,
  Scale,
  Utensils,
  GripVertical,
  X,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableProductRow({ 
  product: p, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  product: ApiProduct, 
  onView: (p: ApiProduct) => void, 
  onEdit: (id: number) => void, 
  onDelete: (id: number) => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 50, backgroundColor: '#1a1a1a', opacity: 0.9 } : {})
  } as React.CSSProperties

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "group bg-[#F8F9FD] md:bg-transparent border border-slate-200 md:border-b md:border-x-0 md:border-t-0 p-3 md:p-0 rounded-3xl md:rounded-none mb-3 md:mb-0 hover:bg-white/[0.015] transition-all duration-300 relative",
      isDragging && "shadow-2xl shadow-black/80 ring-1 ring-amber-500/50"
    )}>
      <div className="flex flex-col md:grid md:grid-cols-[40px_2.5fr_1.5fr_1.5fr_1fr_120px] md:items-center gap-3 md:gap-0 h-full">
        {/* Drag Handle & Mobile Top Bar */}
        <div className="flex items-center justify-between md:justify-center md:py-5 md:pl-4">
          <button {...attributes} {...listeners} className="p-1.5 text-gray-500 hover:text-amber-500 cursor-grab active:cursor-grabbing rounded-xl bg-slate-50 md:bg-transparent touch-none">
            <GripVertical className="w-5 h-5 md:w-4 md:h-4" />
          </button>
          
          <div className="md:hidden flex items-center gap-2">
            <span className={cn(
               "text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-full border",
               p.status === 'active' ? "text-green-500 border-green-500/20 bg-green-500/10" : "text-gray-500 border-slate-200 bg-gray-900"
             )}>
              {p.status}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:py-5 md:px-8 bg-black/40 md:bg-transparent p-2.5 rounded-2xl md:rounded-none border border-white/5 md:border-none">
          <div className="w-14 h-14 md:w-14 md:h-14 rounded-xl bg-[#F4F6FB] border border-slate-200 overflow-hidden flex-shrink-0 relative group-hover:border-amber-500/40 transition-all shadow-lg group-hover:shadow-amber-500/5">
            {p.image ? (
              <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-800" />
              </div>
            )}
            {p.bestseller && (
              <div className="absolute top-1 left-1 z-10">
                <div className="w-2 h-2 bg-amber-500 rounded-full border border-[#0a0a0a] animate-pulse shadow-lg shadow-amber-500/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm tracking-tight truncate group-hover:text-amber-500 transition-colors leading-tight">{p.name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
               <span className="text-gray-500 text-[9px] font-black uppercase tracking-tighter bg-gray-800/40 border border-slate-300/50 px-1.5 py-0.5 rounded">SKU: UNI-P{p.id}</span>
            </div>
          </div>
        </div>

        {/* Desktop Category (Hidden on mobile wrapper, moved inline on mobile below) */}
        <div className="hidden md:flex md:py-5 md:px-8 items-center">
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold tracking-widest text-[9px] uppercase px-2 py-0.5 bg-slate-50 group-hover:border-amber-500/20 transition-colors">
            {p.category}
          </Badge>
        </div>

        {/* Mobile Price/Category Grid / Desktop Price */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0 md:py-5 md:px-8 bg-black/40 md:bg-transparent p-2.5 rounded-2xl md:rounded-none border border-white/5 md:border-none">
          <div className="flex flex-col">
            <span className="text-gray-600 text-[9px] md:hidden font-black uppercase tracking-widest mb-0.5">Price / Wt</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-900 font-black text- tracking-tight">₹{p.price}</span>
              <span className="text-gray-600 text-[10px] font-medium">{p.weight}</span>
            </div>
          </div>
          <div className="flex flex-col md:hidden">
            <span className="text-gray-600 text-[9px] md:hidden font-black uppercase tracking-widest mb-0.5">Category</span>
            <span className="text-gray-300 font-bold text-xs uppercase tracking-tight truncate">{p.category}</span>
          </div>
        </div>

        {/* Desktop Status (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2.5 md:py-5 md:px-8">
           <div className={cn(
             "w-1.5 h-1.5 rounded-full",
             p.status === 'active' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500/50"
           )} />
           <span className={cn(
             "text-[10px] font-black uppercase tracking-[0.1em]",
             p.status === 'active' ? "text-green-500" : "text-gray-600"
           )}>
            {p.status}
           </span>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center justify-end gap-2 md:opacity-40 group-hover:opacity-100 transition-opacity md:py-5 md:px-4 mt-1 md:mt-0 pt-2 border-t border-slate-200 md:border-t-0 md:pt-0">
          <button 
            onClick={() => onView(p)} 
            className="flex-1 md:flex-none flex justify-center items-center py-2 px-3 md:p-2.5 text-gray-500 bg-slate-50 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onEdit(p.id)} 
            className="flex-1 md:flex-none flex justify-center items-center py-2 px-3 md:p-2.5 text-gray-500 bg-slate-50 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
            title="Edit Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(p.id)} 
            className="flex-1 md:flex-none flex justify-center items-center py-2 px-3 md:p-2.5 text-gray-500 bg-slate-50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

type SortConfig = {
  key: keyof ApiProduct | null;
  direction: 'asc' | 'desc';
}

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryTree, setCategoryTree] = useState<Category[]>([])
  
  // Drawer State
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)
  const isDrawerOpen = !!selectedProduct
  
  // Filters & Search
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { toast } = useToast()

  // Deletion Modal State
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
    toast({
      title: "Filters Reset",
      description: "Showing all products in the catalog.",
      duration: 2000
    })
  }

  useEffect(() => {
    loadProducts()
    categoryService.getTree()
      .then(tree => setCategoryTree(tree))
      .catch(() => {})
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

  const handleDelete = (id: number) => {
    setProductToDelete(id)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      setIsDeleting(true)
      await productService.delete(productToDelete)
      await loadProducts()
      toast({
        title: "Product Deleted",
        description: "The product has been successfully removed from the catalog.",
        variant: "default",
      })
      setProductToDelete(null)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      bestsellers: products.filter(p => p.bestseller).length,
      avgPrice: products.length > 0 ? (products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(0) : 0
    }
  }, [products])

  // Filtered & Sorted Data
  const filteredAndSorted = useMemo(() => {
    // Build a map: parentSlug → Set of subcategory slugs for efficient lookup
    const parentSubSlugs = new Map<string, Set<string>>()
    categoryTree.forEach(parent => {
      if (parent.subcategories && parent.subcategories.length > 0) {
        parentSubSlugs.set(parent.slug, new Set(parent.subcategories.map(s => s.slug)))
      }
    })

    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' ||
        p.category === categoryFilter ||
        (parentSubSlugs.has(categoryFilter) && parentSubSlugs.get(categoryFilter)!.has(p.category))
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue == null || bValue == null) return 0
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [products, search, categoryFilter, statusFilter, sortConfig])

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key: keyof ApiProduct) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setProducts((items: ApiProduct[]) => {
      const oldIndex = items.findIndex(p => p.id === active.id)
      const newIndex = items.findIndex(p => p.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)

      const updates = newItems.map((item, index) => ({
        id: item.id,
        sort_order: index
      }))
      productService.reorderProducts(updates).catch(console.error)
      
      return newItems
    })
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-500 font-medium italic">Syncing inventory database...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-amber-500" />
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Inventory Management</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product <span className="text-amber-500">Catalog</span></h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Manage your digital storefront and product inventory.</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/products/new')} 
          className="group relative flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20 active:scale-95 w-full md:w-auto"
        >
          <div className="bg-black/10 p-1 rounded-full group-hover:bg-black/20 transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span className="whitespace-nowrap">Create New Product</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Items', value: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Sale', value: stats.active, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Bestsellers', value: stats.bestsellers, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Avg. Price', value: `₹${stats.avgPrice}`, icon: Tag, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-slate-200/80 hover:border-slate-300 transition-colors group">
            <CardContent className="p-3.5 md:p-5 flex items-center gap-3 md:gap-4">
              <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0", stat.bg)}>
                <stat.icon className={cn("w-5 h-5 md:w-6 h-6", stat.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5 truncate">{stat.label}</p>
                <p className="text-lg md:text-xl font-black text-slate-900 truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Interface */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col xl:flex-row items-stretch xl:items-center gap-4 justify-between bg-[#F8F9FD]">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
            <input 
              value={search} 
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
              placeholder="Search by name or category..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-slate-800 text-xs font-bold focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all" 
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-200/80 rounded-2xl flex-1 sm:w-auto overflow-x-auto scrollbar-hide">
              <div className="pl-2 pr-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-600 whitespace-nowrap">
                <Filter className="w-3 h-3" /> Filter:
              </div>
              
              <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-7 bg-transparent border-none text-[10px] font-bold text-slate-800 focus:ring-0 focus:ring-offset-0 px-2 gap-1 group/trigger hover:bg-slate-50 transition-colors rounded-lg">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800 min-w-[160px]">
                  <SelectItem value="all" className="text-xs focus:bg-amber-500 focus:text-black">All Categories</SelectItem>
                  {categoryTree.length > 0 ? (
                    categoryTree.map(parent => (
                      parent.subcategories && parent.subcategories.length > 0 ? (
                        <SelectGroup key={parent.id}>
                          <SelectLabel className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-2 pb-0.5">{parent.name}</SelectLabel>
                          <SelectItem value={parent.slug} className="text-xs focus:bg-amber-500 focus:text-black pl-3">
                            All {parent.name}
                          </SelectItem>
                          {parent.subcategories.map(sub => (
                            <SelectItem key={sub.id} value={sub.slug} className="text-xs focus:bg-amber-500 focus:text-black pl-5 text-gray-300">
                              ↳ {sub.name}
                            </SelectItem>
                          ))}
                          <SelectSeparator className="bg-gray-800/60 my-1" />
                        </SelectGroup>
                      ) : (
                        <SelectItem key={parent.id} value={parent.slug} className="text-xs focus:bg-amber-500 focus:text-black capitalize">{parent.name}</SelectItem>
                      )
                    ))
                  ) : null}
                </SelectContent>
              </Select>
              
              <div className="w-px h-4 bg-gray-800 mx-1" />
              
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-7 bg-transparent border-none text-[10px] font-bold text-slate-800 focus:ring-0 focus:ring-offset-0 px-2 gap-1 group/trigger hover:bg-slate-50 transition-colors rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800 min-w-[120px]">
                  <SelectItem value="all" className="text-xs focus:bg-amber-500 focus:text-black">Any Status</SelectItem>
                  <SelectItem value="active" className="text-xs focus:bg-amber-500 focus:text-black">Active</SelectItem>
                  <SelectItem value="inactive" className="text-xs focus:bg-amber-500 focus:text-black">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Rows per page - Desktop Only in this bar */}
              <div className="hidden sm:flex items-center">
                <div className="w-px h-4 bg-gray-800 mx-1" />
                <Select value={String(itemsPerPage)} onValueChange={v => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-7 bg-transparent border-none text-[10px] font-bold text-slate-800 focus:ring-0 focus:ring-offset-0 px-2 gap-1 group/trigger hover:bg-slate-50 transition-colors rounded-lg">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800 min-w-[100px]">
                    <SelectItem value="10" className="text-xs focus:bg-amber-500 focus:text-black">10 Rows</SelectItem>
                    <SelectItem value="50" className="text-xs focus:bg-amber-500 focus:text-black">50 Rows</SelectItem>
                    <SelectItem value="100" className="text-xs focus:bg-amber-500 focus:text-black">100 Rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1">
                <button 
                  onClick={resetFilters}
                  className="flex-1 p-2.5 bg-slate-50 border border-white/10 rounded-2xl text-gray-400 hover:text-slate-900 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em]"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button 
                  onClick={loadProducts}
                  className="flex-1 p-2.5 bg-slate-50 border border-white/10 rounded-2xl text-gray-400 hover:text-slate-900 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em]"
                  title="Refresh Data"
                >
                  <ArrowUpDown className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Rows per page - Mobile Only in this bar */}
              <div className="sm:hidden flex-1 max-w-[100px]">
                <Select value={String(itemsPerPage)} onValueChange={v => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-[46px] w-full bg-slate-50 border border-white/10 rounded-2xl text-[10px] font-black text-slate-800 focus:ring-0 focus:ring-offset-0 px-3 gap-1 group/trigger hover:bg-white/10 transition-all">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800 min-w-[100px]">
                    <SelectItem value="10" className="text-xs focus:bg-amber-500 focus:text-black">10 Rows</SelectItem>
                    <SelectItem value="50" className="text-xs focus:bg-amber-500 focus:text-black">50 Rows</SelectItem>
                    <SelectItem value="100" className="text-xs focus:bg-amber-500 focus:text-black">100 Rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header & Unified List Body */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="w-full">
          {/* Desktop Table Header (Hidden on Mobile) */}
          <div className="hidden md:grid grid-cols-[40px_2.5fr_1.5fr_1.5fr_1fr_120px] bg-slate-50/50 border-b border-slate-200/80 px-4">
            <div className="py-5 w-10"></div>
            {[
              { label: 'Product Details', key: 'name', sortable: true },
              { label: 'Category', key: 'category', sortable: true },
              { label: 'Financials', key: 'price', sortable: true },
              { label: 'Inventory', key: 'status', sortable: true },
              { label: 'Actions', key: null, sortable: false, align: 'right' },
            ].map((col, i) => (
              <div key={i} className={cn(
                "py-5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] flex items-center",
                col.align === 'right' && "justify-end pr-0"
              )}>
                {col.sortable ? (
                  <button 
                    onClick={() => col.key && handleSort(col.key as keyof ApiProduct)}
                    className="flex items-center gap-2 hover:text-amber-500 transition-colors uppercase tracking-widest"
                  >
                    {col.label}
                    <ArrowUpDown className={cn("w-3 h-3 transition-opacity", sortConfig.key === col.key ? "opacity-100" : "opacity-0")} />
                  </button>
                ) : col.label}
              </div>
            ))}
          </div>
          
          {/* Sortable List Container */}
          <div className="p-4 md:p-0 flex flex-col md:block">
            <SortableContext items={paginatedProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {paginatedProducts.map(p => (
              <SortableProductRow 
                 key={p.id} 
                 product={p} 
                 onView={(p) => setSelectedProduct(p)} 
                 onEdit={(id) => navigate(`/admin/products/${id}`)}
                 onDelete={handleDelete}
              />
            ))}
            </SortableContext>
          </div>
        </div>
        </DndContext>

        {/* Empty State */}
        {filteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-5 px-6 text-center">
            <div className="w-20 h-20 bg-[#F4F6FB] border border-slate-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <Layers className="w-10 h-10 text-gray-800" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm max-w-sm">Try adjusting your search criteria, clearing filters, or create a new product to add to the inventory.</p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredAndSorted.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs font-medium">
              Showing <span className="text-slate-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800 font-bold">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> of <span className="text-slate-800 font-bold">{filteredAndSorted.length}</span> items
            </p>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-slate-900 disabled:opacity-20 transition-all hover:bg-slate-50 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Logic to show a limited number of pages if totalPages is large
                  const isCurrent = page === currentPage;
                  const isNear = Math.abs(page - currentPage) <= 1;
                  const isEdge = page === 1 || page === totalPages;

                  if (!isNear && !isEdge && totalPages > 5) {
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="text-gray-700 px-1">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-[10px] font-black transition-all flex items-center justify-center border",
                        isCurrent 
                          ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20" 
                          : "bg-slate-50 border-slate-200 text-gray-500 hover:border-slate-300 hover:text-white"
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-slate-900 disabled:opacity-20 transition-all hover:bg-slate-50 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer for Quick View Details */}
      <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && setSelectedProduct(null)} modal={true}>
        <SheetContent className="bg-white border-l border-slate-200 text-slate-900 w-full sm:max-w-xl p-0 overflow-hidden flex flex-col shadow-2xl">
          {/* Sticky Header with Glassmorphism */}
          <div className="sticky top-0 z-20 backdrop-blur-2xl bg-black/40 border-b border-white/5 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Specifications</p>
              <SheetTitle className="text-slate-900 text-xl font-black tracking-tight">Product <span className="text-gray-500 italic">Overview</span></SheetTitle>
            </div>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {selectedProduct && (
              <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Hero Section: Image & Key Highlight */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 aspect-[4/5] relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 group shadow-inner">
                    {selectedProduct.image ? (
                      <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <Package className="w-12 h-12 text-gray-800 lg:w-16 lg:h-16" />
                        <span className="text-gray-700 text-[10px] font-black uppercase tracking-widest">No Media Asset</span>
                      </div>
                    )}
                    
                    {/* Floating Badges on Image */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {selectedProduct.bestseller && (
                        <div className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/40">Bestseller</div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                       <Badge variant="outline" className="border-slate-200 text-gray-500 bg-black/40 text-[9px] tracking-[0.1em] uppercase px-2 py-0.5">
                        {selectedProduct.category}
                      </Badge>
                      <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                        selectedProduct.status === 'active' ? "text-green-500 border-green-500/10 bg-green-500/5" : "text-gray-500 border-slate-200/80 bg-gray-900/40"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", selectedProduct.status === 'active' ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
                        {selectedProduct.status}
                      </div>
                    </div>

                    <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-[1.1]">{selectedProduct.name}</h2>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400 border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-amber-500" /> <span className="uppercase tracking-widest">SKU:</span> UNI-P{selectedProduct.id}</div>
                      <div className="flex items-center gap-2"><Scale className="w-3.5 h-3.5 text-amber-500" /> <span className="uppercase tracking-widest">Default:</span> {selectedProduct.weight}</div>
                    </div>

                    <div className="pt-2">
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-white/5 rounded-2xl">
                          <IndianRupee className="w-4 h-4 text-amber-500" />
                          <span className="text-2xl font-black text-slate-900">₹{selectedProduct.price}</span>
                          <span className="text-gray-600 text-[10px] font-black uppercase">Start From</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Rating', value: `${selectedProduct.rating} ★`, icon: TrendingUp, color: 'text-amber-500' },
                    { label: 'Category', value: selectedProduct.category, icon: Tag, color: 'text-blue-500' },
                    { label: 'Inventory', value: selectedProduct.status, icon: Package, color: 'text-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col items-start justify-between gap-2 hover:bg-white/[0.04] transition-colors">
                      <item.icon className={cn("w-4 h-4", item.color)} />
                      <div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                        <p className="text-xs font-black text-slate-700">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Variants Support (Addresses "Limited Info" feedback) */}
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Layers className="w-3 h-3" /> Available Variants
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProduct.variants.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-amber-500/50 transition-colors">
                          <span className="text-xs font-black text-gray-300 tracking-tight">{v.weight}</span>
                          <span className="text-xs font-black text-amber-500">₹{v.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Cardio */}
                {selectedProduct.description && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Info className="w-3 h-3" /> Product Story
                    </h4>
                    <div className="relative group p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:text-white/10 transition-colors">
                        <BadgeInfo className="w-16 h-16 rotate-12" />
                      </div>
                      <div 
                        className="relative z-10 text-slate-700 text-xs leading-relaxed tracking-wide rich-text-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProduct.description) }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={productToDelete !== null} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="bg-white border-slate-200 shadow-xl text-slate-900 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium">
              This will permanently delete the product from your catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="bg-transparent border-slate-200 text-gray-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 transition-all shadow-lg shadow-red-500/20"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}