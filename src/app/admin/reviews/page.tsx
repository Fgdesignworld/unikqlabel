'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Trash2, Check, X, Loader2, Filter,
  ShieldCheck, Clock, CheckCircle, XCircle, Plus, Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  reviewService,
  type AdminReview,
  type AdminReviewPayload,
} from '@/services/reviewService'
import { productService, type ApiProduct } from '@/services/productService'
import { useToast } from '@/hooks/use-toast'

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const EMPTY_FORM: AdminReviewPayload = {
  product_id: 0,
  name: '',
  email: '',
  rating: 5,
  comment: '',
  status: 'approved',
  is_verified: 1,
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5',
            i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700 fill-gray-800',
          )}
        />
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            className={cn(
              'w-7 h-7 transition-all',
              i <= (hover || value) ? 'text-amber-400 fill-amber-400 scale-110' : 'text-gray-600',
            )}
          />
        </button>
      ))}
    </div>
  )
}

function statusBadge(status: string) {
  if (status === 'approved')
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" />Approved
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />Rejected
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" />Pending
    </span>
  )
}

// ------- Confirmation Dialog -------
interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmationDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-white font-black text-lg mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-black transition-all',
              isDangerous
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-black',
            )}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ------- Review Form Modal -------
interface ReviewFormProps {
  mode: 'create' | 'edit'
  initial?: AdminReview | null
  products: ApiProduct[]
  onClose: () => void
  onSaved: (r: AdminReview) => void
}

function ReviewFormModal({ mode, initial, products, onClose, onSaved }: ReviewFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<AdminReviewPayload>(() =>
    initial
      ? {
          product_id: initial.product_id,
          name: initial.name,
          email: initial.email,
          rating: initial.rating,
          comment: initial.comment,
          status: initial.status,
          is_verified: initial.is_verified ? 1 : 0,
        }
      : { ...EMPTY_FORM },
  )

  const set = (k: keyof AdminReviewPayload, v: AdminReviewPayload[typeof k]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product_id || !form.name.trim() || !form.email.trim() || !form.comment.trim()) {
      toast({ title: 'Missing fields', description: 'Fill in all required fields.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      let saved: AdminReview
      if (mode === 'create') {
        saved = await reviewService.adminCreate(form)
      } else {
        saved = await reviewService.adminUpdate(initial!.id, form)
      }
      onSaved(saved)
      toast({ title: mode === 'create' ? 'Review created' : 'Review updated', description: 'Changes saved successfully.' })
      onClose()
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.error ?? 'Save failed.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-all appearance-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-black text-lg">
            {mode === 'create' ? 'Add Review' : 'Edit Review'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Product *</label>
            <select
              value={form.product_id}
              onChange={e => set('product_id', Number(e.target.value))}
              className={inputCls}
              style={{ colorScheme: 'dark' }}
            >
              <option value={0} disabled>Select product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Reviewer name" className={inputCls} />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" className={inputCls} />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Rating *</label>
            <StarPicker value={form.rating ?? 5} onChange={v => set('rating', v)} />
          </div>

          {/* Comment */}
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Comment *</label>
            <textarea
              value={form.comment}
              onChange={e => set('comment', e.target.value)}
              placeholder="Review text..."
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>

          {/* Status + Verified */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as 'pending' | 'approved' | 'rejected')} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Verified</label>
              <select value={form.is_verified} onChange={e => set('is_verified', Number(e.target.value) as 0 | 1)} className={inputCls} style={{ colorScheme: 'dark' }}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : (mode === 'create' ? 'Add Review' : 'Save Changes')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ------- Main Page -------
export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [processing, setProcessing] = useState<number | null>(null)
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; review?: AdminReview } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number } | null>(null)

  const load = (status?: string) => {
    setLoading(true)
    reviewService
      .adminGetAll(status && status !== 'all' ? { status } : undefined)
      .then(setReviews)
      .catch(() => toast({ title: 'Error', description: 'Failed to load reviews.', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  useEffect(() => {
    productService.adminGetAll().then(setProducts).catch(() => {})
  }, [])

  const handleApprove = async (id: number) => {
    setProcessing(id)
    try {
      await reviewService.approve(id)
      // Update local state to reflect approval + verification
      const now = new Date().toISOString()
      setReviews(rs => rs.map(r => r.id === id ? { ...r, status: 'approved', is_verified: true, verified_at: now } : r))
      toast({ title: 'Approved', description: 'Review is now visible to customers.' })
    } catch {
      toast({ title: 'Error', description: 'Action failed.', variant: 'destructive' })
    } finally { setProcessing(null) }
  }

  const handleReject = async (id: number) => {
    setProcessing(id)
    try {
      await reviewService.reject(id)
      setReviews(rs => rs.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
      toast({ title: 'Rejected', description: 'Review has been rejected.' })
    } catch {
      toast({ title: 'Error', description: 'Action failed.', variant: 'destructive' })
    } finally { setProcessing(null) }
  }

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    const id = deleteConfirm.id
    setDeleteConfirm(null)
    setProcessing(id)
    try {
      await reviewService.delete(id)
      setReviews(rs => rs.filter(r => r.id !== id))
      toast({ title: 'Deleted', description: 'Review removed.' })
    } catch {
      toast({ title: 'Error', description: 'Delete failed.', variant: 'destructive' })
    } finally { setProcessing(null) }
  }

  const handleSaved = (saved: AdminReview) => {
    setReviews(rs => {
      const exists = rs.find(r => r.id === saved.id)
      if (exists) return rs.map(r => r.id === saved.id ? saved : r)
      return [saved, ...rs]
    })
  }

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage customer product reviews</p>
        </div>
        <div className="flex items-center gap-3">
          {counts.pending > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              {counts.pending} pending
            </div>
          )}
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#111] border border-gray-800 rounded-2xl p-1 w-fit flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
              filter === s ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white',
            )}
          >
            {s} {filter !== s && <span className="opacity-60">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No reviews for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {reviews.map(review => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="bg-[#111] border border-gray-800 rounded-2xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Reviewer info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-black shrink-0">
                      {review.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-white text-sm font-bold">{review.name}</span>
                        {review.is_verified && (
                          <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold uppercase">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs truncate">{review.email}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StarRow rating={review.rating} />
                        <span className="text-gray-600 text-xs">
                          {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {review.product_name && (
                          <span className="text-xs text-amber-400/70 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full">
                            {review.product_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {statusBadge(review.status)}

                    {/* Edit */}
                    <button
                      onClick={() => setModal({ mode: 'edit', review })}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-amber-500/15 text-gray-500 hover:text-amber-400 transition-all border border-gray-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {review.status !== 'approved' && (
                      <button onClick={() => handleApprove(review.id)} disabled={processing === review.id}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all border border-emerald-500/20 disabled:opacity-40">
                        {processing === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button onClick={() => handleReject(review.id)} disabled={processing === review.id}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20 disabled:opacity-40">
                        {processing === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button onClick={() => handleDelete(review.id)} disabled={processing === review.id}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all disabled:opacity-40">
                      {processing === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-3">
                    {review.comment}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ReviewFormModal
            mode={modal.mode}
            initial={modal.review ?? null}
            products={products}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <ConfirmationDialog
            title="Delete Review?"
            message="This action cannot be undone. The review will be permanently removed."
            confirmText="Delete"
            cancelText="Cancel"
            isDangerous={true}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}