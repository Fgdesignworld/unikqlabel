"use client"

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { blogService, type BlogPost, type BlogPostPayload } from '@/services/blogService'
import { useImageCompress } from '@/hooks/use-image-compress'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { AdminSelect } from '@/components/admin/AdminSelect'
import {
  ArrowLeft,
  Save,
  Check,
  Loader2,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  BookOpen,
  Star,
  Clock,
  Tag,
  Eye,
  Globe,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}

function imgUrl(src: string | null | undefined): string | null {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('blob:')) return src
  return src.startsWith('/api') ? src : `/api${src}`
}

const CATEGORIES = [
  'General', 'Wellness', 'Home Care', 'Natural Living', 'Tips & Tricks',
  'Ingredients', 'Research', 'Lifestyle', 'How-To', 'News',
]

export default function AdminBlogFormPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isEdit    = Boolean(id)
  const coverCompress = useImageCompress({ maxSizeKB: 400, maxWidthPx: 2400 })

  const [loading,  setLoading]  = useState(isEdit)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [seoOpen,  setSeoOpen]  = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  const [form, setForm] = useState<BlogPostPayload>({
    title:       '',
    slug:        '',
    excerpt:     '',
    content:     '',
    cover_image: null,
    author:      'Admin',
    category:    'General',
    tags:        [],
    status:      'draft',
    featured:    false,
    read_time:   null,
    meta_title:  null,
    meta_desc:   null,
  })
  const [tagsInput, setTagsInput] = useState('')

  // ── Load existing post ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    blogService.adminGetById(Number(id))
      .then(post => {
        setForm({
          title:       post.title,
          slug:        post.slug,
          excerpt:     post.excerpt ?? '',
          content:     post.content ?? '',
          cover_image: post.cover_image,
          author:      post.author,
          category:    post.category,
          tags:        post.tags ?? [],
          status:      post.status,
          featured:    post.featured,
          read_time:   post.read_time,
          meta_title:  post.meta_title,
          meta_desc:   post.meta_desc,
        })
        setTagsInput((post.tags ?? []).join(', '))
        setSlugEdited(true) // don't auto-regenerate slug for existing posts
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Auto-generate slug from title ─────────────────────────────────────
  const setField = useCallback(<K extends keyof BlogPostPayload>(key: K, val: BlogPostPayload[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'title' && !slugEdited) {
        next.slug = toSlug(val as string)
      }
      if (key === 'slug') {
        setSlugEdited(true)
      }
      return next
    })
  }, [slugEdited])

  // ── Cover image upload ─────────────────────────────────────────────────
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const compressed = await coverCompress.compress(file)
      coverCompress.markUploading()
      const url = await blogService.uploadImage(compressed)
      coverCompress.markDone()
      setField('cover_image', url)
    } catch {
      coverCompress.markError()
      setError('Cover image upload failed')
    }
  }

  // ── Tags ───────────────────────────────────────────────────────────────
  const handleTagsInput = (val: string) => {
    setTagsInput(val)
    const tags = val.split(',').map(t => t.trim()).filter(Boolean)
    setField('tags', tags)
  }

  const removeTag = (tag: string) => {
    const newTags = (form.tags ?? []).filter(t => t !== tag)
    setField('tags', newTags)
    setTagsInput(newTags.join(', '))
  }

  // ── Save ───────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent, overrideStatus?: 'draft' | 'published') => {
    e.preventDefault()
    if (!form.title?.trim()) { setError('Title is required'); return }

    setError('')
    setSuccess(false)
    setSaving(true)

    const payload = {
      ...form,
      status: overrideStatus ?? form.status,
      slug: form.slug || toSlug(form.title!),
      tags: form.tags?.length ? form.tags : [],
    }

    try {
      if (isEdit) {
        await blogService.update(Number(id), payload)
      } else {
        await blogService.create(payload as Required<BlogPostPayload>)
      }
      setSuccess(true)
      setTimeout(() => navigate('/admin/blog'), 1200)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading post…</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/admin/blog"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEdit ? 'Edit' : 'New'} <span className="text-amber-500">Post</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-sm font-bold animate-in fade-in slide-in-from-right-4">
              <Check className="w-4 h-4" /> Saved!
            </div>
          )}
          {/* Save as Draft */}
          <button
            type="button"
            onClick={e => { (form.status as string) !== 'draft' && setField('status', 'draft'); handleSave(e as any, 'draft') }}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            Save Draft
          </button>
          {/* Publish */}
          <button
            type="button"
            onClick={e => handleSave(e as any, 'published')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {form.status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── LEFT: Main Content ────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Title */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Post Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Write a compelling post title…"
              className="w-full text-2xl font-bold text-slate-900 placeholder-slate-300 bg-transparent outline-none border-b border-slate-200 focus:border-amber-400 pb-2 transition-all"
            />
            {/* Slug */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Slug:</span>
              <input
                type="text"
                value={form.slug ?? ''}
                onChange={e => { setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugEdited(true) }}
                className="flex-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400 transition-all"
                placeholder="auto-generated"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Excerpt <span className="text-slate-400 font-normal normal-case text-[11px]">— shown on blog listing</span>
            </label>
            <textarea
              value={form.excerpt ?? ''}
              onChange={e => setField('excerpt', e.target.value)}
              placeholder="A short summary of the post (2–3 sentences)…"
              rows={3}
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-400 focus:bg-white resize-none transition-all"
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Content
            </label>
            <RichTextEditor
              value={form.content ?? ''}
              onChange={html => setField('content', html)}
              placeholder="Start writing your post — bold, headings, lists, links and more…"
            />
          </div>

          {/* SEO Collapsible */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-800">SEO Settings</span>
                <span className="text-[10px] text-gray-400">optional</span>
              </div>
              {seoOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {seoOpen && (
              <div className="px-6 pb-6 space-y-4 border-t border-slate-100">
                <div className="mt-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={form.meta_title ?? ''}
                    onChange={e => setField('meta_title', e.target.value || null)}
                    placeholder="Custom page title for search engines (60 chars)"
                    maxLength={300}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    {(form.meta_title ?? '').length}/60 chars
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={form.meta_desc ?? ''}
                    onChange={e => setField('meta_desc', e.target.value || null)}
                    placeholder="Brief description for search results (150 chars)"
                    rows={3}
                    maxLength={500}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white resize-none transition-all"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    {(form.meta_desc ?? '').length}/155 chars
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar ────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {(['draft', 'published'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField('status', s)}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-bold capitalize border transition-all',
                    form.status === s
                      ? s === 'published'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-slate-50 border-slate-200 text-gray-500 hover:border-slate-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Cover Image
            </p>
            {imgUrl(form.cover_image) ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                <img
                  src={imgUrl(form.cover_image)!}
                  alt="Cover"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('blog-cover-upload')?.click()}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Upload className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setField('cover_image', null)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => !coverCompress.busy && document.getElementById('blog-cover-upload')?.click()}
                disabled={coverCompress.busy}
                className="w-full h-36 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-gray-500 hover:text-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {coverCompress.busy
                  ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  : <Upload className="w-6 h-6" />}
                <span className="text-xs font-bold">
                  {coverCompress.status === 'compressing' ? 'Compressing…'
                    : coverCompress.status === 'uploading' ? 'Uploading…'
                    : 'Upload Cover Image'}
                </span>
                <span className="text-[10px] text-gray-400">Auto-compressed · max 400 KB</span>
              </button>
            )}
            {coverCompress.info && (
              <p className="mt-2 text-[10px] font-bold text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> {coverCompress.info}
              </p>
            )}
            <input
              id="blog-cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Category
            </label>
            <AdminSelect
              value={form.category}
              onChange={val => setField('category', val)}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              placeholder="Select category..."
              className="bg-[#FAF8F5] border border-[#1F4D3A]/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-none hover:bg-slate-100/10 text-[#1F4D3A]"
            />
          </div>

          {/* Author */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Author
            </label>
            <input
              type="text"
              value={form.author}
              onChange={e => setField('author', e.target.value)}
              placeholder="Author name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => handleTagsInput(e.target.value)}
              placeholder="wellness, home care, tips…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />
            <p className="mt-1.5 text-[10px] text-gray-400">Comma-separated</p>
            {(form.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.tags ?? []).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Read Time + Featured */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            {/* Read Time */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Read Time (minutes)
              </label>
              <input
                type="number"
                value={form.read_time ?? ''}
                onChange={e => setField('read_time', e.target.value ? parseInt(e.target.value) : null)}
                min={1}
                max={120}
                placeholder="e.g. 5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Featured Post</p>
                <p className="text-[11px] text-gray-500">Highlight this post at the top</p>
              </div>
              <button
                type="button"
                onClick={() => setField('featured', !form.featured)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-all',
                  form.featured ? 'bg-amber-500' : 'bg-slate-200'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                  form.featured ? 'left-5' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>

          {/* Quick Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
