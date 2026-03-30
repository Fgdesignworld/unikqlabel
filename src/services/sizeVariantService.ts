import api from "@/lib/axios";

export interface SizeVariant {
  id: number;
  set_id: number;
  label: string;
  price_adjustment: number;
  sort_order: number;
  is_active: number;
}

export interface SizeVariantSet {
  id: number;
  name: string;
  is_active: number;
  created_at: string;
  variants: SizeVariant[];
}

export const sizeVariantService = {
  /** Admin — all sets with variants */
  async getAll(): Promise<SizeVariantSet[]> {
    const res = await api.get("/admin/variant-sets");
    return res.data.sets ?? [];
  },

  /** Public — active sets with active variants (used by product form) */
  async getActive(): Promise<SizeVariantSet[]> {
    const res = await api.get("/variant-sets");
    return res.data.sets ?? [];
  },

  async create(name: string): Promise<SizeVariantSet> {
    const res = await api.post("/admin/variant-sets", { name });
    return res.data.set;
  },

  async update(id: number, payload: { name?: string; is_active?: number }): Promise<SizeVariantSet> {
    const res = await api.put(`/admin/variant-sets/${id}`, payload);
    return res.data.set;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/variant-sets/${id}`);
  },

  async getVariants(setId: number): Promise<SizeVariant[]> {
    const res = await api.get(`/admin/variant-sets/${setId}/variants`);
    return res.data.variants ?? [];
  },

  /** Bulk save — replaces all variants for a set */
  async saveVariants(
    setId: number,
    variants: Array<{ label: string; price_adjustment?: number; sort_order?: number; is_active?: number }>
  ): Promise<SizeVariant[]> {
    const res = await api.post(`/admin/variant-sets/${setId}/variants`, { variants });
    return res.data.variants ?? [];
  },
};
