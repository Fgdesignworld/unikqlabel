import api from '@/lib/axios';

export interface AdminNotification {
    id: number;
    type: string;
    reference_id: number | null;
    message: string;
    is_read: number;
    created_at: string;
}

export const notificationService = {
    /**
     * Get all notifications + unread count
     */
    async getAll(): Promise<{ notifications: AdminNotification[]; unread_count: number }> {
        const response = await api.get('/admin/notifications');
        return response.data;
    },

    /**
     * Mark a single notification as read
     */
    async markRead(id: number): Promise<{ success: boolean; unread_count: number }> {
        const response = await api.put(`/admin/notifications/${id}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    async markAllRead(): Promise<{ success: boolean; unread_count: number }> {
        const response = await api.put('/admin/notifications/read-all');
        return response.data;
    },
};
