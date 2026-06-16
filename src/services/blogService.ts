import api from '@/lib/axios'

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  author: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  featured: boolean
  views: number
  read_time: number | null
  meta_title: string | null
  meta_desc: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogPostPayload {
  title: string
  slug?: string
  excerpt?: string | null
  content?: string | null
  cover_image?: string | null
  author?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  featured?: boolean
  read_time?: number | null
  meta_title?: string | null
  meta_desc?: string | null
  published_at?: string | null
}

export interface BlogListResult {
  posts: BlogPost[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const blogService = {
  // ── Public ──────────────────────────────────────────────────────────────

  /** Public: fetch published posts with optional filters */
  async getPublished(params?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
    featured?: boolean
  }): Promise<BlogListResult> {
    const res = await api.get('/blog', { params })
    return res.data.data
  },

  /** Public: distinct published categories */
  async getCategories(): Promise<string[]> {
    const res = await api.get('/blog/categories')
    return res.data.data.categories ?? []
  },

  /** Public: single post by slug (increments views) */
  async getBySlug(slug: string): Promise<BlogPost> {
    const res = await api.get(`/blog/${slug}`)
    return res.data.data.post
  },

  // ── Admin ────────────────────────────────────────────────────────────────

  /** Admin: all posts */
  async adminGetAll(params?: { status?: string; search?: string }): Promise<BlogPost[]> {
    const res = await api.get('/admin/blog', { params })
    return res.data.data.posts ?? []
  },

  /** Admin: single post by ID */
  async adminGetById(id: number): Promise<BlogPost> {
    const res = await api.get(`/admin/blog/${id}`)
    return res.data.data.post
  },

  /** Admin: create post */
  async create(data: BlogPostPayload): Promise<BlogPost> {
    const res = await api.post('/admin/blog', data)
    return res.data.data.post
  },

  /** Admin: update post */
  async update(id: number, data: Partial<BlogPostPayload>): Promise<BlogPost> {
    const res = await api.put(`/admin/blog/${id}`, data)
    return res.data.data.post
  },

  /** Admin: toggle draft/published */
  async toggle(id: number): Promise<'draft' | 'published'> {
    const res = await api.put(`/admin/blog/${id}/toggle`, {})
    return res.data.data.status
  },

  /** Admin: delete post */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/blog/${id}`)
  },

  /** Admin: upload cover image (with compression applied by caller) */
  async uploadImage(file: File): Promise<string> {
    const form = new FormData()
    form.append('image', file)
    const res = await api.post('/admin/blog/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data.url
  },
}
