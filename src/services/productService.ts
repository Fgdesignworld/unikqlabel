import api from '@/lib/axios';

export interface ProductVariant {
  weight: string;
  price: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: 'snacks' | 'pickles' | 'spices' | 'sweets';
  weight: string;
  price: number;
  image: string | null;
  rating: number;
  bestseller: boolean;
  is_veg: boolean;
  is_homemade: boolean;
  variants: ProductVariant[] | null;
  status: 'active' | 'inactive';
}

export const productService = {
  /**
   * Get all active products (public)
   */
  async getAll(): Promise<ApiProduct[]> {
    const response = await api.get('/products');
    return response.data.products;
  },

  /**
   * Get all products (admin)
   */
  async adminGetAll(): Promise<ApiProduct[]> {
    const response = await api.get('/admin/products');
    return response.data.products;
  },

  /**
   * Create a product (admin)
   */
  async create(data: Partial<ApiProduct>): Promise<ApiProduct> {
    const response = await api.post('/admin/products', data);
    return response.data.product;
  },

  /**
   * Update a product (admin)
   */
  async update(id: number, data: Partial<ApiProduct>): Promise<ApiProduct> {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data.product;
  },

  /**
   * Delete a product (admin)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  /**
   * Upload product image (admin)
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/admin/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.path;
  },
};
