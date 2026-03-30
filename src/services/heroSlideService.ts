import api from '@/lib/axios';

export interface HeroSlide {
    id?: number;
    title: string;
    subtitle?: string | null;
    tagline?: string | null;
    cta_primary_text?: string | null;
    cta_primary_link?: string | null;
    cta_secondary_text?: string | null;
    cta_secondary_link?: string | null;
    image?: string | null;
    mobile_image?: string | null;
    badge_text?: string | null;
    badge_icon?: string | null;
    category: 'men' | 'women' | 'unisex' | 'trending' | 'limited';
    product_ids?: number[] | null;
    price_label?: string | null;
    is_active?: boolean;
    sort_order?: number;
    start_date?: string | null;
    end_date?: string | null;
    created_at?: string;
    updated_at?: string;
}

export const heroSlideService = {
    /** Public: active slides for the hero carousel */
    async getPublic(): Promise<HeroSlide[]> {
        const res = await api.get('/hero-slides');
        return res.data.data?.slides ?? [];
    },

    /** Admin: all slides */
    async getAll(): Promise<HeroSlide[]> {
        const res = await api.get('/admin/hero-slides');
        return res.data.data?.slides ?? [];
    },

    /** Admin: single slide */
    async getById(id: number): Promise<HeroSlide> {
        const res = await api.get(`/admin/hero-slides/${id}`);
        return res.data.data.slide;
    },

    /** Admin: create */
    async create(data: HeroSlide): Promise<HeroSlide> {
        const res = await api.post('/admin/hero-slides', data);
        return res.data.data.slide;
    },

    /** Admin: update */
    async update(id: number, data: Partial<HeroSlide>): Promise<HeroSlide> {
        const res = await api.put(`/admin/hero-slides/${id}`, data);
        return res.data.data.slide;
    },

    /** Admin: delete */
    async delete(id: number): Promise<void> {
        await api.delete(`/admin/hero-slides/${id}`);
    },

    /** Admin: toggle active */
    async toggle(id: number): Promise<boolean> {
        const res = await api.put(`/admin/hero-slides/${id}/toggle`, {});
        return res.data.data.is_active;
    },

    /** Admin: reorder */
    async reorder(order: { id: number; sort_order: number }[]): Promise<void> {
        await api.post('/admin/hero-slides/reorder', { order });
    },

    /** Admin: upload image */
    async uploadImage(file: File): Promise<string> {
        const form = new FormData();
        form.append('image', file);
        const res = await api.post('/admin/hero-slides/upload-image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data.url;
    },
};
