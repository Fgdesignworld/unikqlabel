"use client"

import { useState, useEffect, useRef } from 'react'
import { popupService, type PopupData } from '@/services/popupService'
import { useToast } from '@/hooks/use-toast'
import {
    Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Upload,
    X, Check, Loader2, Image as ImageIcon, Megaphone, Eye
} from 'lucide-react'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ─── Popup Form ───────────────────────────────────────────────────────────────
function PopupForm({ popup, onSave, onClose }: { popup?: PopupData, onSave: () => void, onClose: () => void }) {
    const { toast } = useToast()
    const fileRef   = useRef<HTMLInputElement>(null)
    const isEditing = !!popup?.id

    const [form, setForm] = useState<PopupData>({
        title:               popup?.title ?? '',
        description:         popup?.description ?? '',
        image:               popup?.image ?? null,
        button_text:         popup?.button_text ?? '',
        button_link:         popup?.button_link ?? '',
        delay_seconds:       popup?.delay_seconds ?? 2,
        is_active:           popup?.is_active ?? false,
        price:               popup?.price ?? null,
        header_background:   popup?.header_background ?? '#b91c1c',
        items:               popup?.items ?? [],
    })
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving]       = useState(false)
    const [newItem, setNewItem]     = useState({ id: 0, name: '', weight: '', image: '' })

    const set = (key: keyof PopupData, val: unknown) => setForm(p => ({ ...p, [key]: val }))

    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const url = await popupService.uploadImage(file)
            set('image', url)
        } catch { toast({ title: 'Upload failed', variant: 'destructive' }) }
        finally { setUploading(false) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return }
        setSaving(true)
        try {
            if (isEditing && popup?.id) {
                await popupService.update(popup.id, form)
                toast({ title: 'Popup updated!' })
            } else {
                await popupService.create(form)
                toast({ title: 'Popup created!' })
            }
            onSave()
        } catch { toast({ title: 'Save failed', variant: 'destructive' }) }
        finally { setSaving(false) }
    }

    const imageUrl = form.image ? (form.image.startsWith('/') && !form.image.startsWith('/api') ? `/api${form.image}` : form.image) : null

    return (
        <div className="fixed inset-0 z-60 flex">
            <div className="flex-1 bg-slate-800/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <div>
                        <h2 className="text-slate-900 font-black text-">{isEditing ? 'Edit Popup' : 'New Popup'}</h2>
                        <p className="text-gray-500 text-xs mt-0.5">Promotional modal shown to visitors</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Title <span className="text-red-400">*</span></label>
                        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. 20% OFF on First Order!"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Description</label>
                        <textarea rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Limited time offer…"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Popup Image</label>
                        <div onClick={() => fileRef.current?.click()}
                            className="relative w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500/50 bg-slate-50 cursor-pointer flex items-center justify-center overflow-hidden transition-all group">
                            {imageUrl ? (
                                <>
                                    <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-600">
                                    {uploading ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <ImageIcon className="w-6 h-6" />}
                                    <span className="text-xs">{uploading ? 'Uploading...' : 'Click to upload'}</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </div>

                    {/* Button */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Button Text</label>
                            <input type="text" value={form.button_text ?? ''} onChange={e => set('button_text', e.target.value)} placeholder="Shop Now"
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Button Link</label>
                            <input type="text" value={form.button_link ?? ''} onChange={e => set('button_link', e.target.value)} placeholder="/products"
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Delay */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Show After (seconds)</label>
                        <input type="number" min={0} max={30} value={form.delay_seconds ?? 2} onChange={e => set('delay_seconds', parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                        <p className="text-gray-600 text-xs mt-1">0 = show immediately</p>
                    </div>

                    {/* Price (for combo) */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Combo Price (₹)</label>
                        <input type="number" min={0} step={0.01} value={form.price ?? ''} onChange={e => set('price', e.target.value ? parseFloat(e.target.value) : null)} placeholder="899"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                        <p className="text-gray-600 text-xs mt-1">Optional: Set a price for the combo offer</p>
                    </div>

                    {/* Header Background Color */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Header Color (Hex)</label>
                        <div className="flex gap-2">
                            <input type="color" value={form.header_background ?? '#b91c1c'} onChange={e => set('header_background', e.target.value)}
                                className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer"
                            />
                            <input type="text" value={form.header_background ?? '#b91c1c'} onChange={e => set('header_background', e.target.value)}
                                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Combo Items */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Combo Items</label>
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                            {Array.isArray(form.items) && form.items.map((item, idx) => (
                                <div key={idx} className="bg-white border border-slate-300 rounded-lg p-3 flex items-center justify-between group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-800 text-sm font-bold truncate">{item.name}</p>
                                        <p className="text-gray-500 text-xs">{item.weight}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => set('items', (form.items as any[])?.filter((_, i) => i !== idx) || [])}
                                        className="ml-2 text-red-400 hover:text-red-300 transition-colors p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Item name"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
                            />
                            <input
                                type="text"
                                placeholder="Weight (e.g. 250g)"
                                value={newItem.weight}
                                onChange={e => setNewItem({ ...newItem, weight: e.target.value })}
                                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (newItem.name.trim() && newItem.weight.trim()) {
                                    set('items', [...(form.items as any[] || []), { id: Date.now(), name: newItem.name, weight: newItem.weight, image: '' }])
                                    setNewItem({ id: 0, name: '', weight: '', image: '' })
                                }
                            }}
                            className="w-full py-2 rounded-lg border border-slate-300 text-gray-400 hover:text-slate-900 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                        <div>
                            <p className="text-slate-800 text-sm font-bold">Activate Popup</p>
                            <p className="text-gray-500 text-xs mt-0.5">Only one popup can be active at a time</p>
                        </div>
                        <button type="button" onClick={() => set('is_active', !form.is_active)}
                            className={cn('w-11 h-6 rounded-full transition-colors relative', form.is_active ? 'bg-amber-500' : 'bg-gray-700')}>
                            <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', form.is_active ? 'left-5' : 'left-0.5')} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-gray-400 text-sm font-bold hover:border-gray-600 hover:text-slate-900 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || uploading} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {isEditing ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPopupPage() {
    const { toast } = useToast()
    const [popups, setPopups]         = useState<PopupData[]>([])
    const [loading, setLoading]       = useState(true)
    const [formOpen, setFormOpen]     = useState(false)
    const [editTarget, setEditTarget] = useState<PopupData | undefined>(undefined)
    const [deleteTarget, setDelTarget] = useState<PopupData | null>(null)
    const [toggling, setToggling]     = useState<number | null>(null)
    const [preview, setPreview]       = useState<PopupData | null>(null)

    const load = async () => {
        try { const data = await popupService.getAll(); setPopups(data) }
        catch { toast({ title: 'Failed to load popups', variant: 'destructive' }) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const handleToggle = async (p: PopupData) => {
        if (!p.id) return
        setToggling(p.id)
        try {
            const newState = await popupService.toggle(p.id)
            setPopups(prev => prev.map(x => ({ ...x, is_active: x.id === p.id ? newState : (newState ? false : x.is_active) })))
            toast({ title: newState ? 'Popup activated' : 'Popup deactivated' })
        } catch { toast({ title: 'Toggle failed', variant: 'destructive' }) }
        finally { setToggling(null) }
    }

    const handleDelete = async () => {
        if (!deleteTarget?.id) return
        try {
            await popupService.delete(deleteTarget.id)
            setPopups(prev => prev.filter(p => p.id !== deleteTarget.id))
            toast({ title: 'Popup deleted' })
        } catch { toast({ title: 'Delete failed', variant: 'destructive' }) }
        finally { setDelTarget(null) }
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Popup / Offers</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage promotional modals shown to visitors</p>
                </div>
                <button onClick={() => { setEditTarget(undefined); setFormOpen(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-black rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />New Popup
                </button>
            </div>

            {/* Info banner */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-400 text-sm">
                💡 Only <strong>one popup</strong> can be active at a time. Activating one will automatically deactivate others.
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
                </div>
            ) : popups.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                    <Megaphone className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-slate-800 font-bold text-lg">No popups yet</p>
                    <button onClick={() => { setEditTarget(undefined); setFormOpen(true) }}
                        className="mt-4 px-4 py-2 bg-amber-500 text-black text-sm font-black rounded-xl hover:bg-amber-400 transition-colors">
                        + Create Popup
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {popups.map(p => (
                        <div key={p.id} className={cn(
                            'bg-[#F8F9FD] border rounded-2xl overflow-hidden group hover:border-slate-300 transition-all',
                            p.is_active ? 'border-amber-500/30' : 'border-slate-200'
                        )}>
                            {/* Image */}
                            {p.image && (
                                <div className="relative h-32 overflow-hidden">
                                    <img src={p.image.startsWith('/') && !p.image.startsWith('/api') ? `/api${p.image}` : p.image} alt={p.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0e0e0e] to-transparent" />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-slate-800 font-bold text-sm truncate">{p.title}</h3>
                                            {p.is_active && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">LIVE</span>
                                            )}
                                        </div>
                                        {p.description && <p className="text-gray-500 text-xs line-clamp-2">{p.description}</p>}
                                        <div className="flex items-center gap-2 mt-1">
                                            {p.price && <span className="text-amber-400 text-xs font-bold">₹{p.price}</span>}
                                            {Array.isArray(p.items) && p.items.length > 0 && (
                                                <span className="text-blue-400 text-xs">{p.items.length} items</span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-xs mt-1">Delay: {p.delay_seconds ?? 2}s</p>
                                        {/* Analytics */}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-gray-600 text-xs">👁 {p.views ?? 0} views</span>
                                            <span className="text-gray-600 text-xs">🔗 {p.clicks ?? 0} clicks</span>
                                            {(p.views ?? 0) > 0 && (
                                                <span className="text-emerald-600 text-xs font-bold">
                                                    {((( p.clicks ?? 0) / (p.views ?? 1)) * 100).toFixed(1)}% CTR
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-200">
                                    {/* Toggle */}
                                    <button onClick={() => handleToggle(p)} disabled={toggling === p.id}
                                        title={p.is_active ? 'Deactivate' : 'Activate'}
                                        className={cn('p-2 rounded-xl transition-colors flex-1 flex items-center justify-center gap-1.5 text-xs font-bold border',
                                            p.is_active ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-50 border-slate-200 text-gray-500 hover:text-white')}>
                                        {toggling === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : p.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button onClick={() => setPreview(p)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors" title="Preview">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setEditTarget(p); setFormOpen(true) }} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDelTarget(p)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {formOpen && <PopupForm popup={editTarget} onSave={() => { setFormOpen(false); load() }} onClose={() => setFormOpen(false)} />}

            {/* Preview modal */}
            {preview && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-[#F8F9FD] border border-slate-200 rounded-3xl overflow-hidden">
                        {preview.image && (
                            <div className="relative w-full aspect-video">
                                <img src={preview.image.startsWith('/') && !preview.image.startsWith('/api') ? `/api${preview.image}` : preview.image} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6">
                            <h3 className="text-xl font-black text-slate-900">{preview.title}</h3>
                            {preview.description && <p className="text-gray-400 text-sm mt-2">{preview.description}</p>}
                            <div className="flex gap-3 mt-4">
                                {preview.button_text && <span className="flex-1 py-2.5 bg-amber-500 text-black text-sm font-black rounded-xl text-center">{preview.button_text}</span>}
                                <button onClick={() => setPreview(null)} className="flex-1 py-2.5 border border-slate-300 text-gray-400 text-sm font-bold rounded-xl">Close preview</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDelTarget(null)}>
                <AlertDialogContent className="bg-white border border-slate-200 shadow-xl text-slate-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Popup?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This popup will be permanently deleted.
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
