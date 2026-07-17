"use client"

﻿import { useState, useEffect } from 'react'
import { colorLibraryService, type LibraryColor } from '@/services/colorLibraryService'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Trash2, Edit2, Loader2, Check, X, Palette,
  ToggleLeft, ToggleRight,
} from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ── Color form (create / edit) ───────────────────────────────────────────────
function ColorForm({
  color,
  onSave,
  onClose,
}: {
  color?: LibraryColor
  onSave: (c: LibraryColor) => void
  onClose: () => void
}) {
  const { toast } = useToast()
  const [name, setName] = useState(color?.name ?? '')
  const [hex, setHex] = useState(color?.hex_code ?? '#000000')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const saved = color
        ? await colorLibraryService.update(color.id, { name: name.trim(), hex_code: hex })
        : await colorLibraryService.create({ name: name.trim(), hex_code: hex })
      toast({ title: color ? 'Color updated' : 'Color added' })
      onSave(saved)
    } catch {
      toast({ title: 'Failed to save color', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-amber-500/30 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-[#C9A45C] font-medium">{color ? 'Edit color' : 'New color'}</p>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* hex swatch + picker */}
        <label className="relative cursor-pointer shrink-0">
          <div
            className="w-10 h-10 rounded-lg border-2 border-slate-300 shadow-inner"
            style={{ backgroundColor: hex }}
          />
          <input
            type="color"
            value={hex}
            onChange={e => setHex(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>

        {/* name */}
        <input
          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          placeholder="Color name (e.g. Midnight Black)"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />

        {/* hex input */}
        <input
          className="w-28 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:border-amber-500 focus:outline-none uppercase"
          value={hex}
          onChange={e => {
            const v = e.target.value
            setHex(v.startsWith('#') ? v : '#' + v)
          }}
          maxLength={7}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 border border-slate-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {color ? 'Save' : 'Add Color'}
        </button>
      </div>
    </form>
  )
}

// ── Color tile ───────────────────────────────────────────────────────────────
function ColorTile({
  color,
  onUpdated,
  onDeleted,
}: {
  color: LibraryColor
  onUpdated: (c: LibraryColor) => void
  onDeleted: (id: number) => void
}) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try {
      const updated = await colorLibraryService.update(color.id, { is_active: color.is_active ? 0 : 1 })
      onUpdated(updated)
    } catch {
      toast({ title: 'Failed to toggle', variant: 'destructive' })
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      await colorLibraryService.delete(color.id)
      onDeleted(color.id)
      toast({ title: 'Color deleted' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
    setDeleteTarget(false)
  }

  if (editing) {
    return (
      <ColorForm
        color={color}
        onSave={updated => { onUpdated(updated); setEditing(false) }}
        onClose={() => setEditing(false)}
      />
    )
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
          color.is_active
            ? 'bg-white border-slate-200'
            : 'bg-slate-50 border-slate-200/60 opacity-60'
        )}
      >
        {/* swatch */}
        <div
          className="w-8 h-8 rounded-lg shrink-0 border border-slate-200 shadow-sm"
          style={{ backgroundColor: color.hex_code }}
        />

        {/* name + hex */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{color.name}</p>
          <p className="text-xs text-slate-400 font-mono uppercase">{color.hex_code}</p>
        </div>

        {/* status */}
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            color.is_active
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-slate-100 text-slate-400 border border-slate-200'
          )}
        >
          {color.is_active ? 'Active' : 'Inactive'}
        </span>

        {/* actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
          >
            {toggling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : color.is_active ? (
              <ToggleRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setDeleteTarget(true)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AlertDialog open={deleteTarget} onOpenChange={setDeleteTarget}>
        <AlertDialogContent className="bg-white border border-slate-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete "{color.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This will remove the color from the library. Products already using it will retain their color data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white text-slate-600 border-slate-300 hover:bg-slate-50">Cancel</AlertDialogCancel>
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
export default function AdminColorsPage() {
  const { toast } = useToast()
  const [colors, setColors] = useState<LibraryColor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      setColors(await colorLibraryService.getAll())
    } catch {
      toast({ title: 'Failed to load colors', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (c: LibraryColor) => {
    setColors(prev => [...prev, c])
    setShowForm(false)
  }

  const handleUpdated = (updated: LibraryColor) =>
    setColors(prev => prev.map(c => (c.id === updated.id ? updated : c)))

  const handleDeleted = (id: number) =>
    setColors(prev => prev.filter(c => c.id !== id))

  return (
    <div className="max-w-2xl">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Palette className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Color Library</h1>
            <p className="text-xs text-slate-400">Global color palette — pick from these when editing products</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Color
        </button>
      </div>

      {/* create form */}
      {showForm && (
        <div className="mb-6">
          <ColorForm onSave={handleCreated} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* colors list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : colors.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Palette className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No colors in library yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* active count */}
          <p className="text-xs text-slate-400 mb-3">
            {colors.filter(c => c.is_active).length} active · {colors.length} total
          </p>
          {colors.map(c => (
            <ColorTile
              key={c.id}
              color={c}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
