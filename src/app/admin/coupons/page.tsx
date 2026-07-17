"use client"

import { useState, useEffect } from 'react'
import { couponService, type Coupon, type CouponPayload } from '@/services/couponService'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight,
  X, Check, Loader2, RefreshCw, Copy, Tag, Calendar,
  ChevronDown, AlertTriangle, Ticket,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { AdminSelect } from '@/components/admin/AdminSelect'

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function formatDate(dt: string | null): string {
  if (!dt) return 'â€”'
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// â”€â”€â”€ CouponForm (Sheet slide panel) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_FORM: CouponPayload = {
  code: '',
  type: 'percentage',
  value: '',
  min_order_amount: '',
  max_discount: '',
  usage_limit: '',
  user_limit: '',
  expires_at: '',
  is_active: true,
}

function CouponForm({
  coupon,
  open,
  onSave,
  onClose,
}: {
  coupon?: Coupon
  open: boolean
  onSave: () => void
  onClose: () => void
}) {
  const { toast } = useToast()
  const isEditing = !!coupon

  const [form, setForm] = useState<CouponPayload>(() => {
    if (!coupon) return EMPTY_FORM
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount ?? '',
      max_discount: coupon.max_discount ?? '',
      usage_limit: coupon.usage_limit ?? '',
      user_limit: coupon.user_limit ?? '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active,
    }
  })
  const [calOpen, setCalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset form when coupon changes
  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_order_amount: coupon.min_order_amount ?? '',
        max_discount: coupon.max_discount ?? '',
        usage_limit: coupon.usage_limit ?? '',
        user_limit: coupon.user_limit ?? '',
        expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
        is_active: coupon.is_active,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [coupon, open])

  const set = (key: keyof CouponPayload, val: unknown) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const selectedDate = form.expires_at ? new Date(form.expires_at) : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) { toast({ title: 'Coupon code is required', variant: 'destructive' }); return }
    if (!form.value || Number(form.value) <= 0) { toast({ title: 'Value must be > 0', variant: 'destructive' }); return }
    setSaving(true)
    try {
      if (isEditing) {
        await couponService.update(coupon!.id, form)
        toast({ title: 'Coupon updated!' })
      } else {
        await couponService.create(form)
        toast({ title: 'Coupon created!' })
      }
      onSave()
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Save failed'
      toast({ title: msg, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'block text-[10px] font-black uppercase tracking-widest text-amber-500/70 mb-1.5'
  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm outline-none focus:border-amber-500/50 transition-colors placeholder-slate-400'

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[440px] bg-white border-l border-slate-200 flex flex-col p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-slate-900 font-black text-">
                {isEditing ? 'Edit Coupon' : 'New Coupon'}
              </SheetTitle>
              <p className="text-gray-500 text-xs mt-0.5">
                {isEditing ? `Editing ${coupon!.code}` : 'Create a discount coupon'}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form id="coupon-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Code */}
            <div>
              <label className={labelCls}>Coupon Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_\-]/g, ''))}
                placeholder="e.g. SAVE20"
                maxLength={30}
                className={cn(inputCls, 'font-mono font-bold tracking-widest')}
              />
              <p className="text-gray-700 text-[10px] mt-1">Letters, numbers, _ and - only</p>
            </div>

            {/* Type + Value */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type *</label>
                <AdminSelect
                  value={form.type}
                  onChange={val => set('type', val)}
                  options={[
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'fixed', label: 'Fixed (₹)' },
                  ]}
                />
              </div>
              <div>
                <label className={labelCls}>Value * {form.type === 'percentage' ? '(%)' : '(₹)'}</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={e => set('value', e.target.value)}
                  min={0.01}
                  max={form.type === 'percentage' ? 100 : undefined}
                  step="0.01"
                  placeholder={form.type === 'percentage' ? '20' : '100'}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Min order + Max discount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Min Order (₹)</label>
                <input
                  type="number"
                  value={form.min_order_amount ?? ''}
                  onChange={e => set('min_order_amount', e.target.value)}
                  min={0}
                  step="1"
                  placeholder="Optional"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Max Discount (₹)
                  <span className="normal-case font-normal text-gray-600 ml-1 tracking-normal">% only</span>
                </label>
                <input
                  type="number"
                  value={form.max_discount ?? ''}
                  onChange={e => set('max_discount', e.target.value)}
                  min={0.01}
                  step="0.01"
                  placeholder="Optional"
                  disabled={form.type === 'fixed'}
                  className={cn(inputCls, form.type === 'fixed' && 'opacity-40 cursor-not-allowed')}
                />
              </div>
            </div>

            {/* Usage limit */}
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input
                type="number"
                value={form.usage_limit ?? ''}
                onChange={e => set('usage_limit', e.target.value)}
                min={1}
                step="1"
                placeholder="Unlimited"
                className={inputCls}
              />
            </div>

            {/* Expiry Date â€” Calendar Picker */}
            <div>
              <label className={labelCls}>Expiry Date</label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      inputCls,
                      'flex items-center justify-between text-left',
                      !selectedDate && 'text-gray-700'
                    )}
                  >
                    <span>
                      {selectedDate ? format(selectedDate, 'dd MMM yyyy') : 'Pick a date (optional)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {selectedDate && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); set('expires_at', ''); setCalOpen(false) }}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Calendar className="w-4 h-4 text-amber-500/60" />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white border border-slate-200 rounded-2xl shadow-2xl"
                  align="start"
                >
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={day => {
                      set('expires_at', day ? format(day, 'yyyy-MM-dd') : '')
                      setCalOpen(false)
                    }}
                    disabled={{ before: new Date() }}
                    initialFocus
                    className="text-white [&_.rdp-day_button]:text-gray-300 [&_.rdp-day_button:hover]:bg-amber-500/20 [&_.rdp-day_button.rdp-day_selected]:bg-amber-500 [&_.rdp-day_button.rdp-day_selected]:text-black [&_.rdp-nav_button]:text-gray-400 [&_.rdp-nav_button:hover]:bg-white/10 [&_.rdp-caption_label]:text-white [&_.rdp-head_cell]:text-gray-600"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-800">Active</p>
                <p className="text-xs text-slate-400 mt-0.5">Customers can use this coupon</p>
              </div>
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                className="transition-colors"
              >
                {form.is_active
                  ? <ToggleRight className="w-9 h-9 text-amber-500" />
                  : <ToggleLeft className="w-9 h-9 text-gray-700" />
                }
              </button>
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 border border-slate-200 hover:border-gray-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="coupon-form"
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminCouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons]     = useState<Coupon[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editCoupon, setEditCoupon] = useState<Coupon | undefined>(undefined)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [toggling, setToggling]   = useState<number | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const data = await couponService.getAll()
      setCoupons(data)
    } catch {
      toast({ title: 'Failed to load coupons', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id: number) => {
    setToggling(id)
    try {
      const updated = await couponService.toggle(id)
      setCoupons(prev => prev.map(c => c.id === id ? updated : c))
      toast({ title: updated.is_active ? 'Coupon activated' : 'Coupon deactivated' })
    } catch {
      toast({ title: 'Toggle failed', variant: 'destructive' })
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await couponService.delete(deleteId)
      setCoupons(prev => prev.filter(c => c.id !== deleteId))
      toast({ title: 'Coupon deleted' })
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast({ title: `"${code}" copied!` }))
  }

  const openCreate = () => { setEditCoupon(undefined); setSheetOpen(true) }
  const openEdit   = (c: Coupon) => { setEditCoupon(c); setSheetOpen(true) }
  const closeSheet = () => { setSheetOpen(false); setEditCoupon(undefined) }
  const afterSave  = () => { closeSheet(); load() }

  // Filtered list
  const filtered = coupons.filter(c => {
    const matchSearch = !search || c.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      filterStatus === 'all'      ? true :
      filterStatus === 'active'   ? (c.is_active && !isExpired(c.expires_at)) :
      filterStatus === 'inactive' ? !c.is_active :
      filterStatus === 'expired'  ? isExpired(c.expires_at) : true
    return matchSearch && matchStatus
  })

  // Summary stats
  const activeCnt  = coupons.filter(c => c.is_active && !isExpired(c.expires_at)).length
  const expiredCnt = coupons.filter(c => isExpired(c.expires_at)).length
  const totalUsed  = coupons.reduce((s, c) => s + c.used_count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-gray-400 hover:text-slate-900 hover:border-gray-600 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-black rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Coupons', value: coupons.length, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
          { label: 'Active',        value: activeCnt,       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
          { label: 'Expired',       value: expiredCnt,      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          { label: 'Total Usages',  value: totalUsed,       color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
        ].map(card => (
          <div key={card.label} className={cn('bg-white border rounded-2xl p-4 md:p-5', card.border)}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bg)}>
              <Ticket className={cn('w-5 h-5', card.color)} />
            </div>
            <p className={cn('text-2xl font-black', card.color)}>{card.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by coupon code..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm placeholder-slate-400 outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'inactive', 'expired'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all',
                filterStatus === f
                  ? 'bg-amber-500 text-black'
                  : 'bg-white border border-slate-200 text-gray-400 hover:text-slate-900 hover:border-gray-600'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Ticket className="w-8 h-8 text-amber-500/40" />
          </div>
          <div className="text-center">
            <p className="text-slate-800 font-bold">No coupons found</p>
            <p className="text-gray-600 text-sm mt-1">
              {search || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Create your first coupon to get started'}
            </p>
          </div>
          {!search && filterStatus === 'all' && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-black rounded-xl transition-all">
              <Plus className="w-4 h-4" />
              Create Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Code', 'Type / Value', 'Usage', 'Min Order', 'Expiry', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {filtered.map(coupon => {
                  const expired = isExpired(coupon.expires_at)
                  const statusLabel = expired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'
                  const statusColor = expired
                    ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                    : coupon.is_active
                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                    : 'text-gray-500 bg-gray-500/10 border-slate-300'

                  return (
                    <tr key={coupon.id} className="group hover:bg-white/[0.015] transition-colors">
                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm">{coupon.code}</span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-600 hover:text-amber-400"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Type / Value */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            'text-[10px] font-black px-2 py-0.5 rounded-full border',
                            coupon.type === 'percentage'
                              ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                              : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                          )}>
                            {coupon.type === 'percentage' ? '%' : '₹'}
                          </span>
                          <span className="text-slate-800 font-bold text-sm">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                          </span>
                          {coupon.max_discount && coupon.type === 'percentage' && (
                            <span className="text-xs text-gray-600">max ₹{coupon.max_discount}</span>
                          )}
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm text-slate-800 font-bold">{coupon.used_count}</span>
                          <span className="text-gray-600 text-sm">{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}</span>
                          {coupon.usage_limit && (
                            <div className="mt-1.5 h-1 w-20 rounded-full bg-gray-800 overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (coupon.used_count / coupon.usage_limit) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : '—'}
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4">
                        <div className={cn('flex items-center gap-1.5 text-sm', expired ? 'text-orange-400' : 'text-gray-500')}>
                          {coupon.expires_at && <Calendar className="w-3.5 h-3.5" />}
                          {formatDate(coupon.expires_at)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black border', statusColor)}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggle(coupon.id)}
                            disabled={toggling === coupon.id}
                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                            className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-gray-600 hover:text-amber-400"
                          >
                            {toggling === coupon.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : coupon.is_active
                              ? <ToggleRight className="w-4 h-4 text-amber-500" />
                              : <ToggleLeft className="w-4 h-4" />
                            }
                          </button>
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-gray-600 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(coupon.id)}
                            className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-gray-600 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {filtered.map(coupon => {
              const expired = isExpired(coupon.expires_at)
              const statusLabel = expired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'
              const statusColor = expired
                ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                : coupon.is_active
                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : 'text-gray-500 bg-gray-500/10 border-slate-300'

              return (
                <div key={coupon.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400">{coupon.code}</span>
                      <button onClick={() => handleCopyCode(coupon.code)} className="text-gray-600 hover:text-amber-400 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black border', statusColor)}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs block mb-0.5">Discount</span>
                      <p className="text-slate-800 font-bold">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs block mb-0.5">Usage</span>
                      <p className="text-slate-800 font-bold">{coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs block mb-0.5">Min Order</span>
                      <p className="text-slate-800 font-bold">{coupon.min_order_amount ? `₹${coupon.min_order_amount}` : '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs block mb-0.5">Expires</span>
                      <p className={cn('font-bold', expired ? 'text-orange-400' : 'text-slate-800')}>{formatDate(coupon.expires_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <button onClick={() => handleToggle(coupon.id)} disabled={toggling === coupon.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-gray-500 hover:text-amber-400 hover:border-amber-500/30 transition-colors">
                      {toggling === coupon.id ? <Loader2 className="w-3 h-3 animate-spin" /> : coupon.is_active ? <ToggleRight className="w-3.5 h-3.5 text-amber-500" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {coupon.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => openEdit(coupon)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-gray-500 hover:text-slate-900 hover:border-gray-600 transition-colors">
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(coupon.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-900/30 text-red-500/80 hover:bg-red-500/10 hover:border-red-500/40 transition-colors ml-auto">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Slide-over Sheet for create/edit */}
      <CouponForm
        coupon={editCoupon}
        open={sheetOpen}
        onSave={afterSave}
        onClose={closeSheet}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent className="bg-white border border-slate-200 shadow-xl text-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Coupon
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. Customers will no longer be able to use this coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-300 text-gray-300 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white border-0">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
