'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Search, X, Phone, Mail, Download,
  RefreshCw, SlidersHorizontal, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Star, Flame, Minus, Eye,
  Trash2, TrendingUp, Users, Calendar, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/context/settings-context'
import {
  leadService,
  type Lead, type LeadStats, type UpcomingFollowup, type DailyStat,
} from '@/services/leadService'
import LeadDetailPanel from './LeadDetailPanel'

// â”€â”€â”€ Inline WhatsApp icon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WAIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  new:       { label: 'New',       color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  icon: Star        },
  contacted: { label: 'Contacted', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock       },
  converted: { label: 'Converted', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle },
  closed:    { label: 'Closed',    color: 'text-gray-400',  bg: 'bg-gray-500/10',  border: 'border-gray-500/20',  icon: Minus       },
}

const SCORE_META: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  hot:  { label: 'Hot',  color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   Icon: Flame       },
  warm: { label: 'Warm', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', Icon: TrendingUp  },
  cold: { label: 'Cold', color: 'text-sky-300',   bg: 'bg-sky-500/10',   border: 'border-sky-500/20',   Icon: Minus       },
}

const FOLLOWUP_TYPE_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  call:     { label: 'Call',     color: 'text-blue-400',   Icon: Phone         },
  whatsapp: { label: 'WhatsApp', color: 'text-green-400',  Icon: WAIcon as any },
  email:    { label: 'Email',    color: 'text-purple-400', Icon: Mail          },
  meeting:  { label: 'Meeting',  color: 'text-amber-400',  Icon: Users         },
  note:     { label: 'Note',     color: 'text-gray-400',   Icon: MessageSquare },
}

const INQUIRY_LABELS: Record<string, string> = {
  order: 'Place Order', bulk: 'Bulk / Wholesale',
  custom_design: 'Custom Design', support: 'Support', other: 'Other',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDayLabel(dateStr: string, index: number): string {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({ label, value, icon: Icon, color, bg, border, sub }: {
  label: string; value: number | string; icon: React.ElementType
  color: string; bg: string; border: string; sub?: string
}) {
  return (
    <div className={cn('bg-white border rounded-2xl p-4 md:p-5', border)}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[9px] text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}

// â”€â”€â”€ Badges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.new
  const Icon = m.icon
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border', m.color, m.bg, m.border)}>
      <Icon className="w-3 h-3" />{m.label}
    </span>
  )
}

function ScoreBadge({ score }: { score: string }) {
  const m = SCORE_META[score] || SCORE_META.cold
  const Icon = m.Icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', m.color, m.bg, m.border)}>
      <Icon className="w-3 h-3" />{m.label}
    </span>
  )
}

// â”€â”€â”€ Daily Activity Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DailyChart({ data, loading }: { data: DailyStat[]; loading: boolean }) {
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data])
  const total    = useMemo(() => data.reduce((a, b) => a + b.count, 0), [data])
  const [hovered, setHovered] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]
  
  // Find hovered data item only when needed
  const hoveredData = useMemo(() => 
    hovered ? data.find(d => d.date === hovered) : null,
    [hovered, data]
  )

  if (loading || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 h-[110px] flex items-center justify-center">
        {loading
          ? <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
          : <p className="text-xs text-gray-600">No chart data yet</p>}
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-black text-slate-700">Daily Leads</p>
          <span className="text-[10px] text-gray-600">Last {data.length} days</span>
        </div>
        <div className="flex items-center gap-2">
          {hoveredData && (
            <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 rounded-full text-amber-400 text-[10px] font-bold">
              {new Date(hoveredData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: {hoveredData.count} lead{hoveredData.count !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs font-black text-slate-700">{total}</span>
          <span className="text-xs text-gray-600">total</span>
        </div>
      </div>

      {/* Bars - optimized to prevent flicker */}
      <div className="flex items-end gap-[3px] h-12">
        {data.map((d) => {
          const pct     = Math.max(4, Math.round((d.count / maxCount) * 100))
          const isToday = d.date === today
          const isHov   = hovered === d.date
          return (
            <div
              key={d.date}
              className="flex-1 h-full flex flex-col justify-end relative group cursor-pointer"
              onMouseEnter={() => setHovered(d.date)}
              onMouseLeave={() => setHovered(null)}
              style={{ userSelect: 'none' }}
            >
              <div
                className={cn(
                  'w-full rounded-t-sm transition-all duration-75',
                  d.count === 0
                    ? 'bg-gray-800/40'
                    : isToday
                      ? isHov ? 'bg-amber-300 shadow-lg shadow-amber-400/20' : 'bg-amber-400'
                      : isHov ? 'bg-amber-500/90 shadow-lg shadow-amber-500/20' : 'bg-amber-500/35'
                )}
                style={{ height: d.count === 0 ? '3px' : `${pct}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis: first + last label */}
      <div className="flex justify-between mt-1.5 pointer-events-none">
        <span className="text-[9px] text-gray-700">
          {new Date(data[0]?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span className="text-[9px] text-amber-500/60 font-bold">Today</span>
      </div>
    </div>
  )
}

// â”€â”€â”€ Followup Card (for 7-day tab) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FollowupCard({ fu, onView }: { fu: UpcomingFollowup; onView: (id: number) => void }) {
  const tm   = FOLLOWUP_TYPE_META[fu.type] || FOLLOWUP_TYPE_META.note
  const TIcon = tm.Icon as any
  const waNum = String(fu.phone).replace(/\D/g, '')
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-500/20 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-black text-amber-400">{fu.name[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{fu.name}</span>
            <StatusBadge status={fu.status} />
            <ScoreBadge  score={fu.lead_score} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-500">{fu.phone}</span>
            <span className={cn('flex items-center gap-1 text-[10px] font-bold', tm.color)}>
              <TIcon className="w-3 h-3" />{tm.label}
            </span>
            <span className="text-[10px] text-gray-600">{INQUIRY_LABELS[fu.inquiry_type] || fu.inquiry_type}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 bg-white/[0.025] rounded-xl px-3 py-2 border border-white/[0.04]">
        {fu.notes}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${fu.name}! Following up on your ${INQUIRY_LABELS[fu.inquiry_type] || fu.inquiry_type} inquiry.`)}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/18 transition-colors"
        >
          <WAIcon className="w-3 h-3" /> WhatsApp
        </a>
        <a
          href={`tel:${fu.phone}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/18 transition-colors"
        >
          <Phone className="w-3 h-3" /> Call
        </a>
        <button
          onClick={() => onView(fu.lead_id)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/18 transition-colors"
        >
          <Eye className="w-3 h-3" /> View Lead
        </button>
      </div>
    </motion.div>
  )
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminLeadsPage() {
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState<'leads' | 'followups'>('leads')

  // â”€â”€ Lead list â”€â”€
  const [leads, setLeads]         = useState<Lead[]>([])
  const [stats, setStats]         = useState<LeadStats | null>(null)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)
  const [loading, setLoading]     = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [scoreFilter, setScoreFilter]   = useState('')
  const [typeFilter, setTypeFilter]     = useState('')
  const [showFilters, setShowFilters]   = useState(false)

  // â”€â”€ Chart + Followups â”€â”€
  const [dailyData, setDailyData]         = useState<DailyStat[]>([])
  const [chartLoading, setChartLoading]   = useState(true)
  const [upcoming, setUpcoming]           = useState<Record<string, UpcomingFollowup[]>>({})
  const [upcomingLoading, setUpcomingLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]
  const [activeDayTab, setActiveDayTab]   = useState<string>(today)

  // â”€â”€ Detail / Delete â”€â”€
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [deleteId, setDeleteId]         = useState<number | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const PER_PAGE = 20

  // â”€â”€ Fetchers â”€â”€
  const fetchLeads = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p, per_page: PER_PAGE }
      if (statusFilter)  params.status       = statusFilter
      if (scoreFilter)   params.lead_score   = scoreFilter
      if (typeFilter)    params.inquiry_type = typeFilter
      if (search)        params.search       = search
      const res = await leadService.getAll(params)
      setLeads(res.leads)
      setTotal(res.total)
      setLastPage(res.last_page)
      setPage(res.page)
    } catch {}
    setLoading(false)
  }, [search, statusFilter, scoreFilter, typeFilter])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try { setStats(await leadService.getStats()) } catch {}
    setStatsLoading(false)
  }, [])

  const fetchChart = useCallback(async () => {
    setChartLoading(true)
    try { setDailyData(await leadService.getDailyStats(14)) } catch {}
    setChartLoading(false)
  }, [])

  const fetchUpcoming = useCallback(async () => {
    setUpcomingLoading(true)
    try { 
      const data = await leadService.getUpcoming(7)
      setUpcoming(data || {})
    } catch (err) {
      console.error('Failed to fetch upcoming:', err)
      setUpcoming({})
    }
    setUpcomingLoading(false)
  }, [])

  useEffect(() => { fetchLeads(1)  }, [fetchLeads])
  useEffect(() => { fetchStats()   }, [fetchStats])
  useEffect(() => { fetchChart()   }, [fetchChart])
  useEffect(() => { fetchUpcoming() }, [fetchUpcoming])  // with dependency for proper React patterns
  
  // Real-time refresh: every 30 seconds to stay updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUpcoming()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchUpcoming])

  // Refresh immediately when switching to follow-ups tab
  useEffect(() => {
    if (activeTab === 'followups') {
      fetchUpcoming()
    }
  }, [activeTab, fetchUpcoming])

  const handleRefreshAll = () => {
    fetchLeads(page); fetchStats(); fetchChart(); fetchUpcoming()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await leadService.deleteLead(deleteId)
      setDeleteId(null)
      fetchLeads(page)
      fetchStats()
    } catch {}
    setDeleting(false)
  }

  const handleLeadUpdated = () => {
    fetchLeads(page); fetchStats(); fetchUpcoming()
    if (selectedLead) {
      leadService.getById(selectedLead.id).then(setSelectedLead).catch(() => {})
    }
  }

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setScoreFilter(''); setTypeFilter('') }
  const hasFilters   = search || statusFilter || scoreFilter || typeFilter

  // â”€â”€ 7-day tab data â”€â”€
  const days7 = useMemo(() => {
    const result = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const count = (upcoming[dateStr] ?? []).length
      result.push({ date: dateStr, label: fmtDayLabel(dateStr, i), count })
    }
    return result
  }, [upcoming])

  const upcomingTotal  = useMemo(() => Object.values(upcoming).reduce((a, b) => a + b.length, 0), [upcoming])
  const activeDayItems = upcoming[activeDayTab] ?? []

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
            <MessageSquare className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Leads / Contacts</h1>
            <p className="text-xs text-gray-500">{total} total leads</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={leadService.exportUrl()}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
          <button onClick={handleRefreshAll} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* â”€â”€ Stats Row â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Leads" value={stats?.total           ?? 'â€”'} icon={Users}       color="text-amber-400"  bg="bg-amber-500/10"  border="border-amber-500/20" />
        <StatCard label="New"         value={stats?.new_count       ?? 'â€”'} icon={Star}        color="text-blue-400"   bg="bg-blue-500/10"   border="border-blue-500/20"  />
        <StatCard label="Hot Leads"   value={stats?.hot_count       ?? 'â€”'} icon={Flame}       color="text-red-400"    bg="bg-red-500/10"    border="border-red-500/20"   />
        <StatCard label="Converted"   value={stats?.converted_count ?? 'â€”'} icon={CheckCircle} color="text-green-400"  bg="bg-green-500/10"  border="border-green-500/20" />
        <StatCard
          label="Today"
          value={stats?.today_count ?? 'â€”'}
          icon={Calendar}
          color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20"
          sub={upcomingTotal > 0 ? `${upcomingTotal} follow-up${upcomingTotal !== 1 ? 's' : ''} due` : undefined}
        />
      </div>

      {/* â”€â”€ Daily Chart â”€â”€ */}
      <DailyChart data={dailyData} loading={chartLoading} />

      {/* â”€â”€ Main Tabs â”€â”€ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {/* Tab header */}
        <div className="flex border-b border-slate-200">
          {([
            { key: 'leads',    label: 'All Leads',   Icon: Users,    badge: total },
            { key: 'followups', label: 'Follow-ups', Icon: Calendar, badge: upcomingTotal },
          ] as const).map(({ key, label, Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all border-b-2 -mb-px',
                activeTab === key
                  ? 'text-amber-400 border-amber-400'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-black',
                  activeTab === key
                    ? 'bg-amber-500/20 text-amber-400'
                    : key === 'followups'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                )}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* â”€â”€ Content: All Leads â”€â”€ */}
        {activeTab === 'leads' && (
          <div>
            {/* Filters bar */}
            <div className="flex items-center gap-2 p-4 flex-wrap border-b border-slate-200/80">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search name, phone, emailâ€¦"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500/40"
                />
              </div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className={cn('flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors', showFilters ? 'bg-amber-500/15 border-amber-500/30 text-amber-500' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800')}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Expandable advanced filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-b border-slate-200/80"
                >
                  <div className="flex flex-wrap gap-4 p-4 bg-slate-50 border-b border-slate-200/80">
                    {[
                      { label: 'Status',       items: ['', 'new', 'contacted', 'converted', 'closed'],          val: statusFilter, set: setStatusFilter, fmt: (s: string) => s || 'All' },
                      { label: 'Score',        items: ['', 'hot', 'warm', 'cold'],                              val: scoreFilter,  set: setScoreFilter,  fmt: (s: string) => s || 'All' },
                      { label: 'Inquiry Type', items: ['', 'order', 'bulk', 'custom_design', 'support', 'other'], val: typeFilter,   set: setTypeFilter,   fmt: (s: string) => s ? (INQUIRY_LABELS[s] || s) : 'All' },
                    ].map(group => (
                      <div key={group.label}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{group.label}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {group.items.map(s => (
                            <button key={s} onClick={() => group.set(s)}
                              className={cn('px-3 py-1.5 rounded-lg text-xs font-bold border transition-all', group.val === s ? 'bg-amber-500/15 border-amber-500/30 text-amber-500' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800')}>
                              {group.fmt(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lead table */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-bold">No leads found</p>
                {hasFilters && <button className="mt-2 text-xs text-amber-400 underline" onClick={clearFilters}>Clear filters</button>}
              </div>
            ) : (
              <>
                {/* ── Mobile card list (< md) ── */}
                <div className="md:hidden divide-y divide-slate-200/60">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 space-y-3 active:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {/* Row 1: avatar + name + badges */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-amber-400">{lead.name[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 leading-tight">{lead.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
                          {lead.email && <p className="text-[10px] text-gray-600 mt-0.5 truncate">{lead.email}</p>}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <StatusBadge status={lead.status} />
                            <ScoreBadge  score={lead.lead_score} />
                            <span className="text-[10px] text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-full">
                              {INQUIRY_LABELS[lead.inquiry_type] || lead.inquiry_type}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">{fmtDate(lead.created_at)}</span>
                      </div>
                      {/* Row 2: action buttons */}
                      <div className="flex items-center gap-2 pl-13" onClick={e => e.stopPropagation()}>
                        <a
                          href={`https://wa.me/${String(lead.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}!`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20"
                        >
                          <WAIcon className="w-3 h-3" /> WA
                        </a>
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20">
                          <Phone className="w-3 h-3" /> Call
                        </a>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => setDeleteId(lead.id)}
                          className="p-1.5 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Desktop table (≥ md) ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {['Lead', 'Inquiry', 'Status', 'Score', 'Date', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-black text-amber-400">{lead.name[0]?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                                <p className="text-xs text-gray-500">{lead.phone}</p>
                                {lead.email && <p className="text-[10px] text-gray-600 flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{lead.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-400">{INQUIRY_LABELS[lead.inquiry_type] || lead.inquiry_type}</span>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                          <td className="px-4 py-3"><ScoreBadge  score={lead.lead_score} /></td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-500">{fmtDate(lead.created_at)}</span>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`https://wa.me/${String(lead.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}!`)}`}
                                target="_blank" rel="noreferrer"
                                className="p-1.5 rounded-lg text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                              >
                                <WAIcon className="w-3.5 h-3.5" />
                              </a>
                              <a href={`tel:${lead.phone}`} className="p-1.5 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="p-1.5 rounded-lg text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteId(lead.id)}
                                className="p-1.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <p className="text-xs text-gray-500">Page {page} of {lastPage}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1}        onClick={() => fetchLeads(page - 1)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronLeft  className="w-4 h-4 text-slate-500" /></button>
                  <button disabled={page >= lastPage} onClick={() => fetchLeads(page + 1)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Content: Follow-ups (7 days) â”€â”€ */}
        {activeTab === 'followups' && (
          <div>
            {/* 7-day strip */}
            <div className="flex gap-2 p-4 overflow-x-auto border-b border-slate-200/80 scrollbar-none">
              {days7.map((day) => {
                const isActive   = activeDayTab === day.date
                const hasDue     = day.count > 0
                return (
                  <button
                    key={day.date}
                    onClick={() => setActiveDayTab(day.date)}
                    className={cn(
                      'flex flex-col items-center px-4 py-2.5 rounded-2xl shrink-0 border transition-all min-w-[82px]',
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                        : hasDue
                          ? 'bg-gray-100 border-slate-300 text-slate-600 hover:border-amber-500/20'
                          : 'border-slate-200 text-gray-600 hover:text-gray-400 hover:border-slate-300'
                    )}
                  >
                    <span className="text-[11px] font-black whitespace-nowrap">{day.label}</span>
                    <span
                      className={cn(
                        'mt-1.5 min-w-[22px] h-5 rounded-full flex items-center justify-center text-[10px] font-black px-1.5',
                        isActive   ? 'bg-amber-500 text-black' :
                        hasDue     ? 'bg-red-500/25 border border-red-500/35 text-red-400' :
                                     'text-gray-700'
                      )}
                    >
                      {day.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Followup list with refresh */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500 font-black uppercase tracking-widest">
                  {activeDayItems.length} follow-up{activeDayItems.length !== 1 ? 's' : ''} · {days7.find(d => d.date === activeDayTab)?.label ?? activeDayTab}
                </p>
                <button
                  onClick={fetchUpcoming}
                  disabled={upcomingLoading}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5 text-slate-500', upcomingLoading && 'animate-spin')} />
                </button>
              </div>
              
              {upcomingLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
                </div>
              ) : activeDayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <Calendar className="w-10 h-10 mb-3 opacity-25" />
                  <p className="font-bold text-sm">No follow-ups scheduled</p>
                  <p className="text-xs text-gray-600 mt-1">for {days7.find(d => d.date === activeDayTab)?.label ?? activeDayTab}</p>
                  <p className="text-[10px] text-gray-700 mt-3">Add a follow-up with a next date from any Lead detail panel</p>
                </div>
              ) : (
                <div className="space-y-3">

                  {activeDayItems.map(fu => (
                    <FollowupCard
                      key={fu.id}
                      fu={fu}
                      onView={(id) => {
                        const existing = leads.find(l => l.id === id)
                        if (existing) { setSelectedLead(existing); return }
                        leadService.getById(id).then(setSelectedLead).catch(() => {})
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ Lead Detail Panel â”€â”€ */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdated={handleLeadUpdated}
          />
        )}
      </AnimatePresence>

      {/* â”€â”€ Delete Confirm â”€â”€ */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">Delete Lead?</h3>
              <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-slate-300 text-gray-400 hover:text-slate-900 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-60 transition-colors">
                  {deleting ? 'Deletingâ€¦' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
