import api from '@/lib/axios'

export interface InventoryRow {
  id?: number
  product_id?: number
  size: string | null
  color: string | null
  stock: number
  sku?: string | null
}

/** Build lookup key for an inventory row */
export function inventoryKey(size: string | null, color: string | null): string {
  return `${size ?? ''}|${color ?? ''}`
}

/**
 * Resolve stock for a selected size/color with priority cascade:
 *   1. exact size + color
 *   2. size only
 *   3. color only
 *   4. product-level fallback (both null)
 * Returns null if no inventory is configured.
 */
export function resolveStock(
  inventory: InventoryRow[],
  size: string | null,
  color: string | null,
): number | null {
  if (!inventory || inventory.length === 0) return null

  const norm = (v: string | null | undefined) => (v && v.trim() !== '' ? v.trim() : null)
  const s = norm(size)
  const c = norm(color)

  let exact: number | null = null
  let sizeOnly: number | null = null
  let colorOnly: number | null = null
  let fallback: number | null = null

  for (const r of inventory) {
    const rs = norm(r.size)
    const rc = norm(r.color)
    if (rs === s && rc === c) exact = r.stock
    else if (rs === s && rc === null && c !== null) sizeOnly = r.stock
    else if (rc === c && rs === null && s !== null) colorOnly = r.stock
    else if (rs === null && rc === null) fallback = r.stock
  }

  return exact !== null ? exact : sizeOnly !== null ? sizeOnly : colorOnly !== null ? colorOnly : fallback
}

export function getStockStatus(stock: number | null, lowThreshold = 10): {
  label: string
  color: string
  bg: string
  border: string
  disabled: boolean
} {
  if (stock === null) return { label: 'In Stock', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', disabled: false }
  if (stock === 0)   return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', disabled: true }
  if (stock <= lowThreshold) return { label: `Only ${stock} left`, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', disabled: false }
  return { label: 'In Stock', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', disabled: false }
}

export const inventoryService = {
  /** Admin: fetch all inventory rows for a product */
  async getForProduct(productId: number): Promise<InventoryRow[]> {
    const res = await api.get(`/admin/inventory/${productId}`)
    return res.data.inventory ?? []
  },

  /** Admin: fetch ALL inventory rows for every product in one call */
  async getAllInventory(): Promise<InventoryRow[]> {
    const res = await api.get('/admin/inventory/all')
    return res.data.inventory ?? []
  },

  /** Admin: bulk save / upsert inventory rows */
  async bulkSave(productId: number, rows: InventoryRow[]): Promise<InventoryRow[]> {
    const res = await api.put(`/admin/inventory/${productId}`, { rows })
    return res.data.inventory ?? []
  },
}
