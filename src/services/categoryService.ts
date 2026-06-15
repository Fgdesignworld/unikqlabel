import api from '@/lib/axios';

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    parent_id: number | null;
    sub_count?: number;
    parent_name?: string;
    product_count?: number;
    created_at?: string;
    subcategories?: Category[];
}

export interface CategoryPayload {
    name: string;
    slug?: string;
    image?: string | null;
    status?: 'active' | 'inactive';
    sort_order?: number;
    parent_id?: number | null;
}

export const categoryService = {
    /** Public: active categories (flat) */
    async getActive(): Promise<Category[]> {
        const res = await api.get('/categories');
        return res.data.data?.categories ?? [];
    },

    /** Public: hierarchical tree (parents with subcategories array) */
    async getTree(): Promise<Category[]> {
        const res = await api.get('/categories/tree');
        return res.data.data?.categories ?? [];
    },

    /** Admin: all categories */
    async getAll(): Promise<Category[]> {
        const res = await api.get('/admin/categories');
        return res.data.data?.categories ?? [];
    },

    /** Admin: single category */
    async getById(id: number): Promise<Category> {
        const res = await api.get(`/admin/categories/${id}`);
        return res.data.data.category;
    },

    /** Admin: create */
    async create(data: CategoryPayload): Promise<Category> {
        const res = await api.post('/admin/categories', data);
        return res.data.data.category;
    },

    /** Admin: update */
    async update(id: number, data: Partial<CategoryPayload>): Promise<Category> {
        const res = await api.put(`/admin/categories/${id}`, data);
        return res.data.data.category;
    },

    /** Admin: delete */
    async delete(id: number): Promise<void> {
        await api.delete(`/admin/categories/${id}`);
    },

    /** Admin: toggle status */
    async toggle(id: number): Promise<string> {
        const res = await api.put(`/admin/categories/${id}/toggle`, {});
        return res.data.data.status;
    },

    /** Admin: upload image */
    async uploadImage(file: File): Promise<string> {
        const form = new FormData();
        form.append('image', file);
        const res = await api.post('/admin/categories/upload-image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data.url;
    },
};
