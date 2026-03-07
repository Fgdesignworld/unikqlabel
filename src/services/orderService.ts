import api from '@/lib/axios';

export interface CheckoutPayload {
    customer_name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
    cart_items: Array<{
        product_id?: number | string;
        name: string;
        weight: string;
        quantity: number;
        price: number;
    }>;
}

export interface CheckoutResponse {
    success: boolean;
    message: string;
    order_id: number;
    invoice_number: string;
    subtotal: number;
    delivery: number;
    total: number;
}

export const orderService = {
    /**
     * Submit a checkout order
     */
    async checkout(data: CheckoutPayload): Promise<CheckoutResponse> {
        const response = await api.post('/checkout', data);
        return response.data;
    },

    /**
     * Get all orders (admin)
     */
    async getAll() {
        const response = await api.get('/admin/orders');
        return response.data.orders;
    },

    /**
     * Get order detail (admin)
     */
    async getById(id: number) {
        const response = await api.get(`/admin/orders/${id}`);
        return response.data.order;
    },

    /**
     * Update order status (admin)
     */
    async updateStatus(id: number, status: string) {
        const response = await api.put(`/admin/orders/${id}/status`, { status });
        return response.data;
    },
};
