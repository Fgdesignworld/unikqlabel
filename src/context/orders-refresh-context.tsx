'use client'

import { createContext, useContext, useCallback, useState } from 'react'

interface OrdersRefreshContextType {
  triggerRefresh: () => void
  refreshKey: number
}

const OrdersRefreshContext = createContext<OrdersRefreshContextType | undefined>(undefined)

export function OrdersRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <OrdersRefreshContext.Provider value={{ triggerRefresh, refreshKey }}>
      {children}
    </OrdersRefreshContext.Provider>
  )
}

export function useOrdersRefresh() {
  const context = useContext(OrdersRefreshContext)
  if (!context) {
    throw new Error('useOrdersRefresh must be used within OrdersRefreshProvider')
  }
  return context
}
