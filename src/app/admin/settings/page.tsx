import { useState, useEffect, useRef, useCallback } from 'react'
import { settingsService } from '@/services/settingsService'
import { useSettings } from '@/context/settings-context'
import { useToast } from '@/hooks/use-toast'
import {
    Save, Upload, Loader2, RefreshCw, Phone, Share2, Palette, Type,
    Store, Search, ChevronDown, X as XIcon, CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── 50 Popular Google Fonts ──────────────────────────────────────────────────
const GOOGLE_FONTS: { name: string; category: string }[] = [
    // Popular
    { name: 'Inter',            category: 'Popular' },
    { name: 'Roboto',           category: 'Popular' },
    { name: 'Open Sans',        category: 'Popular' },
    { name: 'Lato',             category: 'Popular' },
    { name: 'Montserrat',       category: 'Popular' },
    { name: 'Poppins',          category: 'Popular' },
    { name: 'Nunito',           category: 'Popular' },
    { name: 'Raleway',          category: 'Popular' },
    { name: 'Oswald',           category: 'Popular' },
    { name: 'DM Sans',          category: 'Popular' },
    // Modern / Clean
    { name: 'Work Sans',        category: 'Modern' },
    { name: 'Rubik',            category: 'Modern' },
    { name: 'Barlow',           category: 'Modern' },
    { name: 'Jost',             category: 'Modern' },
    { name: 'Manrope',          category: 'Modern' },
    { name: 'Mulish',           category: 'Modern' },
    { name: 'Cabin',            category: 'Modern' },
    { name: 'Quicksand',        category: 'Modern' },
    { name: 'Varela Round',     category: 'Modern' },
    { name: 'Karla',            category: 'Modern' },
    // Professional
    { name: 'IBM Plex Sans',    category: 'Professional' },
    { name: 'Source Sans 3',    category: 'Professional' },
    { name: 'Ubuntu',           category: 'Professional' },
    { name: 'PT Sans',          category: 'Professional' },
    { name: 'Exo 2',            category: 'Professional' },
    { name: 'Josefin Sans',     category: 'Professional' },
    { name: 'Noto Sans',        category: 'Professional' },
    { name: 'Inconsolata',      category: 'Professional' },
    { name: 'Frank Ruhl Libre', category: 'Professional' },
    { name: 'Zilla Slab',       category: 'Professional' },
    // Serif / Elegant
    { name: 'Playfair Display', category: 'Serif' },
    { name: 'Merriweather',     category: 'Serif' },
    { name: 'Bitter',           category: 'Serif' },
    { name: 'Libre Baskerville',category: 'Serif' },
    { name: 'Crimson Text',     category: 'Serif' },
    { name: 'Arvo',             category: 'Serif' },
    { name: 'Spectral',         category: 'Serif' },
    { name: 'Cormorant Garamond', category: 'Serif' },
    { name: 'EB Garamond',      category: 'Serif' },
    { name: 'Lora',             category: 'Serif' },
    // Display / Decorative
    { name: 'Anton',            category: 'Display' },
    { name: 'Bebas Neue',       category: 'Display' },
    { name: 'Righteous',        category: 'Display' },
    { name: 'Lobster',          category: 'Display' },
    { name: 'Pacifico',         category: 'Display' },
    { name: 'Dancing Script',   category: 'Display' },
    { name: 'Caveat',           category: 'Display' },
    { name: 'Sacramento',       category: 'Display' },
    { name: 'Satisfy',          category: 'Display' },
    { name: 'Courgette',        category: 'Display' },
]

// ─── FontSelect ───────────────────────────────────────────────────────────────
function FontSelect({ value, onChange }: { value: string; onChange: (f: string) => void }) {
    const [open, setOpen]     = useState(false)
    const [search, setSearch] = useState('')
    const ref     = useRef<HTMLDivElement>(null)
    const loaded  = useRef<Set<string>>(new Set())

    const loadFont = useCallback((name: string) => {
        if (!name || loaded.current.has(name)) return
        loaded.current.add(name)
        const id = 'gf-' + name.replace(/\s+/g, '-').toLowerCase()
        if (document.getElementById(id)) return
        const link  = document.createElement('link')
        link.id     = id
        link.rel    = 'stylesheet'
        link.href   = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}&display=swap`
        document.head.appendChild(link)
    }, [])

    useEffect(() => { if (value) loadFont(value) }, [value, loadFont])

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false); setSearch('')
            }
        }
        document.addEventListener('mousedown', fn)
        return () => document.removeEventListener('mousedown', fn)
    }, [])

    const filtered = GOOGLE_FONTS.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
    )

    const grouped = filtered.reduce<Record<string, string[]>>((acc, f) => {
        if (!acc[f.category]) acc[f.category] = []
        acc[f.category].push(f.name)
        return acc
    }, {})

    const meta = GOOGLE_FONTS.find(f => f.name === value)

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setTimeout(() => document.getElementById('fs-search')?.focus(), 60) }}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm transition-all hover:border-gray-600 focus:outline-none focus:border-amber-500/50"
            >
                <span style={{ fontFamily: value || 'inherit' }} className={value ? 'text-slate-800' : 'text-gray-600'}>
                    {value || 'Select a font...'}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    {meta && <span className="text-gray-600 text-xs hidden sm:inline">{meta.category}</span>}
                    <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform shrink-0', open && 'rotate-180')} />
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                            id="fs-search"
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search fonts..."
                            className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 shrink-0">
                                <XIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-64 overflow-y-auto">
                        {Object.entries(grouped).map(([cat, fonts]) => (
                            <div key={cat}>
                                <div className="px-4 pt-3 pb-1 text-gray-600 text-[10px] font-bold uppercase tracking-widest">{cat}</div>
                                {fonts.map(fontName => (
                                    <button
                                        key={fontName}
                                        type="button"
                                        onMouseEnter={() => loadFont(fontName)}
                                        onClick={() => { onChange(fontName); setOpen(false); setSearch('') }}
                                        className={cn(
                                            'w-full text-left px-4 py-2.5 text-sm transition-colors',
                                            value === fontName
                                                ? 'bg-amber-500/10 text-amber-400'
                                                : 'text-gray-300 hover:bg-slate-50 hover:text-white'
                                        )}
                                    >
                                        <span style={{ fontFamily: fontName }}>{fontName}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-600 text-sm">No fonts found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Live Preview */}
            {value && (
                <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl">
                    <p style={{ fontFamily: value }} className="text-slate-800 text-lg">Aa Bb Cc 123</p>
                    <p style={{ fontFamily: value }} className="text-gray-400 text-sm mt-0.5">
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </div>
            )}
        </div>
    )
}

// ─── LogoDrop (drag-and-drop image upload) ────────────────────────────────────
function LogoDrop({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const { toast }  = useToast()
    const inputRef   = useRef<HTMLInputElement>(null)
    const [dragging, setDragging]   = useState(false)
    const [uploading, setUploading] = useState(false)

    const doUpload = async (file: File) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon']
        if (!allowed.includes(file.type)) {
            toast({ title: 'Only images allowed (JPEG, PNG, WebP, SVG, ICO)', variant: 'destructive' })
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: 'Max file size is 2 MB', variant: 'destructive' })
            return
        }
        setUploading(true)
        try {
            const url = await settingsService.uploadLogo(file)
            onChange(url)
            toast({ title: 'Image uploaded!' })
        } catch {
            toast({ title: 'Upload failed', variant: 'destructive' })
        } finally {
            setUploading(false)
        }
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) doUpload(file)
    }

    const imgSrc = value ? (value.startsWith('/') && !value.startsWith('/api') && !value.startsWith('//') ? `/api${value}` : value) : null

    return (
        <div className="space-y-2">
            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'relative w-full h-28 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden group',
                    dragging
                        ? 'border-amber-500 bg-amber-500/5 scale-[1.01]'
                        : 'border-slate-300 hover:border-amber-500/40 bg-white/2'
                )}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-amber-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold">Uploading…</span>
                    </div>
                ) : imgSrc ? (
                    <>
                        <img src={imgSrc} alt="logo" className="max-h-20 max-w-full object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                        <div className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                            <Upload className="w-5 h-5 text-white" />
                            <span className="text-slate-700 text-xs font-bold">Drag & drop or click to replace</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <Upload className={cn('w-6 h-6', dragging ? 'text-amber-500' : 'text-gray-600')} />
                        <p className={cn('text-xs font-bold', dragging ? 'text-amber-400' : 'text-gray-500')}>
                            {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-gray-700 text-[10px]">PNG · JPG · WebP · SVG · ICO — max 2 MB</p>
                    </div>
                )}
            </div>

            {/* Manual URL fallback */}
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Or paste a URL..."
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
            />
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (file) doUpload(file)
                e.target.value = ''
            }} />
        </div>
    )
}

// Section config
const SECTIONS = [
    { key: 'general',    label: 'General',      icon: Store,       fields: ['site_name','site_tagline','currency_symbol'] },
    { key: 'contact',    label: 'Contact',       icon: Phone,       fields: ['phone','whatsapp','email','address'] },
    { key: 'social',     label: 'Social Media',  icon: Share2,      fields: ['social_facebook','social_instagram','social_youtube','social_twitter'] },
    { key: 'branding',   label: 'Branding',      icon: Palette,     fields: ['theme_color','logo_url','favicon_url'] },
    { key: 'typography', label: 'Typography',    icon: Type,        fields: ['font_heading','font_body'] },
    { key: 'payment',    label: 'Payment',       icon: CreditCard,  fields: ['cod_enabled','razorpay_display_name','razorpay_key_id','razorpay_key_secret'] },
] as const

const FIELD_LABELS: Record<string, string> = {
    site_name:               'Site Name',
    site_tagline:            'Tagline',
    currency_symbol:         'Currency Symbol',
    logo_url:                'Logo URL',
    favicon_url:             'Favicon URL',
    phone:                   'Phone Number',
    whatsapp:                'WhatsApp Number',
    email:                   'Email Address',
    address:                 'Address',
    social_facebook:         'Facebook URL',
    social_instagram:        'Instagram URL',
    social_youtube:          'YouTube URL',
    social_twitter:          'Twitter / X URL',
    theme_color:             'Theme Color (hex)',
    header_bg:               'Header Background',
    footer_bg:               'Footer Background',
    font_heading:            'Heading Font',
    font_body:               'Body Font',
    cod_enabled:             'Enable Cash on Delivery (COD)',
    razorpay_display_name:   'Business Display Name',
    razorpay_key_id:         'Razorpay Key ID (public)',
    razorpay_key_secret:     'Razorpay Key Secret (private)',
}

const FIELD_PLACEHOLDERS: Record<string, string> = {
    site_name:              'KoffeeKup',
    site_tagline:           'Premium Coffee & Delights',
    currency_symbol:        '₹',
    phone:                  '+91 98765 43210',
    whatsapp:               '+91 98765 43210',
    email:                  'hello@koffeekup.com',
    address:                '123, Main Street, City',
    social_facebook:        'https://facebook.com/...',
    social_instagram:       'https://instagram.com/...',
    social_youtube:         'https://youtube.com/...',
    social_twitter:         'https://twitter.com/...',
    theme_color:            '#f59e0b',
    font_heading:           'Playfair Display',
    font_body:              'Poppins',
    cod_enabled:            '1',
    razorpay_display_name:  'Koffeekup',
    razorpay_key_id:        'rzp_live_xxxxxxxxxxxx',
    razorpay_key_secret:    'Leave blank to keep existing secret',
}

function FieldInput({
    fieldKey,
    value,
    onChange,
}: {
    fieldKey: string
    value: string
    onChange: (val: string) => void
}) {
    if (fieldKey === 'cod_enabled') {
        const isEnabled = value === '1' || value === 'true';
        return (
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onChange(isEnabled ? '0' : '1')}
                    className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        isEnabled ? "bg-amber-500" : "bg-slate-300"
                    )}
                >
                    <span
                        className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
                            isEnabled ? "translate-x-5" : "translate-x-0"
                        )}
                    />
                </button>
                <span className="text-xs text-gray-400">
                    {isEnabled ? 'COD option will be shown on Checkout page' : 'COD option will be hidden on Checkout page'}
                </span>
            </div>
        )
    }

    if (fieldKey === 'razorpay_key_secret') {
        const isMasked = value === '••••••••'
        return (
            <div className="space-y-1.5">
                <input
                    type="password"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Enter new secret to update…"
                    autoComplete="new-password"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
                {isMasked && (
                    <p className="text-green-500 text-xs flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        Secret is configured — leave unchanged to keep it
                    </p>
                )}
                {!isMasked && value && (
                    <p className="text-amber-400 text-xs flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        New secret will be saved on next Save
                    </p>
                )}
            </div>
        )
    }

    if (fieldKey === 'theme_color') {
        const handleColorChange = (newColor: string) => {
            onChange(newColor)
            // Apply theme color live to CSS variable for real-time preview
            document.documentElement.style.setProperty('--theme-color', newColor || '#f59e0b')
        }
        return (
            <div className="flex gap-2 items-center">
                <input type="color" value={value || '#f59e0b'} onChange={e => handleColorChange(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0.5" />
                <input type="text" value={value} onChange={e => handleColorChange(e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
                />
            </div>
        )
    }

    if (fieldKey === 'logo_url' || fieldKey === 'favicon_url') {
        return <LogoDrop value={value} onChange={onChange} />
    }

    if (fieldKey === 'font_heading' || fieldKey === 'font_body') {
        return <FontSelect value={value} onChange={onChange} />
    }

    if (fieldKey === 'address') {
        return (
            <textarea rows={2} value={value} onChange={e => onChange(e.target.value)}
                placeholder={FIELD_PLACEHOLDERS[fieldKey] || ''}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
            />
        )
    }

    return (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
            placeholder={FIELD_PLACEHOLDERS[fieldKey] || ''}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-all"
        />
    )
}

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const { refresh: refreshSettings } = useSettings()

    const [form, setForm]            = useState<Record<string, string>>({})
    const [loading, setLoading]      = useState(true)
    const [saving, setSaving]        = useState(false)
    const [activeSection, setActive] = useState<string>('general')
    const [dirty, setDirty]          = useState(false)

    // Watch for theme color changes and apply live
    useEffect(() => {
        if (form.theme_color && form.theme_color.match(/^#[0-9A-F]{6}$/i)) {
            document.documentElement.style.setProperty('--theme-color', form.theme_color)
        }
    }, [form.theme_color])

    const load = async () => {
        try {
            const data = await settingsService.getGrouped()
            // Flatten for form
            const flat: Record<string, string> = {}
            Object.values(data).forEach(group =>
                Object.entries(group).forEach(([k, v]) => { flat[k] = v ?? '' })
            )
            setForm(flat)
            // Apply theme color from settings for live preview
            if (flat.theme_color) {
                document.documentElement.style.setProperty('--theme-color', flat.theme_color)
            }
            setDirty(false)
        } catch {
            toast({ title: 'Failed to load settings', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const setField = (key: string, val: string) => {
        setForm(prev => ({ ...prev, [key]: val }))
        setDirty(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Convert empty strings to null for optional fields
            const payload: Record<string, string | null> = {}
            Object.entries(form).forEach(([k, v]) => { payload[k] = v === '' ? null : v })
            await settingsService.bulkUpdate(payload)
            toast({ title: 'Settings saved!' })
            setDirty(false)
            // Refresh settings context to apply changes globally (including theme color)
            await refreshSettings()
        } catch {
            toast({ title: 'Save failed', variant: 'destructive' })
        } finally {
            setSaving(false)
        }
    }

    const currentSection = SECTIONS.find(s => s.key === activeSection)!

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Global Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Control your site-wide configuration</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="flex items-center gap-2 px-3 py-2.5 border border-slate-300 text-gray-400 text-sm font-bold rounded-xl hover:border-gray-600 hover:text-slate-900 transition-all">
                        <RefreshCw className="w-4 h-4" />Reset
                    </button>
                    <button onClick={handleSave} disabled={saving || !dirty}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-sm font-black rounded-xl transition-all">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Settings
                    </button>
                </div>
            </div>

            {dirty && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-amber-400 text-sm font-bold">
                    You have unsaved changes
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-5">
                {/* Sidebar tabs */}
                <div className="md:w-44 shrink-0 flex md:flex-col gap-2">
                    {SECTIONS.map(s => {
                        const Icon = s.icon
                        return (
                            <button key={s.key} onClick={() => setActive(s.key)}
                                className={cn(
                                    'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left',
                                    activeSection === s.key
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        : 'text-gray-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                )}>
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline md:inline">{s.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Form panel */}
                <div className="flex-1 bg-[#F8F9FD] border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
                        <currentSection.icon className="w-5 h-5 text-amber-500" />
                        <h2 className="text-slate-900 font-black">{currentSection.label}</h2>
                    </div>

                    <div className="space-y-5">
                        {currentSection.fields.map(fieldKey => (
                            <div key={fieldKey}>
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">
                                    {FIELD_LABELS[fieldKey] || fieldKey}
                                </label>
                                <FieldInput
                                    fieldKey={fieldKey}
                                    value={form[fieldKey] ?? ''}
                                    onChange={val => setField(fieldKey, val)}
                                />
                            </div>
                        ))}

                        {/* Typography preview */}
                        {activeSection === 'typography' && (
                            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Preview</p>
                                <p style={{ fontFamily: form.font_heading || 'Playfair Display' }} className="text-slate-800 text-xl mb-1">
                                    {form.site_name || 'KoffeeKup'}
                                </p>
                                <p style={{ fontFamily: form.font_body || 'Poppins' }} className="text-gray-400 text-sm">
                                    {form.site_tagline || 'Premium Coffee & Delights'}
                                </p>
                                <p className="text-gray-600 text-xs mt-2">Fonts from Google Fonts — applied live on the site</p>
                            </div>
                        )}

                        {/* Branding preview with theme color */}
                        {activeSection === 'branding' && (
                            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Theme Preview</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg border-2" style={{ backgroundColor: form.theme_color || '#f59e0b', borderColor: form.theme_color || '#f59e0b' }} />
                                        <div>
                                            <p className="text-slate-800 text-sm font-bold">Theme Color</p>
                                            <p className="text-gray-500 text-xs">{form.theme_color || '#f59e0b'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: (form.theme_color || '#f59e0b') + '10', borderLeft: `3px solid ${form.theme_color || '#f59e0b'}` }}>
                                        <p className="text-slate-800 text-sm font-bold">Sample Button</p>
                                        <button className="mt-2 px-4 py-2 rounded-lg text-white font-bold text-sm transition-all hover:opacity-80" style={{ backgroundColor: form.theme_color || '#f59e0b' }}>
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-xs mt-3">Theme color changes apply globally to admin and frontend after save</p>
                            </div>
                        )}
                        {/* Payment gateway info */}
                        {activeSection === 'payment' && (
                            <div className="mt-5 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1.5">
                                        <p className="text-amber-400 text-xs font-bold">Razorpay Credentials</p>
                                        <p className="text-gray-400 text-xs">Key ID starts with <span className="font-mono text-amber-600">rzp_live_</span> (production) or <span className="font-mono text-amber-600">rzp_test_</span> (test mode).</p>
                                        <p className="text-gray-500 text-xs">The Key Secret is stored encrypted server-side and is never exposed to the browser. You can update it by typing a new value.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}
