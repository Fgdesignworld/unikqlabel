import api from '@/lib/axios'

export interface Review {
  id: number
  product_id: number
  name: string
  rating: number
  comment: string
  image: string | null
  is_verified: boolean
  created_at: string
}

export interface ReviewStats {
  total: number
  average: number
  breakdown: Record<number, number>
}

export interface ReviewsResponse {
  reviews: Review[]
  stats: ReviewStats
}

export interface AdminReview extends Review {
  email: string
  status: 'pending' | 'approved' | 'rejected'
  product_name: string
  ip_address: string
  verified_at: string | null
  updated_at: string
}

export interface ReviewSubmission {
  product_id: number
  name: string
  email: string
  rating: number
  comment: string
}

export interface AdminReviewPayload {
  product_id: number
  name: string
  email: string
  rating: number
  comment: string
  status?: 'pending' | 'approved' | 'rejected'
  is_verified?: 0 | 1
}

export const reviewService = {
  /** Public: get approved + verified reviews for a product */
  async getByProduct(productId: number): Promise<ReviewsResponse> {
    const res = await api.get('/reviews', { params: { product_id: productId } })
    return res.data
  },

  /** Public: submit a new review (triggers verification email) */
  async submit(data: ReviewSubmission): Promise<{ success: boolean; message: string }> {
    const res = await api.post('/reviews', data)
    return res.data
  },

  /** Admin: get all reviews with optional filters */
  async adminGetAll(filters?: {
    status?: string
    is_verified?: string
    product_id?: number
  }): Promise<AdminReview[]> {
    const res = await api.get('/admin/reviews', { params: filters })
    return res.data.reviews
  },

  /** Admin: approve a review */
  async approve(id: number): Promise<void> {
    await api.put(`/admin/reviews/${id}/approve`)
  },

  /** Admin: reject a review */
  async reject(id: number): Promise<void> {
    await api.put(`/admin/reviews/${id}/reject`)
  },

  /** Admin: delete a review */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/reviews/${id}`)
  },

  /** Admin: create a review directly (no email flow) */
  async adminCreate(data: AdminReviewPayload): Promise<AdminReview> {
    const res = await api.post('/admin/reviews', data)
    return res.data.review
  },

  /** Admin: update any field of a review */
  async adminUpdate(id: number, data: Partial<AdminReviewPayload>): Promise<AdminReview> {
    const res = await api.put(`/admin/reviews/${id}`, data)
    return res.data.review
  },
}
