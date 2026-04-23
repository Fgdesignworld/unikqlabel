import api, { clearCsrfToken } from '@/lib/axios';

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
     * Admin logout — clears the in-memory CSRF token so the next login
     * request always fetches a fresh one from the (new) session.
     */
    async logout(): Promise<void> {
        // Clear cached token BEFORE the POST so the logout itself gets a
        // valid token, and the cleared state takes effect immediately after.
        try {
            await api.post('/admin/logout');
        } finally {
            clearCsrfToken();
        }
    },

    /**
     * Check authentication status
     */
    async getStatus(): Promise<{ authenticated: boolean; admin?: AdminUser }> {
        const response = await api.get('/admin/status');
        return response.data;
    },

    /**
     * Change admin password — requires current password for verification.
     * The API returns relogin:true, so the caller should redirect to /admin/login.
     */
    async changePassword(data: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }): Promise<{ success: boolean; message: string; relogin: boolean }> {
        const response = await api.post('/admin/account/change-password', data);
        return response.data;
    },

    /**
     * Change admin email — requires current password for verification.
     */
    async changeEmail(data: {
        current_password: string;
        new_email: string;
    }): Promise<{ success: boolean; message: string; new_email: string }> {
        const response = await api.post('/admin/account/change-email', data);
        return response.data;
    },
};
