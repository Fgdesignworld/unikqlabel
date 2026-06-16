import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogService, type BlogPost } from '@/services/blogService'
import { useToast } from '@/hooks/use-toast'
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
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Eye,
  Star,
  ToggleLeft,
  ToggleRight,
  Loader2,
  RefreshCw,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Drafts' },
]

const PER_PAGE = 12

function imgUrl(src: string | null | undefined): string | null {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('blob:')) return src
  return src.startsWith('/api') ? src : `/api${src}`
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminBlogPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [posts, setPosts]       = useState<BlogPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]     = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [page, setPage]         = useState(0)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true)
    else setLoading(true)
    try {
      const all = await blogService.adminGetAll()
      setPosts(all)
    } catch {
      toast({ title: 'Failed to load posts', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Filters ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...posts]
    if (statusTab !== 'all') list = list.filter(p => p.status === statusTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [posts, search, statusTab])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  const handleSearch = (v: string) => { setSearch(v); setPage(0) }
  const handleTab    = (v: string) => { setStatusTab(v); setPage(0) }

  // ── Toggle ────────────────────────────────────────────────────────────────
  const handleToggle = async (id: number) => {
    setToggling(id)
    try {
      const newStatus = await blogService.toggle(id)
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
      toast({ title: newStatus === 'published' ? 'Post published!' : 'Moved to drafts' })
    } catch {
      toast({ title: 'Toggle failed', variant: 'destructive' })
    } finally {
      setToggling(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await blogService.delete(deleteId)
      setPosts(prev => prev.filter(p => p.id !== deleteId))
      toast({ title: 'Post deleted' })
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts:    posts.filter(p => p.status === 'draft').length,
    featured:  posts.filter(p => p.featured).length,
    totalViews: posts.reduce((s, p) => s + p.views, 0),
  }), [posts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Blog <span className="text-amber-500">Manager</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage blog posts</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-gray-500 hover:text-amber-500 hover:border-amber-200 transition-all"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin text-amber-500')} />
          </button>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 text-sm"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Posts',  value: stats.total,     icon: FileText,   color: 'text-slate-700' },
          { label: 'Published',    value: stats.published, icon: BookOpen,   color: 'text-green-500' },
          { label: 'Drafts',       value: stats.drafts,    icon: Edit2,      color: 'text-amber-500' },
          { label: 'Total Views',  value: stats.totalViews.toLocaleString('en-IN'), icon: TrendingUp, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl">
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-[11px] text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, author, category…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
          />
        </div>
        {/* Status Tabs */}
        <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTab(t.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                statusTab === t.value
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-gray-500 hover:text-slate-800'
              )}
            >
              {t.label}
              {t.value !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({t.value === 'published' ? stats.published : stats.drafts})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-12 h-12 text-slate-300" />
          <p className="text-slate-400 font-semibold">
            {search || statusTab !== 'all' ? 'No posts match your filters' : 'No blog posts yet'}
          </p>
          {!search && statusTab === 'all' && (
            <button
              onClick={() => navigate('/admin/blog/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Write First Post
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[2.5fr_1fr_1fr_90px_90px_130px] gap-0 px-5 py-3 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Post</span>
              <span>Category</span>
              <span>Author</span>
              <span>Views</span>
              <span>Date</span>
              <span className="text-right">Actions</span>
            </div>

            {paginated.map(post => (
              <div
                key={post.id}
                className="grid grid-cols-[2.5fr_1fr_1fr_90px_90px_130px] items-center gap-0 px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group"
              >
                {/* Post Info */}
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  {imgUrl(post.cover_image) ? (
                    <img
                      src={imgUrl(post.cover_image)!}
                      alt={post.title}
                      className="w-12 h-10 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900 text-sm truncate">{post.title}</p>
                      {post.featured && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border',
                        post.status === 'published'
                          ? 'text-green-600 border-green-200 bg-green-50'
                          : 'text-amber-600 border-amber-200 bg-amber-50'
                      )}>
                        {post.status}
                      </span>
                      {post.read_time && (
                        <span className="text-[10px] text-gray-400">{post.read_time} min read</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-slate-600 truncate">{post.category}</span>
                </div>

                {/* Author */}
                <span className="text-sm text-slate-600 truncate">{post.author}</span>

                {/* Views */}
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-slate-600">{post.views.toLocaleString('en-IN')}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-slate-500">
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  {/* Toggle publish */}
                  <button
                    onClick={() => handleToggle(post.id)}
                    disabled={toggling === post.id}
                    title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-xl hover:bg-slate-100 text-gray-400 hover:text-amber-500 transition-all disabled:opacity-40"
                  >
                    {toggling === post.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : post.status === 'published'
                        ? <ToggleRight className="w-4 h-4 text-green-500" />
                        : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => navigate(`/admin/blog/${post.id}`)}
                    className="p-2 rounded-xl hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-all"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => setDeleteId(post.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginated.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {imgUrl(post.cover_image) ? (
                    <img
                      src={imgUrl(post.cover_image)!}
                      alt={post.title}
                      className="w-14 h-12 object-cover rounded-xl flex-shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 text-sm leading-snug">{post.title}</p>
                      {post.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={cn(
                        'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border',
                        post.status === 'published'
                          ? 'text-green-600 border-green-200 bg-green-50'
                          : 'text-amber-600 border-amber-200 bg-amber-50'
                      )}>
                        {post.status}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> {post.category}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" /> {post.views}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleToggle(post.id)}
                    disabled={toggling === post.id}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all',
                      post.status === 'published'
                        ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                        : 'border-slate-200 text-gray-500 hover:border-amber-200 hover:text-amber-500'
                    )}
                  >
                    {toggling === post.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : post.status === 'published'
                        ? <><ToggleRight className="w-3.5 h-3.5" /> Published</>
                        : <><ToggleLeft className="w-3.5 h-3.5" /> Draft</>}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/blog/${post.id}`)}
                    className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-600 hover:bg-amber-100 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(post.id)}
                    className="p-2 bg-red-50 border border-red-200 rounded-xl text-red-500 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3">
              <p className="text-sm text-gray-500">
                Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl border border-slate-200 text-gray-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      'w-8 h-8 rounded-xl text-xs font-bold transition-all',
                      page === i
                        ? 'bg-amber-500 text-black'
                        : 'text-gray-500 hover:bg-slate-50 border border-slate-200'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-xl border border-slate-200 text-gray-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
