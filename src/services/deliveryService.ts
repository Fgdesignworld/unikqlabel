import api from '@/lib/axios';

export interface DeliveryRule {
    id?: number;
    min_order_amount: number;
    delivery_fee: number;
    free_delivery_above: number;
    is_active?: boolean;
    updated_at?: string;
}

export interface DeliveryCalculation {
    delivery: number;
    is_free: boolean;
    order_blocked: boolean;
    min_order: number;
    free_above: number;
}

export const deliveryService = {
    /** Public: get active rule */
    async getRule(): Promise<DeliveryRule | null> {
        const res = await api.get('/delivery-rules');
        return res.data.data?.rule ?? null;
    },

    /** Public: calculate delivery for a subtotal */
    async calculate(subtotal: number): Promise<DeliveryCalculation> {
        const res = await api.post('/delivery-calculate', { subtotal });
        return res.data.data;
    },

    /** Admin: get rule */
    async adminGet(): Promise<DeliveryRule | null> {
        const res = await api.get('/admin/delivery-rules');
        return res.data.data?.rule ?? null;
    },

    /** Admin: update rule */
    async update(data: Omit<DeliveryRule, 'id' | 'updated_at'>): Promise<DeliveryRule> {
        const res = await api.post('/admin/delivery-rules', data);
        return res.data.data.rule;
    },
};
