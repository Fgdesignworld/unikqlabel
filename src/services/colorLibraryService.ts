import api from "@/lib/axios";

export interface LibraryColor {
  id: number;
  name: string;
  hex_code: string;
  is_active: number;
  created_at: string;
}

export interface ProductColorMapping {
  id: number;
  product_id: number;
  color_id: number;
  color_name: string;
  hex_code: string;
  images: string[];
}

export const colorLibraryService = {
  /** Admin — all colors */
  async getAll(): Promise<LibraryColor[]> {
    const res = await api.get("/admin/colors");
    return res.data.colors ?? [];
  },

  /** Public — active colors (used by product form) */
  async getActive(): Promise<LibraryColor[]> {
    const res = await api.get("/colors");
    return res.data.colors ?? [];
  },

  async create(payload: { name: string; hex_code: string }): Promise<LibraryColor> {
    const res = await api.post("/admin/colors", payload);
    return res.data.color;
  },

  async update(id: number, payload: { name?: string; hex_code?: string; is_active?: number }): Promise<LibraryColor> {
    const res = await api.put(`/admin/colors/${id}`, payload);
    return res.data.color;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/colors/${id}`);
  },

  /** Get product→color mappings */
  async getProductColors(productId: number): Promise<ProductColorMapping[]> {
    const res = await api.get(`/admin/products/${productId}/color-images`);
    return res.data.colors ?? [];
  },

  /** Save (replace) product→color mappings */
  async saveProductColors(
    productId: number,
    colors: Array<{ color_id: number; images: string[] }>
  ): Promise<ProductColorMapping[]> {
    const res = await api.post(`/admin/products/${productId}/color-images`, { colors });
    return res.data.colors ?? [];
  },
};
