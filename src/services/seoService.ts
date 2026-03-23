import api from '@/lib/axios';

export interface SeoRecord {
    id?: number;
    page_type: 'home' | 'product' | 'category' | 'page';
    page_id?: number | null;
    page_slug?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    og_image?: string | null;
    related_name?: string | null;
    updated_at?: string;
}

export const seoService = {
    /** Public: get SEO for any page */
    async getForPage(pageType: string, pageId?: number, pageSlug?: string): Promise<SeoRecord | null> {
        const params: Record<string, string | number> = { page_type: pageType };
        if (pageId !== undefined) params.page_id = pageId;
        if (pageSlug !== undefined) params.page_slug = pageSlug;
        const res = await api.get('/seo', { params });
        return res.data.data?.seo ?? null;
    },

    /** Admin: all records */
    async getAll(): Promise<SeoRecord[]> {
        const res = await api.get('/admin/seo');
        return res.data.data?.seo ?? [];
    },

    /** Admin: single by id */
    async getById(id: number): Promise<SeoRecord> {
        const res = await api.get(`/admin/seo/${id}`);
        return res.data.data.seo;
    },

    /** Admin: upsert */
    async upsert(data: SeoRecord): Promise<SeoRecord> {
        const res = await api.post('/admin/seo', data);
        return res.data.data.seo;
    },

    /** Admin: delete */
    async delete(id: number): Promise<void> {
        await api.delete(`/admin/seo/${id}`);
    },
};
