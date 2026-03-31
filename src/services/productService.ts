import api from '@/lib/axios';
import type { Product, SizeVariant, ColorVariant } from '@/data/products';

export interface ProductVariant {
  weight: string;
  price: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  weight: string;
  price: number;
  discount_price: number | null;
  image: string | null;
  gallery_images: string[] | null;
  rating: number;
  bestseller: boolean;
  variants: ProductVariant[] | null;
  variants_json: SizeVariant[] | null;       // NEW
  color_variants_json: ColorVariant[] | null; // NEW
  status: 'active' | 'inactive';
  sort_order: number;
  total_stock?: number | null;               // stock sum from inventory
  variant_inventory?: Array<{ size: string | null; color: string | null; stock: number }> | null;
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
    discount_price: p.discount_price ?? undefined,
    weight: p.weight,
    image: p.image || '/images/placeholder.jpg',
    gallery: p.gallery_images ?? undefined,
    category: p.category,
    description: p.description || undefined,
    rating: p.rating,
    bestseller: p.bestseller,
    variants: p.variants || undefined,
    sizeVariants: p.variants_json || undefined,
    colorVariants: p.color_variants_json || undefined,
    sortOrder: p.sort_order ?? 0,
    totalStock: p.total_stock ?? undefined,
    variantInventory: p.variant_inventory ?? undefined,
    numericId: p.id,
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
   * Get a single product by ID (admin)
   */
  async adminGetById(id: number): Promise<ApiProduct> {
    const response = await api.get(`/admin/products/${id}`);
    return response.data.product;
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

  /**
   * Get a single product by slug (public)
   */
  async getApiBySlug(slug: string): Promise<ApiProduct | null> {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data.product as ApiProduct;
    } catch {
      const all = await this.getAll();
      return all.find(p => p.slug === slug) ?? null;
    }
  },

  /** Convert raw ApiProduct to frontend Product format */
  mapApiProduct(raw: ApiProduct): Product {
    return mapToProduct(raw);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const raw = await this.getApiBySlug(slug);
    return raw ? mapToProduct(raw) : null;
  },

  /**
   * Get filtered products (client-side filter on all active)
   */
  async getFiltered(params: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    let products = await this.getPublicProducts();
    if (params.category && params.category !== 'all') {
      products = products.filter(p => p.category === params.category);
    }
    if (params.minPrice !== undefined) {
      products = products.filter(p => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      products = products.filter(p => p.price <= params.maxPrice!);
    }
    return products;
  },
};
