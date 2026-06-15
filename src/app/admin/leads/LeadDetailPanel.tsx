'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X, Phone, Mail, MessageSquare, CheckCircle, Clock, Star,
  Flame, Minus, TrendingUp, Send, ChevronDown, Loader2,
  Calendar, Tag, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminSelect } from '@/components/admin/AdminSelect'
import { leadService, type Lead, type LeadFollowup } from '@/services/leadService'

// ─── Inline WhatsApp icon ───────────────────────────────────────────────────────
function WAIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new:       { label: 'New',       color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/30'  },
  contacted: { label: 'Contacted', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  converted: { label: 'Converted', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  closed:    { label: 'Closed',    color: 'text-gray-400',  bg: 'bg-gray-500/10',  border: 'border-gray-500/30'  },
}

const SCORE_META: Record<string, { label: string; color: string; bg: string }> = {
  hot:  { label: 'Hot',  color: 'text-red-400',    bg: 'bg-red-500/10'    },
  warm: { label: 'Warm', color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
  cold: { label: 'Cold', color: 'text-blue-300',   bg: 'bg-blue-500/10'   },
}

const INQUIRY_LABELS: Record<string, string> = {
  order: 'Place Order', bulk: 'Bulk / Wholesale',
  custom_design: 'Custom Design', support: 'Support', other: 'Other',
}

const FOLLOWUP_ICONS: Record<string, React.ElementType> = {
  call: Phone, whatsapp: WAIcon as any, email: Mail,
  meeting: User, note: MessageSquare,
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  lead: Lead
  onClose: () => void
  onUpdated: () => void
}

export default function LeadDetailPanel({ lead, onClose, onUpdated }: Props) {
  const [detail, setDetail]   = useState<Lead>(lead)
  const [loadingDetail, setLoadingDetail] = useState(true)

  const [statusVal, setStatusVal] = useState<Lead['status']>(lead.status)
  const [scoreVal, setScoreVal]   = useState<Lead['lead_score']>(lead.lead_score)
  const [statusSaving, setStatusSaving] = useState(false)

  const [followupType, setFollowupType]   = useState<LeadFollowup['type']>('note')
  const [followupNotes, setFollowupNotes] = useState('')
  const [followupDate, setFollowupDate]   = useState('')
  const [fLoading, setFLoading]           = useState(false)
  const [fError, setFError]               = useState('')

  // Load full detail with followups + activities
  useEffect(() => {
    leadService.getById(lead.id)
      .then(d => { setDetail(d); setStatusVal(d.status); setScoreVal(d.lead_score) })
      .catch(() => {})
      .finally(() => setLoadingDetail(false))
  }, [lead.id])

  const saveStatus = async () => {
    setStatusSaving(true)
    try {
      await leadService.updateStatus(detail.id, statusVal, scoreVal)
      setDetail(d => ({ ...d, status: statusVal, lead_score: scoreVal }))
      onUpdated()
    } catch {}
    setStatusSaving(false)
  }

  const addFollowup = async () => {
    if (!followupNotes.trim()) { setFError('Notes are required'); return }
    setFLoading(true)
    setFError('')
    try {
      await leadService.addFollowup(detail.id, {
        type: followupType,
        notes: followupNotes,
        next_followup_date: followupDate || undefined,
      })
      setFollowupNotes('')
      setFollowupDate('')
      // Reload detail
      const updated = await leadService.getById(detail.id)
      setDetail(updated)
      setStatusVal(updated.status)
      onUpdated()
    } catch { setFError('Failed to save follow-up') }
    setFLoading(false)
  }

  const sm = STATUS_META[detail.status] || STATUS_META.new
  const sc = SCORE_META[detail.lead_score] || SCORE_META.cold

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex justify-end p-4 bg-slate-800/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-y-auto flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-base font-black text-amber-400">{detail.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">{detail.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border', sm.color, sm.bg, sm.border)}>{sm.label}</span>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sc.color, sc.bg)}>{sc.label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Contact actions */}
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${String(detail.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${detail.name}! Regarding your inquiry.`)}`}
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
            >
              <WAIcon className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href={`tel:${detail.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/15 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            {detail.email && (
              <a
                href={`mailto:${detail.email}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-500/10 border border-purple-500/25 text-purple-400 hover:bg-purple-500/15 transition-colors"
              >
                <Mail className="w-4 h-4" /> Email
              </a>
            )}
          </div>

          {/* Lead details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-sm">
            {[
              { label: 'Phone', value: detail.phone },
              detail.email ? { label: 'Email', value: detail.email } : null,
              { label: 'Inquiry', value: INQUIRY_LABELS[detail.inquiry_type] || detail.inquiry_type },
              { label: 'Preferred', value: detail.preferred_contact },
              { label: 'Date', value: fmtDate(detail.created_at) },
            ].filter(Boolean).map((row: any) => (
              <div key={row.label} className="flex gap-2">
                <span className="text-slate-400 w-20 shrink-0 text-xs font-bold uppercase tracking-wider">{row.label}</span>
                <span className="text-slate-700 text-xs">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Original message */}
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-2">Message</p>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{detail.message}</p>
          </div>

          {/* Update Status & Score */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Update Lead</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-1">Status</label>
                <AdminSelect
                  value={statusVal}
                  onChange={val => setStatusVal(val as Lead['status'])}
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'converted', label: 'Converted' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                  variant="small"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-1">Score</label>
                <AdminSelect
                  value={scoreVal}
                  onChange={val => setScoreVal(val as Lead['lead_score'])}
                  options={[
                    { value: 'hot', label: 'Hot' },
                    { value: 'warm', label: 'Warm' },
                    { value: 'cold', label: 'Cold' },
                  ]}
                  variant="small"
                />
              </div>
            </div>
            <button
              onClick={saveStatus}
              disabled={statusSaving || (statusVal === detail.status && scoreVal === detail.lead_score)}
              className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {statusSaving ? <span className="flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span> : 'Save Changes'}
            </button>
          </div>

          {/* Add Follow-up */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Add Follow-up</p>
            {/* Type pills */}
            <div className="flex gap-1.5 flex-wrap">
              {(['note', 'call', 'whatsapp', 'email', 'meeting'] as LeadFollowup['type'][]).map(t => (
                <button
                  key={t}
                  onClick={() => setFollowupType(t)}
                  className={cn('px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all border', followupType === t ? 'bg-amber-500/15 border-amber-500/30 text-amber-500' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800')}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Notes…"
              value={followupNotes}
              onChange={e => { setFollowupNotes(e.target.value); setFError('') }}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500/40 resize-none"
            />
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Next Follow-up Date (optional)</label>
              <input
                type="date"
                value={followupDate}
                onChange={e => setFollowupDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500/40"
              />
            </div>
            {fError && <p className="text-red-400 text-xs">{fError}</p>}
            <button
              onClick={addFollowup}
              disabled={fLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
            >
              {fLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : <><Send className="w-3 h-3" /> Add Follow-up</>}
            </button>
          </div>

          {/* Timeline */}
          {loadingDetail ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : (detail.followups && detail.followups.length > 0) ? (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Timeline</p>
              <div className="space-y-3">
                {detail.followups.map((fu) => {
                  const FIcon = FOLLOWUP_ICONS[fu.type] || MessageSquare
                  return (
                    <div key={fu.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FIcon className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">{fu.type}</span>
                          <span className="text-[10px] text-gray-600">{fmtDateTime(fu.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{fu.notes}</p>
                        {fu.next_followup_date && (
                          <div className="flex items-center gap-1 mt-2">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-500">Next: {fmtDate(fu.next_followup_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}
