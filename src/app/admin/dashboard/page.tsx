'use client'

import { useState, useEffect } from 'react'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { Package, ShoppingCart, TrendingUp, IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [orders, products] = await Promise.all([
        orderService.getAll(),
        productService.adminGetAll(),
      ])

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        totalProducts: products.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
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

      {/* Recent Orders */}
      <div className="bg-[#0c0c0c] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black">
        <div className="p-5 md:p-6 border-b border-gray-800 bg-[#0e0e0e] flex items-center justify-between">
          <h2 className="text-sm md:text-lg font-black text-white uppercase tracking-widest">Recent Orders</h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors">View All</button>
        </div>

        <div className="p-3 md:p-0">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-12 italic">No transactions recorded yet.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-spacing-0 border-separate">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="text-left py-4 px-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Invoice</th>
                      <th className="text-left py-4 px-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Customer</th>
                      <th className="text-left py-4 px-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Total</th>
                      <th className="text-center py-4 px-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Status</th>
                      <th className="text-right py-4 px-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-8 text-amber-500 font-black tracking-tight">{order.invoice_number}</td>
                        <td className="py-4 px-8 text-white font-bold">{order.customer_name}</td>
                        <td className="py-4 px-8 text-white font-black">₹{order.total}</td>
                        <td className="py-4 px-8 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border",
                            order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          )}>
                            <div className={cn("w-1 h-1 rounded-full", 
                              order.status === 'delivered' ? 'bg-green-500' :
                              order.status === 'pending' ? 'bg-amber-500' :
                              order.status === 'cancelled' ? 'bg-red-500' :
                              'bg-blue-500'
                            )} />
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-8 text-right text-gray-500 font-bold text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="bg-[#0e0e0e] border border-gray-800/50 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-500 font-black text-xs tracking-tight">{order.invoice_number}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      )}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white font-bold text-xs">{order.customer_name}</p>
                        <p className="text-gray-500 text-[10px] font-medium mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-white font-black text-base tracking-tight">₹{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
