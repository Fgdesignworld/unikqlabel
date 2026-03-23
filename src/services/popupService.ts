import api from '@/lib/axios';

export interface PopupItem {
    id: number;
    name: string;
    weight: string;
    image?: string;
}

export interface PopupData {
    id?: number;
    title: string;
    description?: string | null;
    image?: string | null;
    button_text?: string | null;
    button_link?: string | null;
    delay_seconds?: number;
    is_active?: boolean;
    price?: number | null;
    header_background?: string;
    items?: PopupItem[] | null;
    views?: number;
    clicks?: number;
}

export const popupService = {
    /** Public: get active popup */
    async getActive(): Promise<PopupData | null> {
        const res = await api.get('/popup');
        return res.data.data?.popup ?? null;
    },

    /** Admin: all popups */
    async getAll(): Promise<PopupData[]> {
        const res = await api.get('/admin/popups');
        return res.data.data?.popups ?? [];
    },

    /** Admin: single */
    async getById(id: number): Promise<PopupData> {
        const res = await api.get(`/admin/popups/${id}`);
        return res.data.data.popup;
    },

    /** Admin: create */
    async create(data: PopupData): Promise<PopupData> {
        const res = await api.post('/admin/popups', data);
        return res.data.data.popup;
    },

    /** Admin: update */
    async update(id: number, data: Partial<PopupData>): Promise<PopupData> {
        const res = await api.put(`/admin/popups/${id}`, data);
        return res.data.data.popup;
    },

    /** Admin: delete */
    async delete(id: number): Promise<void> {
        await api.delete(`/admin/popups/${id}`);
    },

    /** Admin: toggle on/off */
    async toggle(id: number): Promise<boolean> {
        const res = await api.put(`/admin/popups/${id}/toggle`, {});
        return res.data.data.is_active;
    },

    /** Admin: upload image */
    async uploadImage(file: File): Promise<string> {
        const form = new FormData();
        form.append('image', file);
        const res = await api.post('/admin/popups/upload-image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data.url;
    },
};
