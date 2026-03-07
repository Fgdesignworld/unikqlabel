'use client'

import { useState, useEffect } from 'react'
import { orderService } from '@/services/orderService'
import { Eye, ChevronDown } from 'lucide-react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [orderDetail, setOrderDetail] = useState<any>(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll()
      setOrders(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleDetail = async (id: number) => {
    if (expandedOrder === id) {
      setExpandedOrder(null)
      setOrderDetail(null)
      return
    }
    try {
      const detail = await orderService.getById(id)
      setOrderDetail(detail)
      setExpandedOrder(id)
    } catch { alert('Failed to load order') }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await orderService.updateStatus(id, status)
      loadOrders()
    } catch { alert('Failed to update status') }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400',
    confirmed: 'bg-blue-500/10 text-blue-400',
    processing: 'bg-purple-500/10 text-purple-400',
    shipped: 'bg-cyan-500/10 text-cyan-400',
    delivered: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-red-500/10 text-red-400',
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Orders ({orders.length})</h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
            {/* Order Row */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => toggleDetail(order.id)}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div>
                  <p className="text-amber-500 font-bold text-sm">{order.invoice_number}</p>
                  <p className="text-white font-semibold text-sm">{order.customer_name}</p>
                  <p className="text-gray-500 text-xs">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-white font-bold">₹{order.total}</p>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[order.status] || 'bg-gray-500/10 text-gray-400'}`}>
                  {order.status}
                </span>
                <p className="text-gray-500 text-xs hidden sm:block">{new Date(order.created_at).toLocaleDateString()}</p>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded Detail */}
            {expandedOrder === order.id && orderDetail && (
              <div className="border-t border-gray-800 p-4 bg-[#0a0a0a]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Shipping Address</p>
                    <p className="text-white">{orderDetail.address}</p>
                    <p className="text-gray-400">{orderDetail.city} - {orderDetail.pincode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Update Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-3 py-2 bg-[#111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                    >
                      {Object.keys(statusColors).map(s => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left py-2 text-gray-500 font-medium">Item</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Weight</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Qty</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Price</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                  </tr></thead>
                  <tbody>
                    {(orderDetail.items || []).map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-2 text-white">{item.product_name}</td>
                        <td className="py-2 text-center text-gray-400">{item.weight}</td>
                        <td className="py-2 text-center text-gray-400">{item.qty}</td>
                        <td className="py-2 text-right text-gray-400">₹{item.price}</td>
                        <td className="py-2 text-right text-amber-400 font-semibold">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mt-3 space-x-6 text-sm">
                  <span className="text-gray-500">Subtotal: <span className="text-white font-semibold">₹{orderDetail.subtotal}</span></span>
                  <span className="text-gray-500">Delivery: <span className="text-white font-semibold">{orderDetail.delivery == 0 ? 'FREE' : `₹${orderDetail.delivery}`}</span></span>
                  <span className="text-gray-500">Total: <span className="text-amber-400 font-bold">₹{orderDetail.total}</span></span>
                </div>
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
            No orders yet
          </div>
        )}
      </div>
    </div>
  )
}
