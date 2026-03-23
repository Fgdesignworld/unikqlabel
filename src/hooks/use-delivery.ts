/**
 * useDelivery — Fetches the active delivery rule and exposes a calculator.
 * Falls back to safe defaults (₹50 / free above ₹500) if the API is unavailable.
 */
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export interface DeliveryRule {
  min_order_amount: number
  delivery_fee: number
  free_delivery_above: number
  is_active: boolean
}

const FALLBACK: DeliveryRule = {
  min_order_amount: 0,
  delivery_fee: 50,
  free_delivery_above: 500,
  is_active: true,
}

export function useDelivery() {
  const [rule, setRule] = useState<DeliveryRule>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/delivery-rules')
      .then(res => {
        const r = res.data?.data?.rule
        if (r) setRule(r)
      })
      .catch(() => {/* use fallback */})
      .finally(() => setLoading(false))
  }, [])

  /** Calculate delivery fee for a given cart subtotal. */
  const calculate = (subtotal: number): { fee: number; isFree: boolean; blocked: boolean } => {
    if (!rule.is_active) return { fee: 0, isFree: true, blocked: false }

    const blocked = rule.min_order_amount > 0 && subtotal < rule.min_order_amount
    if (blocked) return { fee: 0, isFree: false, blocked: true }

    const isFree = rule.free_delivery_above > 0 && subtotal >= rule.free_delivery_above
    return { fee: isFree ? 0 : rule.delivery_fee, isFree, blocked: false }
  }

  return { rule, loading, calculate }
}
