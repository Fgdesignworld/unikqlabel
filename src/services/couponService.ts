import api from '@/lib/axios';

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  user_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponPayload {
  code: string;
  type: 'percentage' | 'fixed';
  value: number | string;
  min_order_amount?: number | string | null;
  max_discount?: number | string | null;
  usage_limit?: number | string | null;
  user_limit?: number | string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface CouponValidationResult {
  discount_amount: number;
  final_total: number;
  coupon: { code: string; type: string; value: number };
}

export const couponService = {
  /** Public: validate a coupon code against a cart total */
  async validate(code: string, cartTotal: number): Promise<CouponValidationResult> {
    const res = await api.post('/coupons/validate', { code, cart_total: cartTotal });
    return res.data.data;
  },

  /** Admin: list all coupons */
  async getAll(): Promise<Coupon[]> {
    const res = await api.get('/admin/coupons');
    return res.data.data.coupons;
  },

  /** Admin: create coupon */
  async create(payload: CouponPayload): Promise<Coupon> {
    const res = await api.post('/admin/coupons', payload);
    return res.data.data.coupon;
  },

  /** Admin: update coupon */
  async update(id: number, payload: CouponPayload): Promise<Coupon> {
    const res = await api.put(`/admin/coupons/${id}`, payload);
    return res.data.data.coupon;
  },

  /** Admin: toggle active state */
  async toggle(id: number): Promise<Coupon> {
    const res = await api.put(`/admin/coupons/${id}/toggle`);
    return res.data.data.coupon;
  },

  /** Admin: delete coupon */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/coupons/${id}`);
  },
};
