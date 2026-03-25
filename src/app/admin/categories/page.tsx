import { useState, useEffect, useRef } from 'react'
import { categoryService, type Category, type CategoryPayload } from '@/services/categoryService'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Edit2, Trash2, Search, Tag, ToggleLeft, ToggleRight,
  Upload, X, Check, Loader2, Image as ImageIcon, RefreshCw
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

// â”€â”€â”€ Slug generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toSlug(val: string) {
  return val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-|-$/g, '')
}

// â”€â”€â”€ CategoryForm (inline slide-over) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CategoryForm({
  category,
  onSave,
  onClose,
}: {
  category?: Category
  onSave: () => void
  onClose: () => void
}) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEditing = !!category

  const [form, setForm] = useState<CategoryPayload>({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    image: category?.image ?? null,
    status: category?.status ?? 'active',
    sort_order: category?.sort_order ?? 0,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

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

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-[#0c0c0c] border-l border-gray-800 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-white font-black text-lg">{isEditing ? 'Edit Category' : 'New Category'}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{isEditing ? 'Update category details' : 'Add a new product category'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-5">

          {/* Image upload */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Category Image</label>
            {form.image ? (
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-gray-700 group">
                <img src={form.image.startsWith('/') ? `/api${form.image}` : form.image} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    type="button"
                    onClick={() => fileRef.current?.click()}
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
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 bg-white/2 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-gray-600 hover:text-amber-500"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <ImageIcon className="w-6 h-6" />}
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
              className="w-full bg-white/4 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/6 transition-all"
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
                className="w-full bg-white/4 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => { setForm(prev => ({ ...prev, slug: toSlug(form.name) })); setSlugEdited(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-500 transition-colors"
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
              className="w-full bg-white/4 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Status</label>
            <div className="flex gap-3">
              {(['active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField('status', s)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all',
                    form.status === s
                      ? s === 'active' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
                      : 'bg-white/2 border-gray-700 text-gray-500 hover:border-gray-600'
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-bold hover:border-gray-600 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  const load = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch {
      toast({ title: 'Failed to load categories', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

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
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast({ title: 'Category deleted' })
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const openCreate = () => { setEditTarget(undefined); setFormOpen(true) }
  const openEdit = (cat: Category) => { setEditTarget(cat); setFormOpen(true) }
  const handleSaved = () => { setFormOpen(false); load() }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-black rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total', value: categories.length, color: 'text-white' },
          { label: 'Active', value: categories.filter(c => c.status === 'active').length, color: 'text-green-400' },
          { label: 'Inactive', value: categories.filter(c => c.status === 'inactive').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0e0e0e] border border-gray-800 rounded-2xl p-4">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
            <p className={cn('text-2xl font-black mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0e0e0e] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tag className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-white font-bold text-lg">No categories found</p>
          <p className="text-gray-500 text-sm mt-1">{search ? 'Try a different search' : 'Create your first category'}</p>
          {!search && (
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-amber-500 text-black text-sm font-black rounded-xl hover:bg-amber-400 transition-colors">
              + Create Category
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-[#0e0e0e] border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-700 transition-all group">
              {/* Image */}
              <div className="w-12 h-12 rounded-xl bg-white/4 border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                {cat.image ? (
                  <img src={`/api${cat.image}`} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Tag className="w-5 h-5 text-gray-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-sm truncate">{cat.name}</h3>
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full border',
                    cat.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  )}>
                    {cat.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-600 text-xs">/category/{cat.slug}</span>
                  {cat.product_count !== undefined && (
                    <span className="text-gray-600 text-xs">{cat.product_count} products</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(cat)}
                  disabled={toggling === cat.id}
                  title={cat.status === 'active' ? 'Deactivate' : 'Activate'}
                  className={cn(
                    'p-2 rounded-xl transition-colors',
                    cat.status === 'active' ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/5'
                  )}
                >
                  {toggling === cat.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : cat.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />
                  }
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form slide-over */}
      {formOpen && (
        <CategoryForm
          category={editTarget}
          onSave={handleSaved}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0e0e0e] border border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete <span className="text-white font-bold">"{deleteTarget?.name}"</span>?
              Products linked to this category will be unlinked (not deleted).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-gray-700 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

