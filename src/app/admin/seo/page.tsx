"use client"

import { useState, useEffect } from 'react'
import { seoService, type SeoRecord } from '@/services/seoService'
import { useToast } from '@/hooks/use-toast'
import { Globe, Loader2, Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ─── Static pages list ────────────────────────────────────────────────────────
const STATIC_PAGES = [
    { label: 'Home',     emoji: '🏠', pageType: 'home', pageSlug: 'home',     path: '/' },
    { label: 'About',    emoji: '📖', pageType: 'page', pageSlug: 'about',    path: '/about' },
    { label: 'Contact',  emoji: '📞', pageType: 'page', pageSlug: 'contact',  path: '/contact' },
    { label: 'Products', emoji: '🛍️', pageType: 'page', pageSlug: 'products', path: '/products' },
    { label: 'Pickles',  emoji: '🫙', pageType: 'page', pageSlug: 'pickles',  path: '/pickles' },
    { label: 'Snacks',   emoji: '🍿', pageType: 'page', pageSlug: 'snacks',   path: '/snacks' },
    { label: 'Spices',   emoji: '🌶️', pageType: 'page', pageSlug: 'spices',   path: '/spices' },
    { label: 'Checkout', emoji: '🛒', pageType: 'page', pageSlug: 'checkout', path: '/checkout' },
] as const

// ─── Character counter ────────────────────────────────────────────────────────
function CharCount({ value, max, hint }: { value: string; max: number; hint: string }) {
    const len   = (value || '').length
    const over  = len > max
    const close = !over && len > max * 0.85
    return (
        <div className="flex items-center justify-between mt-1">
            <span className="text-gray-600 text-xs">{hint}</span>
            <span className={cn('text-xs font-mono', over ? 'text-red-400' : close ? 'text-amber-400' : 'text-gray-600')}>
                {len}/{max}
            </span>
        </div>
    )
}

// ─── PageSeoForm slide-over ───────────────────────────────────────────────────
type PageConfig = typeof STATIC_PAGES[number]

function PageSeoForm({
    page,
    existing,
    onSave,
    onClose,
    onDelete,
}: {
    page: PageConfig
    existing?: SeoRecord
    onSave: () => void
    onClose: () => void
    onDelete?: () => void
}) {
    const { toast } = useToast()

    const [form, setForm] = useState({
        meta_title:       existing?.meta_title       ?? '',
        meta_description: existing?.meta_description ?? '',
        meta_keywords:    existing?.meta_keywords    ?? '',
        og_image:         existing?.og_image         ?? '',
    })
    const [saving, setSaving]       = useState(false)
    const [previewOpen, setPreview] = useState(false)
    const [confirmDel, setConfirm]  = useState(false)

    const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await seoService.upsert({
                page_type:        page.pageType,
                page_id:          null,
                page_slug:        page.pageSlug,
                meta_title:       form.meta_title       || null,
                meta_description: form.meta_description || null,
                meta_keywords:    form.meta_keywords    || null,
                og_image:         form.og_image         || null,
            } as SeoRecord)
            toast({ title: `SEO saved for ${page.label}!` })
            onSave()
        } catch {
            toast({ title: 'Save failed', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const siteBase   = window.location.hostname
    const prevTitle  = form.meta_title       || `${page.label} — Site`
    const prevDesc   = form.meta_description || 'No description set.'

    return (
        <div className="fixed inset-0 z-60 flex">
            <div className="flex-1 bg-slate-800/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-lg bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{page.emoji}</span>
                        <div>
                            <h2 className="text-slate-900 font-black text-">{page.label}</h2>
                            <p className="text-gray-500 text-xs font-mono">{page.path}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {existing?.id && onDelete && (
                            <button onClick={() => setConfirm(true)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-white/5">
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-5">
                    {/* Meta Title */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Meta Title</label>
                        <input
                            type="text"
                            value={form.meta_title}
                            onChange={e => set('meta_title', e.target.value)}
                            placeholder={`${page.label} |`}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                        <CharCount value={form.meta_title} max={60} hint="Optimal: 50–60 chars" />
                    </div>

                    {/* Meta Description */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Meta Description</label>
                        <textarea
                            rows={3}
                            value={form.meta_description}
                            onChange={e => set('meta_description', e.target.value)}
                            placeholder={`Discover authentic ${page.label.toLowerCase()} from KoffeeKup...`}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                        />
                        <CharCount value={form.meta_description} max={160} hint="Optimal: 150–160 chars" />
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Meta Keywords</label>
                        <input
                            type="text"
                            value={form.meta_keywords}
                            onChange={e => set('meta_keywords', e.target.value)}
                            placeholder="keyword1, keyword2, keyword3"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                        <p className="text-gray-600 text-xs mt-1">Comma-separated</p>
                    </div>

                    {/* OG Image */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">OG / Social Image URL</label>
                        <input
                            type="text"
                            value={form.og_image}
                            onChange={e => set('og_image', e.target.value)}
                            placeholder="https://... or /uploads/..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>

                    {/* Google Preview toggle */}
                    <div>
                        <button type="button" onClick={() => setPreview(p => !p)}
                            className="flex items-center gap-1.5 text-amber-500 text-xs font-bold hover:text-amber-400 transition-colors">
                            {previewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            Google Preview
                        </button>
                        {previewOpen && (
                            <div className="mt-3 bg-white rounded-xl p-4">
                                <p className="text-green-700 text-xs">{siteBase}{page.path}</p>
                                <p className="text-blue-700 text-base font-medium mt-0.5 line-clamp-1">{prevTitle}</p>
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{prevDesc}</p>
                            </div>
                        )}
                    </div>

                    {/* Save */}
                    <button type="submit" disabled={saving}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save SEO for {page.label}
                    </button>
                </form>
            </div>

            {/* Confirm delete */}
            <AlertDialog open={confirmDel} onOpenChange={setConfirm}>
                <AlertDialogContent className="bg-white border border-slate-200 shadow-xl text-slate-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear SEO for {page.label}?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Meta tags for this page will be removed. The page will fall back to browser defaults.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setConfirm(false); onDelete?.() }} className="bg-red-600 hover:bg-red-500 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSeoPage() {
    const { toast } = useToast()
    const [seoMap, setSeoMap]         = useState<Record<string, SeoRecord>>({})
    const [loading, setLoading]       = useState(true)
    const [activePage, setActivePage] = useState<typeof STATIC_PAGES[number] | null>(null)

    const buildKey = (pageType: string, pageSlug: string) => `${pageType}/${pageSlug}`

    const load = async () => {
        try {
            const all = await seoService.getAll()
            const map: Record<string, SeoRecord> = {}
            all.forEach(r => {
                const key = buildKey(r.page_type, r.page_slug ?? r.page_type)
                map[key] = r
            })
            setSeoMap(map)
        } catch {
            toast({ title: 'Failed to load SEO data', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (page: typeof STATIC_PAGES[number]) => {
        const rec = seoMap[buildKey(page.pageType, page.pageSlug)]
        if (!rec?.id) return
        try {
            await seoService.delete(rec.id)
            setSeoMap(prev => {
                const next = { ...prev }
                delete next[buildKey(page.pageType, page.pageSlug)]
                return next
            })
            setActivePage(null)
            toast({ title: `SEO cleared for ${page.label}` })
        } catch {
            toast({ title: 'Delete failed', variant: 'destructive' })
        }
    }

    const configured = STATIC_PAGES.filter(p => !!seoMap[buildKey(p.pageType, p.pageSlug)]).length

    return (
        <>
            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-amber-500" /> SEO Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {loading ? 'Loading…' : `${configured} / ${STATIC_PAGES.length} pages configured`}
                    </p>
                </div>

                {/* Progress bar */}
                {!loading && (
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-700"
                            style={{ width: `${(configured / STATIC_PAGES.length) * 100}%` }}
                        />
                    </div>
                )}

                {/* Page cards grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {STATIC_PAGES.map(page => {
                            const rec     = seoMap[buildKey(page.pageType, page.pageSlug)]
                            const hasSeo  = !!rec

                            return (
                                <button
                                    key={page.pageSlug}
                                    onClick={() => setActivePage(page)}
                                    className={cn(
                                        'relative text-left p-4 rounded-2xl border transition-all group hover:scale-[1.02]',
                                        hasSeo
                                            ? 'bg-[#F8F9FD] border-amber-500/20 hover:border-amber-500/40'
                                            : 'bg-[#F8F9FD] border-slate-200 hover:border-slate-300'
                                    )}
                                >
                                    {/* Configured dot */}
                                    <span className={cn(
                                        'absolute top-3 right-3 w-2 h-2 rounded-full',
                                        hasSeo ? 'bg-green-500' : 'bg-gray-700'
                                    )} />

                                    <div className="text-3xl mb-3">{page.emoji}</div>
                                    <p className="text-slate-900 font-black text-">{page.label}</p>
                                    <p className="text-gray-600 text-xs font-mono mt-0.5">{page.path}</p>

                                    <div className="mt-3">
                                        {hasSeo ? (
                                            <>
                                                <span className="inline-block text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                    Configured
                                                </span>
                                                {rec.meta_title && (
                                                    <p className="text-gray-500 text-xs mt-1.5 line-clamp-1">{rec.meta_title}</p>
                                                )}
                                            </>
                                        ) : (
                                            <span className="inline-block text-[10px] font-bold text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                                                Not set
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 text-xs font-bold">
                                        Edit →
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {activePage && (
                <PageSeoForm
                    page={activePage!}
                    existing={seoMap[buildKey(activePage!.pageType, activePage!.pageSlug)]}
                    onSave={() => { load(); setActivePage(null) }}
                    onClose={() => setActivePage(null)}
                    onDelete={activePage ? () => handleDelete(activePage!) : undefined}
                />
            )}
        </>
    )
}
