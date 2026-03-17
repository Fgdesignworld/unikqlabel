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

export interface OrdersAnalytics {
    today: { count: number; revenue: number };
    week: { count: number; revenue: number };
    month: { count: number; revenue: number };
    total: { count: number; revenue: number };
}

export interface ChartDay {
    date: string;
    day: string;
    orders: number;
    revenue: number;
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
    async getAll(filter = 'all', page = 1) {
        const response = await api.get('/admin/orders', { params: { filter, page } });
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
