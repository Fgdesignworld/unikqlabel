import { useState, useEffect, useRef } from 'react'
import { heroSlideService, type HeroSlide } from '@/services/heroSlideService'
import { useToast } from '@/hooks/use-toast'
import {
    Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Upload,
    X, Loader2, Image as ImageIcon, Layers, GripVertical,
    ChevronUp, ChevronDown
} from 'lucide-react'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

const CATEGORIES = [
    { value: 'men',      label: 'Men' },
    { value: 'women',    label: 'Women' },
    { value: 'unisex',   label: 'Unisex' },
    { value: 'trending', label: 'Trending' },
    // { value: 'limited',  label: 'Limited Drops' },
] as const

const BADGE_ICONS = ['Crown', 'Zap', 'Star', 'Sparkles', 'Timer', 'ShoppingBag', 'ArrowRight', 'Trophy']

const emptySlide = (): HeroSlide => ({
    title: '',
    subtitle: null,
    tagline: null,
    cta_primary_text: null,
    cta_primary_link: null,
    cta_secondary_text: null,
    cta_secondary_link: null,
    image: null,
    mobile_image: null,
    badge_text: null,
    badge_icon: null,
    category: 'unisex',
    product_ids: [],
    price_label: '',
    is_active: true,
    sort_order: 0,
    start_date: null,
    end_date: null,
})

// ─── Reusable field wrappers (must be at module level to avoid remount on every render) ─
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
        </div>
    )
}

function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={cn(
                "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all",
                props.className
            )}
        />
    )
}

function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={cn(
                "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all min-h-[90px] resize-y",
                props.className
            )}
        />
    )
}

// ─── Slide Form (side drawer) ─────────────────────────────────────────────────
function SlideForm({ slide, onSave, onClose }: {
    slide?: HeroSlide
    onSave: () => void
    onClose: () => void
}) {
    const { toast } = useToast()
    const fileRef      = useRef<HTMLInputElement>(null)
    const mobileRef    = useRef<HTMLInputElement>(null)
    const isEditing    = !!slide?.id

    const [form, setForm]       = useState<HeroSlide>(slide ? { ...slide } : emptySlide())
    const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null)
    const [saving, setSaving]   = useState(false)

    const set = <K extends keyof HeroSlide>(key: K, val: HeroSlide[K]) =>
        setForm(p => ({ ...p, [key]: val }))

    const handleImageUpload = async (file: File, kind: 'desktop' | 'mobile') => {
        setUploading(kind)
        try {
            const url = await heroSlideService.uploadImage(file)
            kind === 'desktop' ? set('image', url) : set('mobile_image', url)
        } catch {
            toast({ title: 'Upload failed', variant: 'destructive' })
        } finally {
            setUploading(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) {
            toast({ title: 'Title is required', variant: 'destructive' })
            return
        }
        setSaving(true)
        try {
            if (isEditing && slide?.id) {
                await heroSlideService.update(slide.id, form)
                toast({ title: 'Slide updated!' })
            } else {
                await heroSlideService.create(form)
                toast({ title: 'Slide created!' })
            }
            onSave()
        } catch {
            toast({ title: 'Save failed', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const imgUrl = (src: string | null | undefined) =>
        src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : null

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-slate-800/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-lg bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-slate-900 font-black text-">
                            {isEditing ? 'Edit Hero Slide' : 'New Hero Slide'}
                        </h2>
                        <p className="text-gray-500 text-xs mt-0.5">Hero section carousel management</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-5">

                    {/* Title */}
                    <Field label="Title" required>
                        <FormInput
                            type="text" value={form.title}
                            onChange={e => set('title', e.target.value)}
                            placeholder="e.g. Dress Like Royalty"
                        />
                    </Field>

                    {/* Subtitle */}
                    <Field label="Subtitle / Eyebrow (optional)">
                        <FormTextarea
                            value={form.subtitle ?? ''}
                            onChange={e => set('subtitle', e.target.value || null)}
                            placeholder="e.g. Premium Natural Wellness"
                            rows={2}
                        />
                    </Field>

                    {/* CTA Primary */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="CTA Button Text (optional)">
                            <FormInput
                                type="text" value={form.cta_primary_text ?? ''}
                                onChange={e => set('cta_primary_text', e.target.value || null)}
                                placeholder="e.g. Shop Collection"
                            />
                        </Field>
                        <Field label="CTA Button Link (optional)">
                            <FormInput
                                type="text" value={form.cta_primary_link ?? ''}
                                onChange={e => set('cta_primary_link', e.target.value || null)}
                                placeholder="e.g. /products"
                            />
                        </Field>
                    </div>


                    {/* Desktop Image */}
                    <Field label="Desktop Image">
                        <input
                            ref={fileRef} type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'desktop')}
                        />
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all group"
                            style={{ minHeight: 120 }}
                        >
                            {imgUrl(form.image) ? (
                                <img src={imgUrl(form.image)!} alt="Desktop preview" className="w-full h-48 object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 gap-2">
                                    <ImageIcon className="w-8 h-8 text-gray-600 group-hover:text-amber-500 transition-colors" />
                                    <span className="text-gray-500 text-xs">Click to upload desktop image</span>
                                </div>
                            )}
                            {uploading === 'desktop' && (
                                <div className="absolute inset-0 bg-slate-800/40 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                </div>
                            )}
                        </div>
                        {form.image && (
                            <button type="button" onClick={() => set('image', null)}
                                className="mt-1.5 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                                <X className="w-3 h-3" /> Remove image
                            </button>
                        )}
                    </Field>

                    {/* Mobile Image */}
                    <Field label="Mobile Image (optional)">
                        <input
                            ref={mobileRef} type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'mobile')}
                        />
                        <div
                            onClick={() => mobileRef.current?.click()}
                            className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all group"
                            style={{ minHeight: 80 }}
                        >
                            {imgUrl(form.mobile_image) ? (
                                <img src={imgUrl(form.mobile_image)!} alt="Mobile preview" className="w-full h-32 object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-20 gap-1.5">
                                    <Upload className="w-6 h-6 text-gray-600 group-hover:text-amber-500 transition-colors" />
                                    <span className="text-gray-500 text-xs">Upload mobile image</span>
                                </div>
                            )}
                            {uploading === 'mobile' && (
                                <div className="absolute inset-0 bg-slate-800/40 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    </Field>


                    {/* Sort order */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Sort Order">
                            <FormInput type="number" value={form.sort_order ?? 0} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} min={0} />
                        </Field>
                        <Field label="Price Label (optional)">
                            <FormInput type="text" value={form.price_label ?? ''} onChange={e => set('price_label', e.target.value)} placeholder="e.g. From ₹999" />
                        </Field>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-slate-800 text-sm font-semibold">Active</p>
                            <p className="text-gray-500 text-xs">Show this slide on the homepage</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set('is_active', !form.is_active)}
                            className="transition-colors"
                        >
                            {form.is_active
                                ? <ToggleRight className="w-8 h-8 text-amber-500" />
                                : <ToggleLeft className="w-8 h-8 text-gray-600" />
                            }
                        </button>
                    </div>

                    {/* Footer action */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-300 text-gray-400 hover:text-slate-900 hover:border-gray-600 text-sm font-semibold transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {saving ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Slide')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminHeroPage() {
    const { toast } = useToast()

    const [slides, setSlides]           = useState<HeroSlide[]>([])
    const [loading, setLoading]         = useState(true)
    const [formSlide, setFormSlide]     = useState<HeroSlide | undefined>(undefined)
    const [showForm, setShowForm]       = useState(false)
    const [deleteId, setDeleteId]       = useState<number | null>(null)
    const [togglingId, setTogglingId]   = useState<number | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const data = await heroSlideService.getAll()
            setSlides(data)
        } catch {
            toast({ title: 'Failed to load slides', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const openNew  = () => { setFormSlide(undefined); setShowForm(true) }
    const openEdit = (s: HeroSlide) => { setFormSlide(s); setShowForm(true) }
    const closeForm = () => { setShowForm(false); setFormSlide(undefined) }
    const afterSave = () => { closeForm(); load() }

    const handleToggle = async (s: HeroSlide) => {
        if (!s.id) return
        setTogglingId(s.id)
        try {
            const newStatus = await heroSlideService.toggle(s.id)
            setSlides(prev => prev.map(x => x.id === s.id ? { ...x, is_active: newStatus } : x))
        } catch {
            toast({ title: 'Failed to toggle status', variant: 'destructive' })
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await heroSlideService.delete(deleteId)
            toast({ title: 'Slide deleted' })
            setDeleteId(null)
            load()
        } catch {
            toast({ title: 'Delete failed', variant: 'destructive' })
        }
    }

    const moveOrder = async (id: number, dir: 'up' | 'down') => {
        const idx = slides.findIndex(s => s.id === id)
        if (idx < 0) return
        if (dir === 'up' && idx === 0) return
        if (dir === 'down' && idx === slides.length - 1) return
        const newSlides = [...slides]
        const swap = dir === 'up' ? idx - 1 : idx + 1
        ;[newSlides[idx], newSlides[swap]] = [newSlides[swap], newSlides[idx]]
        const order = newSlides.map((s, i) => ({ id: s.id!, sort_order: i }))
        setSlides(newSlides.map((s, i) => ({ ...s, sort_order: i })))
        try {
            await heroSlideService.reorder(order)
        } catch {
            toast({ title: 'Reorder failed', variant: 'destructive' })
            load()
        }
    }

    const imgUrl = (src: string | null | undefined) =>
        src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : null


    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-slate-900 font-black text- flex items-center gap-2">
                        <Layers className="w-6 h-6 text-amber-500" />
                        Hero Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage homepage carousel slides</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Slide
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Slides', value: slides.length },
                    { label: 'Active',       value: slides.filter(s => s.is_active).length },
                    { label: 'Scheduled',    value: slides.filter(s => s.start_date || s.end_date).length },
                    { label: 'Inactive',     value: slides.filter(s => !s.is_active).length },
                ].map(stat => (
                    <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-slate-900 font-black text-">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Slides list */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                    </div>
                ) : slides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Layers className="w-12 h-12 text-gray-700" />
                        <p className="text-gray-500 font-semibold">No slides yet</p>
                        <button onClick={openNew} className="text-amber-500 text-sm hover:underline">Create your first slide</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold uppercase tracking-wider">Order</th>
                                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold uppercase tracking-wider">Preview</th>
                                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold uppercase tracking-wider">Title</th>
                                    <th className="text-center px-4 py-3 text-gray-500 text-xs font-bold uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slides.map((slide, idx) => (
                                    <tr key={slide.id} className="border-b border-slate-200/80 hover:bg-slate-50 transition-colors">
                                        {/* Order controls */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <button onClick={() => moveOrder(slide.id!, 'up')} disabled={idx === 0}
                                                    className="text-gray-600 hover:text-amber-500 disabled:opacity-30 transition-colors">
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <span className="text-gray-500 text-xs text-center">{slide.sort_order ?? idx}</span>
                                                <button onClick={() => moveOrder(slide.id!, 'down')} disabled={idx === slides.length - 1}
                                                    className="text-gray-600 hover:text-amber-500 disabled:opacity-30 transition-colors">
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Image preview */}
                                        <td className="px-4 py-3">
                                            <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center border border-slate-300">
                                                {imgUrl(slide.image) ? (
                                                    <img src={imgUrl(slide.image)!} alt={slide.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-gray-600" />
                                                )}
                                            </div>
                                        </td>

                                        {/* Title */}
                                        <td className="px-4 py-3">
                                            <p className="text-slate-800 font-semibold text-sm">{slide.title}</p>
                                        </td>

                                        {/* Status toggle */}
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => handleToggle(slide)} className="transition-colors">
                                                {togglingId === slide.id
                                                    ? <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                                    : slide.is_active
                                                        ? <ToggleRight className="w-7 h-7 text-amber-500" />
                                                        : <ToggleLeft className="w-7 h-7 text-gray-600" />
                                                }
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(slide)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeleteId(slide.id!)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Slide Form drawer */}
            {showForm && (
                <SlideForm slide={formSlide} onSave={afterSave} onClose={closeForm} />
            )}

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-white border border-slate-200 shadow-xl text-slate-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Slide?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-300 text-gray-400 hover:text-slate-900 hover:bg-white/5">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
