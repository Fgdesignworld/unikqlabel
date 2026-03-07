'use client'

import { useState, useEffect } from 'react'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { Package, ShoppingCart, TrendingUp, IndianRupee } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-gray-500 text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Invoice</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-2 text-amber-500 font-semibold">{order.invoice_number}</td>
                    <td className="py-3 px-2 text-white">{order.customer_name}</td>
                    <td className="py-3 px-2 text-white font-semibold">₹{order.total}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
