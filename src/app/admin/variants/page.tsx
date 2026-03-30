import { useState, useEffect } from 'react'
import { sizeVariantService, type SizeVariantSet, type SizeVariant } from '@/services/sizeVariantService'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Trash2, Edit2, ChevronDown, ChevronRight, ToggleLeft,
  ToggleRight, Loader2, GripVertical, Check, X, Ruler,
} from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ── Inline variant row editor ────────────────────────────────────────────────
function VariantRowsEditor({
  setId,
  initialVariants,
  onClose,
}: {
  setId: number
  initialVariants: SizeVariant[]
  onClose: () => void
}) {
  const { toast } = useToast()
  type Row = { label: string; price_adjustment: string; is_active: number; _key: number }

  const toRow = (v: SizeVariant): Row => ({
    label: v.label,
    price_adjustment: v.price_adjustment > 0 ? String(v.price_adjustment) : '',
    is_active: v.is_active,
    _key: v.id,
  })

  const [rows, setRows] = useState<Row[]>(initialVariants.map(toRow))
  const [saving, setSaving] = useState(false)
  let _keyCounter = Date.now()
  const newKey = () => ++_keyCounter

  const addRow = () =>
    setRows(prev => [...prev, { label: '', price_adjustment: '', is_active: 1, _key: newKey() }])

  const updateRow = (idx: number, field: keyof Omit<Row, '_key'>, val: string | number) =>
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)))

  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    const cleaned = rows
      .filter(r => r.label.trim())
      .map((r, idx) => ({
        label: r.label.trim(),
        price_adjustment: parseFloat(r.price_adjustment) || 0,
        sort_order: idx,
        is_active: r.is_active,
      }))

    setSaving(true)
    try {
      await sizeVariantService.saveVariants(setId, cleaned)
      toast({ title: 'Variants saved' })
      onClose()
    } catch {
      toast({ title: 'Failed to save variants', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-amber-500/30 rounded-lg p-4 mt-2 bg-[#111]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-amber-400">Edit Sizes</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {rows.length === 0 && (
          <p className="text-xs text-zinc-500 py-3 text-center">No sizes yet. Add one below.</p>
        )}
        {rows.map((row, idx) => (
          <div key={row._key} className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-zinc-600 shrink-0" />
            <input
              className="flex-1 bg-[#1a1a1a] border border-zinc-700 rounded px-2 py-1 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              placeholder="Label (e.g. XL)"
              value={row.label}
              onChange={e => updateRow(idx, 'label', e.target.value)}
            />
            <input
              className="w-24 bg-[#1a1a1a] border border-zinc-700 rounded px-2 py-1 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              placeholder="+₹0"
              value={row.price_adjustment}
              onChange={e => updateRow(idx, 'price_adjustment', e.target.value)}
              type="number"
              min="0"
            />
            <button
              onClick={() => updateRow(idx, 'is_active', row.is_active ? 0 : 1)}
              className={cn(
                'text-xs px-2 py-1 rounded border transition-colors',
                row.is_active
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : 'border-zinc-700 text-zinc-500 bg-zinc-800/40'
              )}
            >
              {row.is_active ? 'On' : 'Off'}
            </button>
            <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add size
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-xs font-semibold px-3 py-1.5 rounded transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>
    </div>
  )
}

// ── Set card ─────────────────────────────────────────────────────────────────
function SetCard({
  set,
  onUpdated,
  onDeleted,
}: {
  set: SizeVariantSet
  onUpdated: (updated: SizeVariantSet) => void
  onDeleted: (id: number) => void
}) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(set.name)
  const [editSaving, setEditSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(false)

  const handleEditSave = async () => {
    if (!editName.trim()) return
    setEditSaving(true)
    try {
      const updated = await sizeVariantService.update(set.id, { name: editName.trim() })
      onUpdated({ ...updated, variants: set.variants })
      setEditing(false)
    } catch {
      toast({ title: 'Failed to update set', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      const updated = await sizeVariantService.update(set.id, { is_active: set.is_active ? 0 : 1 })
      onUpdated({ ...updated, variants: set.variants })
    } catch {
      toast({ title: 'Failed to toggle', variant: 'destructive' })
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      await sizeVariantService.delete(set.id)
      onDeleted(set.id)
      toast({ title: 'Set deleted' })
    } catch {
      toast({ title: 'Failed to delete set', variant: 'destructive' })
    }
    setDeleteTarget(false)
  }

  const handleVariantsSaved = async () => {
    try {
      const fresh = await sizeVariantService.getAll()
      const freshSet = fresh.find(s => s.id === set.id)
      if (freshSet) onUpdated(freshSet)
    } catch {
      /* ignore */
    }
    setExpanded(false)
  }

  return (
    <>
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          {/* expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-zinc-500 hover:text-amber-400 transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* name */}
          {editing ? (
            <input
              autoFocus
              className="flex-1 bg-[#111] border border-amber-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEditSave()}
            />
          ) : (
            <span className="flex-1 text-sm font-medium text-white">{set.name}</span>
          )}

          {/* variant count badge */}
          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
            {set.variants.length} {set.variants.length === 1 ? 'size' : 'sizes'}
          </span>

          {/* status */}
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              set.is_active
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-zinc-700/40 text-zinc-500'
            )}
          >
            {set.is_active ? 'Active' : 'Inactive'}
          </span>

          {/* actions */}
          <div className="flex items-center gap-1.5">
            {editing ? (
              <>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setEditing(false); setEditName(set.name) }} className="p-1 text-zinc-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  {toggling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : set.is_active ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setDeleteTarget(true)}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* expanded variant editor */}
        {expanded && (
          <div className="px-4 pb-4">
            <VariantRowsEditor
              setId={set.id}
              initialVariants={set.variants}
              onClose={handleVariantsSaved}
            />
          </div>
        )}
      </div>

      {/* delete dialog */}
      <AlertDialog open={deleteTarget} onOpenChange={setDeleteTarget}>
        <AlertDialogContent className="bg-[#1a1a1a] border border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete "{set.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This cannot be undone. Products using this set will retain their existing variant data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminVariantsPage() {
  const { toast } = useToast()
  const [sets, setSets] = useState<SizeVariantSet[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      setSets(await sizeVariantService.getAll())
    } catch {
      toast({ title: 'Failed to load variant sets', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const created = await sizeVariantService.create(newName.trim())
      setSets(prev => [...prev, created])
      setNewName('')
      toast({ title: `"${created.name}" created` })
    } catch {
      toast({ title: 'Failed to create set', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleUpdated = (updated: SizeVariantSet) =>
    setSets(prev => prev.map(s => (s.id === updated.id ? updated : s)))

  const handleDeleted = (id: number) =>
    setSets(prev => prev.filter(s => s.id !== id))

  return (
    <div className="p-6 min-h-screen text-white">
      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <Ruler className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Variant Master</h1>
          <p className="text-xs text-zinc-500">Manage reusable size sets and assign them to products</p>
        </div>
      </div>

      {/* create new */}
      <div className="flex gap-2 mb-8">
        <input
          className="flex-1 bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none transition-colors"
          placeholder="New set name (e.g. Clothing Sizes)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Set
        </button>
      </div>

      {/* sets list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : sets.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Ruler className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No variant sets yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map(set => (
            <SetCard
              key={set.id}
              set={set}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
