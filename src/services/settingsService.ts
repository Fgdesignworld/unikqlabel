import api from '@/lib/axios';

export interface SiteSettings {
    // General
    site_name?: string;
    site_tagline?: string;
    currency_symbol?: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    // Contact
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    // Social
    social_facebook?: string | null;
    social_instagram?: string | null;
    social_youtube?: string | null;
    social_twitter?: string | null;
    // Branding
    theme_color?: string | null;
    header_bg?: string | null;
    footer_bg?: string | null;
    // Typography
    font_heading?: string | null;
    font_body?: string | null;
    [key: string]: string | null | undefined;
}

export type GroupedSettings = Record<string, Record<string, string | null>>;

export const settingsService = {
    /** Public: all flat settings */
    async getAll(): Promise<SiteSettings> {
        const res = await api.get('/settings');
        return res.data.data?.settings ?? {};
    },

    /** Admin: grouped settings */
    async getGrouped(): Promise<GroupedSettings> {
        const res = await api.get('/admin/settings/grouped');
        return res.data.data?.settings ?? {};
    },

    /** Admin: batch update */
    async bulkUpdate(settings: Partial<SiteSettings>): Promise<SiteSettings> {
        const res = await api.post('/admin/settings', { settings });
        return res.data.data?.settings ?? {};
    },

    /** Admin: upload logo */
    async uploadLogo(file: File): Promise<string> {
        const form = new FormData();
        form.append('logo', file);
        const res = await api.post('/admin/settings/upload-logo', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data.url;
    },
};
