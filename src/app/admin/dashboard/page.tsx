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
    <div className="bg-[#111] border border-gray-800 rounded-xl p-3 shadow-2xl z-50">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-amber-500 font-black text-sm">{payload[0]?.value} orders</p>
      {payload[1] && (
        <p className="text-green-400 font-bold text-xs">₹{payload[1]?.value?.toFixed(0)}</p>
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
        orderService.getAll({ filter: 'all', page: 1 }), // Get first page of all orders
        productService.adminGetAll(),
        orderService.getAnalytics(),
        orderService.getChart(14),
      ])

      setStats({
        totalOrders: orderAnalytics.total.count || 0,
        totalRevenue: orderAnalytics.total.revenue || 0,
        totalProducts: products.length,
        pendingOrders: orderAnalytics.by_status?.pending || 0,
      })

      setAnalytics(orderAnalytics)
      setChartData(chart)
      setRecentOrders(orderData.orders?.slice(0, 5) || [])
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
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-400 bg-green-500/10' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Pending', value: stats.pendingOrders, icon: TrendingUp, color: 'text-red-400 bg-red-500/10' },
  ]

  // Status Badge Config
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'delivered': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', dot: 'bg-green-500' }
      case 'pending': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', dot: 'bg-amber-500' }
      case 'cancelled': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', dot: 'bg-red-500' }
      case 'processing': return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', dot: 'bg-purple-500' }
      case 'shipped': return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', dot: 'bg-cyan-500' }
      default: return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', dot: 'bg-blue-500' }
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 lg:pb-0">
      
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Dashboard Overview</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-colors text-xs font-bold"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-4 md:p-6 hover:border-gray-700 transition-colors group">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110 ${stat.color}`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <p className="text-xl md:text-3xl font-black text-white tracking-tight">{stat.value}</p>
            <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-widest mt-1 md:mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart & Recent Orders Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart Column (Takes 2 columns on XL) */}
        <div className="xl:col-span-2">
          <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-[2rem] overflow-hidden shadow-2xl shadow-black">
            <div className="p-5 md:p-6 border-b border-gray-800 bg-[#0e0e0e] flex items-center justify-between">
              <div>
                <h2 className="text-sm md:text-lg font-black text-white uppercase tracking-widest">Growth Analytics</h2>
                <p className="text-[10px] text-gray-500 mt-0.5 uppercase font-medium">Last 14 days activity</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Orders
                </span>
                <span className="flex items-center gap-1.5 hidden sm:flex">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Revenue
                </span>
              </div>
            </div>
            <div className="p-4 h-[250px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                  <XAxis dataKey="day" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="orders" name="orders" stroke="#f59e0b" strokeWidth={3} fill="url(#colorOrders)" activeDot={{ r: 6, fill: '#f59e0b', stroke: '#111', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders Column (Takes 1 column on XL) */}
        <div className="xl:col-span-1">
          <div className="bg-[#0c0c0c] border border-gray-800/50 rounded-[2rem] overflow-hidden shadow-2xl shadow-black">
            <div className="p-5 md:p-6 border-b border-gray-800 bg-[#0e0e0e] flex items-center justify-between">
              <h2 className="text-sm md:text-lg font-black text-white uppercase tracking-widest">Recent Activity</h2>
              <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors flex items-center">
                View All <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="p-3">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm italic">No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order: any) => {
                    const cfg = getStatusConfig(order.status)
                    return (
                      <Link key={order.id} to="/admin/orders" className="block p-4 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-amber-500 font-black text-xs tracking-tight">{order.invoice_number}</span>
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
                            <p className="text-white font-bold text-sm">{order.customer_name}</p>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                              {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                          <p className="text-green-400 font-black text-base tracking-tight">₹{order.total}</p>
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
                <Link to="/admin/orders" className="flex items-center justify-center w-full py-3 bg-[#111] hover:bg-[#151515] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors border border-gray-800">
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
