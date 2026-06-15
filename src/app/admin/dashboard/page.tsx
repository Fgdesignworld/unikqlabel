'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderService, type OrdersAnalytics, type ChartDay } from '@/services/orderService'
import { productService } from '@/services/productService'
import { useOrdersRefresh } from '@/context/orders-refresh-context'
import { Package, ShoppingCart, TrendingUp, IndianRupee, ChevronRight, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-[0_4px_20px_rgba(15,23,42,0.10)] z-50">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[#C9A45C] font-black text-sm">{payload[0]?.value} orders</p>
      {payload[1] && (
        <p className="text-emerald-600 font-bold text-xs">₹{payload[1]?.value?.toFixed(0)}</p>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { refreshKey } = useOrdersRefresh()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
  })
  const [analytics, setAnalytics] = useState<OrdersAnalytics | null>(null)
  const [chartData, setChartData] = useState<ChartDay[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [orderData, products, orderAnalytics, chart] = await Promise.all([
        orderService.getAll({ filter: 'all', page: 1 }).catch(() => ({ orders: [] })),
        productService.adminGetAll().catch(() => []),
        orderService.getAnalytics().catch(() => null),
        orderService.getChart(14).catch(() => []),
      ])

      setStats({
        totalOrders: orderAnalytics?.total?.count || 0,
        totalRevenue: orderAnalytics?.total?.revenue || 0,
        totalProducts: products?.length || 0,
        pendingOrders: orderAnalytics?.by_status?.pending || 0,
      })

      setAnalytics(orderAnalytics)
      setChartData(chart || [])
      setRecentOrders(orderData?.orders?.slice(0, 5) || [])
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500 bg-blue-50 border border-blue-100' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50 border border-emerald-100' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-[#B8903E] bg-amber-50 border border-amber-100' },
    { label: 'Pending', value: stats.pendingOrders, icon: TrendingUp, color: 'text-rose-500 bg-rose-50 border border-rose-100' },
  ]

  // Status Badge Config
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'delivered':  return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' }
      case 'pending':    return { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   dot: 'bg-amber-400' }
      case 'cancelled':  return { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200',    dot: 'bg-rose-500' }
      case 'processing': return { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200',  dot: 'bg-purple-500' }
      case 'shipped':    return { bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-200',     dot: 'bg-sky-500' }
      default:           return { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    dot: 'bg-blue-500' }
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 lg:pb-0">
      
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">Welcome back — here's what's happening.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all text-xs font-semibold shadow-sm"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group shadow-sm">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110 ${stat.color}`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <p className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mt-1 md:mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart & Recent Orders Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart Column (Takes 2 columns on XL) */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-widest">Growth Analytics</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium">Last 14 days activity</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C9A45C]" />
                  <span className="text-slate-500">Orders</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Revenue</span>
                </span>
              </div>
            </div>
            <div className="p-4 h-[250px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A45C" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#C9A45C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" stroke="#E2E8F0" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#E2E8F0" tick={{ fill: '#94A3B8', fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="orders" name="orders" stroke="#C9A45C" strokeWidth={2.5} fill="url(#colorOrders)" activeDot={{ r: 5, fill: '#C9A45C', stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders Column (Takes 1 column on XL) */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-widest">Recent Activity</h2>
              <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-[#C9A45C] hover:text-[#B8903E] transition-colors flex items-center">
                View All <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="p-3">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm italic text-slate-400">No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order: any) => {
                    const cfg = getStatusConfig(order.status)
                    return (
                      <Link key={order.id} to="/admin/orders" className="block p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#C9A45C] font-black text-xs tracking-tight">{order.invoice_number}</span>
                          <span className={cn(
                            "rounded-full text-[8.5px] font-black uppercase tracking-widest border px-2 py-0.5 flex items-center gap-1.5",
                            cfg.bg, cfg.text, cfg.border
                          )}>
                            <div className={cn("w-1 h-1 rounded-full", cfg.dot)} />
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-slate-800 font-bold text-sm">{order.customer_name}</p>
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">
                              {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                          <p className="text-emerald-600 font-black text-base tracking-tight">₹{order.total}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* View All Button at bottom */}
            {recentOrders.length > 0 && (
              <div className="p-3 pt-0">
                <Link to="/admin/orders" className="flex items-center justify-center w-full py-3 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-[#C9A45C] text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-200 hover:border-amber-200">
                  Manage All Orders
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
