import { useState, useEffect, useRef, useMemo } from 'react'
import { categoryService, type Category, type CategoryPayload } from '@/services/categoryService'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Edit2, Trash2, Search, Tag, ToggleLeft, ToggleRight,
  Upload, X, Check, Loader2, Image as ImageIcon, RefreshCw,
  ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon,
  FolderOpen, Layers,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { AdminSelect } from '@/components/admin/AdminSelect'

// --- Slug generator ---
function toSlug(val: string) {
  return val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-|-$/g, '')
}

// ─── CategoryForm (slide-over panel) ─────────────────────────────────────────
function CategoryForm({
  category,
  parentCategories,
  defaultParentId,
  onSave,
  onClose,
}: {
  category?: Category
  parentCategories: Category[]
  defaultParentId?: number | null
  onSave: () => void
  onClose: () => void
}) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEditing = !!category

  const [form, setForm] = useState<CategoryPayload>({
    name:       category?.name       ?? '',
    slug:       category?.slug       ?? '',
    image:      category?.image      ?? null,
    status:     category?.status     ?? 'active',
    sort_order: category?.sort_order ?? 0,
    parent_id:  category?.parent_id  ?? defaultParentId ?? null,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  const parentOptions = useMemo(() => {
    return parentCategories.map(p => ({
      value: p.id,
      label: p.name
    }))
  }, [parentCategories])

  const setField = (key: keyof CategoryPayload, val: unknown) => {
    setForm(prev => ({ ...prev, [key]: val }))
    if (key === 'name' && !slugEdited) {
      setForm(prev => ({ ...prev, slug: toSlug(val as string) }))
    }
    if (key === 'slug') setSlugEdited(true)
  }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await categoryService.uploadImage(file)
      setForm(prev => ({ ...prev, image: url }))
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (isEditing && category) {
        await categoryService.update(category.id, form)
        toast({ title: 'Category updated!' })
      } else {
        await categoryService.create(form)
        toast({ title: 'Category created!' })
      }
      onSave()
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const isSubcategory = !!form.parent_id

  return (
    <div className="fixed inset-0 z-60 flex">
      <div className="flex-1 bg-slate-800/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white border-l border-slate-200 overflow-y-auto flex flex-col max-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <div>
            <h2 className="text-slate-900 font-black text- sm:text-lg">
              {isEditing ? 'Edit Category' : isSubcategory ? 'New Subcategory' : 'New Category'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEditing
                ? `Editing: ${category?.name}`
                : isSubcategory
                  ? `Under: ${parentCategories.find(p => p.id === form.parent_id)?.name ?? ''}`
                  : 'Add a new product category'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-5 space-y-4 sm:space-y-5">

          {/* Type selector (Main / Subcategory) */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setField('parent_id', null)}
                className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all',
                  !form.parent_id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-slate-50 border-slate-300 text-gray-500 hover:border-gray-600'
                )}>
                <FolderOpen className="w-3.5 h-3.5" /> Main Category
              </button>
              <button type="button"
                onClick={() => parentCategories.length > 0 && setField('parent_id', form.parent_id ?? parentCategories[0]?.id)}
                disabled={parentCategories.length === 0}
                title={parentCategories.length === 0 ? 'Create a main category first' : ''}
                className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all',
                  form.parent_id
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                    : 'bg-slate-50 border-slate-300 text-gray-500 hover:border-gray-600',
                  parentCategories.length === 0 && 'opacity-40 cursor-not-allowed'
                )}>
                <Layers className="w-3.5 h-3.5" /> Subcategory
              </button>
            </div>
            {form.parent_id !== null && form.parent_id !== undefined && parentCategories.length > 0 && (
              <div className="mt-3">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">
                  Parent Category <span className="text-red-400">*</span>
                </label>
                <AdminSelect
                  value={form.parent_id}
                  onChange={val => setField('parent_id', val ? Number(val) : null)}
                  options={parentOptions}
                  placeholder="Select Parent Category"
                />
              </div>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Image</label>
            {form.image ? (
              <div className="relative w-full h-24 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-300 group">
                <img src={form.image.startsWith('/') && !form.image.startsWith('/api') ? `/api${form.image}` : form.image} alt="preview" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-3">
                  <button 
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="p-1.5 sm:p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="p-1.5 sm:p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-24 sm:h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-gray-600 hover:text-amber-500"
              >
                {uploading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-amber-500" /> : <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          {/* Name */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Pickles"
              required
              className="w-full bg-white border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 focus:bg-white/6 transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Slug</label>
            <div className="relative">
              <input
                type="text"
                value={form.slug ?? ''}
                onChange={e => setField('slug', toSlug(e.target.value))}
                placeholder="auto-generated"
                className="w-full bg-white border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => { setForm(prev => ({ ...prev, slug: toSlug(form.name) })); setSlugEdited(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-500 transition-colors shrink-0"
                title="Regenerate from name"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-1">URL: /category/{form.slug || '...'}</p>
          </div>

          {/* Sort order */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Sort Order</label>
            <input
              type="number"
              min={0}
              value={form.sort_order ?? 0}
              onChange={e => setField('sort_order', parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Status</label>
            <div className="flex gap-2 sm:gap-3">
              {(['active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField('status', s)}
                  className={cn(
                    'flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border transition-all',
                    form.status === s
                      ? s === 'active' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
                      : 'bg-slate-50 border-slate-300 text-gray-500 hover:border-gray-600'
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-gray-400 text-sm font-bold hover:border-gray-600 hover:text-slate-900 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[#F8F9FD] border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-gray-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 bg-gray-800 rounded-lg" />
            <div className="h-3 w-52 bg-gray-800/60 rounded-lg" />
          </div>
          <div className="flex gap-2">
            {[1,2,3].map(j => <div key={j} className="w-8 h-8 rounded-xl bg-gray-800" />)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function CatPagination({ page, lastPage, total, perPage, onPage }: {
  page: number; lastPage: number; total: number; perPage: number; onPage: (p: number) => void
}) {
  if (lastPage <= 1) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
  const start = Math.max(0, Math.min(page - 3, lastPage - 5))
  const visible = pages.slice(start, start + 5)
  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-2 sm:gap-4">
      <p className="text-xs text-gray-600">Showing {from}&ndash;{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 text-gray-500 hover:text-slate-900 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        {visible.map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={cn('w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-xs font-black transition-all',
              p === page ? 'bg-amber-500 text-black' : 'border border-slate-200 text-gray-500 hover:text-slate-900 hover:border-gray-600'
            )}>{p}</button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === lastPage}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-gray-500 hover:text-slate-900 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  isSubcategory = false,
  expanded = false,
  hasSubcategories = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleStatus,
  toggling,
}: {
  cat: Category
  isSubcategory?: boolean
  expanded?: boolean
  hasSubcategories?: boolean
  onToggleExpand?: () => void
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onToggleStatus: (cat: Category) => void
  toggling: number | null
}) {
  return (
    <div className={cn(
      'relative border rounded-2xl p-3 sm:p-4 flex items-center gap-3 hover:border-slate-300 transition-all',
      isSubcategory ? 'bg-[#F4F6FB] border-slate-200/40' : 'bg-[#F8F9FD] border-slate-200',
    )}>
      {/* Expand toggle */}
      {!isSubcategory && (
        <button onClick={onToggleExpand}
          className={cn('shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-all',
            hasSubcategories ? 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-gray-800 cursor-default'
          )}>
          {hasSubcategories
            ? expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />
            : <span className="w-3.5 h-3.5 block" />}
        </button>
      )}

      {/* Image */}
      <div className={cn(
        'rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0',
        isSubcategory ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11'
      )}>
        {cat.image
          ? <img src={cat.image.startsWith('/') && !cat.image.startsWith('/api') ? `/api${cat.image}` : cat.image} alt={cat.name} className="w-full h-full object-cover" />
          : <Tag className={cn(isSubcategory ? 'w-3.5 h-3.5' : 'w-4 h-4', 'text-gray-600')} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={cn('text-slate-800 font-bold truncate', isSubcategory ? 'text-sm' : 'text-sm sm:text-base')}>
            {cat.name}
          </h3>
          {isSubcategory && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 whitespace-nowrap">
              sub
            </span>
          )}
          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap',
            cat.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}>
            {cat.status}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs">
          <span className="text-gray-600">/{cat.slug}</span>
          {cat.product_count !== undefined && <span className="text-gray-600">{cat.product_count} products</span>}
          {!isSubcategory && Number(cat.sub_count) > 0 && (
            <span className="text-purple-500/70">{cat.sub_count} subcategories</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onToggleStatus(cat)} disabled={toggling === cat.id}
          title={cat.status === 'active' ? 'Deactivate' : 'Activate'}
          className={cn('p-2 rounded-xl transition-colors',
            cat.status === 'active' ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/5'
          )}>
          {toggling === cat.id
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : cat.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(cat)}
          className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(cat)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const [categories,    setCategories]    = useState<Category[]>([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [formOpen,      setFormOpen]      = useState(false)
  const [editTarget,    setEditTarget]    = useState<Category | undefined>(undefined)
  const [defaultParent, setDefaultParent] = useState<number | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<Category | null>(null)
  const [toggling,      setToggling]      = useState<number | null>(null)
  const [expanded,      setExpanded]      = useState<Set<number>>(new Set())
  const [catPage,       setCatPage]       = useState(1)
  const CAT_PER_PAGE = 10

  const load = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
      // Auto-expand parents that already have subcategories
      const parentIds = new Set(
        data.filter(c => c.parent_id != null).map(c => c.parent_id as number)
      )
      setExpanded(parentIds)
    } catch {
      toast({ title: 'Failed to load categories', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const mainCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories])
  const parentOptions  = mainCategories // same list for the form dropdown

  type TreeNode = Category & { subs: Category[] }
  const tree = useMemo<TreeNode[]>(() =>
    mainCategories.map(main => ({
      ...main,
      subs: categories.filter(c => c.parent_id === main.id),
    })),
    [mainCategories, categories]
  )

  const isSearching   = search.trim().length > 0
  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = search.toLowerCase()
    return categories.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }, [categories, search, isSearching])

  const catLastPage  = Math.max(1, Math.ceil(tree.length / CAT_PER_PAGE))
  const paginatedTree = tree.slice((catPage - 1) * CAT_PER_PAGE, catPage * CAT_PER_PAGE)

  const toggleExpand = (id: number) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleToggle = async (cat: Category) => {
    setToggling(cat.id)
    try {
      const newStatus = await categoryService.toggle(cat.id)
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: newStatus as 'active' | 'inactive' } : c))
      toast({ title: `Category ${newStatus === 'active' ? 'activated' : 'deactivated'}` })
    } catch {
      toast({ title: 'Toggle failed', variant: 'destructive' })
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoryService.delete(deleteTarget.id)
      // Also remove child categories from local state (they'll be promoted server-side)
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast({ title: 'Category deleted' })
      load() // reload to get promoted subcategories
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const openCreate = (parentId: number | null = null) => {
    setEditTarget(undefined); setDefaultParent(parentId); setFormOpen(true)
  }
  const openEdit   = (cat: Category) => { setEditTarget(cat); setDefaultParent(null); setFormOpen(true) }
  const handleSaved = () => { setFormOpen(false); load() }

  const subCount = categories.filter(c => !!c.parent_id).length

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Categories</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage main categories &amp; subcategories</p>
        </div>
        <button onClick={() => openCreate(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-black rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total',         value: categories.length,                                    color: 'text-white' },
          { label: 'Main',          value: mainCategories.length,                                color: 'text-amber-400' },
          { label: 'Subcategories', value: subCount,                                             color: 'text-purple-400' },
          { label: 'Active',        value: categories.filter(c => c.status === 'active').length, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#F8F9FD] border border-slate-200 rounded-2xl p-3 sm:p-4">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
            <p className={cn('text-xl sm:text-2xl font-black mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search categories or subcategories…"
          value={search}
          onChange={e => { setSearch(e.target.value); setCatPage(1) }}
          className="w-full bg-[#F8F9FD] border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <CategorySkeleton />
      ) : isSearching ? (
        searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="w-10 h-10 text-gray-700 mb-4" />
            <p className="text-slate-800 font-bold">No results for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {searchResults.map(cat => (
              <CategoryRow key={cat.id} cat={cat} isSubcategory={!!cat.parent_id}
                toggling={toggling} onEdit={openEdit} onDelete={setDeleteTarget} onToggleStatus={handleToggle} />
            ))}
          </div>
        )
      ) : tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <Tag className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-slate-800 font-bold text-lg">No categories yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first main category to get started</p>
          <button onClick={() => openCreate(null)}
            className="mt-4 px-4 py-2 bg-amber-500 text-black text-sm font-black rounded-xl hover:bg-amber-400 transition-colors">
            + Create Category
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedTree.map(node => (
              <div key={node.id}>
                <CategoryRow
                  cat={node}
                  expanded={expanded.has(node.id)}
                  hasSubcategories={node.subs.length > 0}
                  onToggleExpand={() => toggleExpand(node.id)}
                  toggling={toggling}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggleStatus={handleToggle}
                />

                {/* Subcategory rows */}
                {expanded.has(node.id) && (
                  <div className="mt-1.5 ml-8 sm:ml-10 space-y-1.5 relative before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-px before:bg-gray-800">
                    {node.subs.map(sub => (
                      <CategoryRow key={sub.id} cat={sub} isSubcategory
                        toggling={toggling} onEdit={openEdit} onDelete={setDeleteTarget} onToggleStatus={handleToggle} />
                    ))}
                    <button onClick={() => openCreate(node.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-200 text-gray-600 hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5 transition-all text-xs font-bold">
                      <Plus className="w-3.5 h-3.5" /> Add subcategory to {node.name}
                    </button>
                  </div>
                )}

                {/* Prompt to add first subcategory */}
                {!expanded.has(node.id) && node.subs.length === 0 && (
                  <div className="mt-1 ml-8 sm:ml-10">
                    <button onClick={() => openCreate(node.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-200 text-gray-700 hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-500/5 transition-all text-xs font-medium">
                      <Plus className="w-3 h-3" /> Add subcategory
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <CatPagination page={catPage} lastPage={catLastPage} total={tree.length} perPage={CAT_PER_PAGE} onPage={setCatPage} />
        </>
      )}

      {/* ── Form slide-over ── */}
      {formOpen && (
        <CategoryForm
          category={editTarget}
          parentCategories={parentOptions}
          defaultParentId={editTarget ? undefined : defaultParent}
          onSave={handleSaved}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* ── Delete dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white border border-slate-200 shadow-xl text-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete <span className="text-slate-800 font-bold">"{deleteTarget?.name}"</span>?
              {!deleteTarget?.parent_id && (
                <span className="block mt-1 text-amber-400/80 text-xs">
                  Any subcategories will be promoted to main categories. Products will be unlinked.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

