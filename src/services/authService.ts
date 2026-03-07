import api from '@/lib/axios';

export interface AdminLoginPayload {
    email: string;
    password: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
}

export const authService = {
    /**
     * Admin login
     */
    async login(data: AdminLoginPayload): Promise<AdminUser> {
        const response = await api.post('/admin/login', data);
        return response.data.admin;
    },

    /**
     * Admin logout
     */
    async logout(): Promise<void> {
        await api.post('/admin/logout');
    },

    /**
     * Check authentication status
     */
    async getStatus(): Promise<{ authenticated: boolean; admin?: AdminUser }> {
        const response = await api.get('/admin/status');
        return response.data;
    },
};
