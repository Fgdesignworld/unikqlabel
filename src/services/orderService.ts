import api from '@/lib/axios';

export interface CheckoutPayload {
    customer_name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
    payment_method?: string;
    payment_ref?: string;
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

export interface OrdersAnalytics {
    today: { count: number; revenue: number };
    week: { count: number; revenue: number };
    month: { count: number; revenue: number };
    total: { count: number; revenue: number };
    by_status: Record<string, number>;
    by_payment: Record<string, number>;
    trashed: number;
}

export interface ChartDay {
    date: string;
    day: string;
    orders: number;
    revenue: number;
}

export interface OrderFilters {
    filter?: string;
    status?: string;
    payment_method?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    trash?: boolean;
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
     * Get paginated/filtered orders (admin)
     */
    async getAll(filters: OrderFilters = {}) {
        const { filter = 'all', page = 1, trash, ...rest } = filters;
        const params: Record<string, any> = { filter, page, ...rest };
        if (trash) params.trash = 1;
        const response = await api.get('/admin/orders', { params });
        return response.data;
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

    /**
     * Update payment method (admin)
     */
    async updatePayment(id: number, payment_method: string, payment_ref?: string) {
        const response = await api.put(`/admin/orders/${id}/payment`, { payment_method, payment_ref });
        return response.data;
    },

    /**
     * Soft-delete an order (admin)
     */
    async softDelete(id: number) {
        const response = await api.delete(`/admin/orders/${id}`);
        return response.data;
    },

    /**
     * Restore a soft-deleted order (admin)
     */
    async restore(id: number) {
        const response = await api.put(`/admin/orders/${id}/restore`, {});
        return response.data;
    },

    /**
     * Permanently delete (admin, from trash only)
     */
    async forceDelete(id: number) {
        const response = await api.delete(`/admin/orders/${id}/force`);
        return response.data;
    },

    /**
     * Get analytics summary (admin)
     */
    async getAnalytics(): Promise<OrdersAnalytics> {
        const response = await api.get('/admin/orders/analytics');
        return response.data;
    },

    /**
     * Get daily chart data (admin)
     */
    async getChart(days = 14): Promise<ChartDay[]> {
        const response = await api.get('/admin/orders/chart', { params: { days } });
        return response.data.chart;
    },
};
