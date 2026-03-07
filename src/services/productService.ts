import api from '@/lib/axios';
import type { Product } from '@/data/products';

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
  sort_order: number;
}

/**
 * Maps an API product to the frontend Product interface
 * used by ProductCard, PickleCard, BestSellerCard, etc.
 */
function mapToProduct(p: ApiProduct): Product {
  return {
    id: p.slug || String(p.id),
    name: p.name,
    price: p.price,
    weight: p.weight,
    image: p.image || '/images/placeholder.jpg',
    category: p.category,
    description: p.description || undefined,
    rating: p.rating,
    bestseller: p.bestseller,
    isVeg: p.is_veg,
    isHomemade: p.is_homemade,
    variants: p.variants || undefined,
    sortOrder: p.sort_order ?? 0,
  };
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
   * Reorder products (admin)
   */
  async reorderProducts(items: { id: number; sort_order: number }[]): Promise<void> {
    await api.post('/admin/products/reorder', items);
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

  // ─── PUBLIC-FACING METHODS (return frontend Product format) ───

  /**
   * Get all active products mapped to the frontend Product interface
   */
  async getPublicProducts(): Promise<Product[]> {
    const apiProducts = await this.getAll();
    return apiProducts
      .map(mapToProduct)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const all = await this.getPublicProducts();
    return all.filter(p => p.category === category);
  },

  /**
   * Get bestseller products
   */
  async getBestsellers(): Promise<Product[]> {
    const all = await this.getPublicProducts();
    return all.filter(p => p.bestseller);
  },
};
