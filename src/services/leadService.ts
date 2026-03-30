import api from '@/lib/axios';

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  inquiry_type: 'order' | 'bulk' | 'support' | 'custom_design' | 'other';
  message: string;
  preferred_contact: 'call' | 'whatsapp' | 'email';
  website?: string; // honeypot
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  inquiry_type: string;
  message: string;
  preferred_contact: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  lead_score: 'hot' | 'warm' | 'cold';
  source: string;
  tags: string | null;
  created_at: string;
  followups?: LeadFollowup[];
  activities?: LeadActivity[];
}

export interface LeadFollowup {
  id: number;
  lead_id: number;
  type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'note';
  notes: string;
  next_followup_date: string | null;
  created_at: string;
}

export interface LeadActivity {
  id: number;
  lead_id: number;
  action: string;
  meta_json: string | null;
  created_at: string;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface UpcomingFollowup {
  id: number;
  lead_id: number;
  type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'note';
  notes: string;
  next_followup_date: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  status: Lead['status'];
  lead_score: Lead['lead_score'];
  inquiry_type: string;
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface LeadStats {
  total: number;
  new_count: number;
  contacted_count: number;
  converted_count: number;
  hot_count: number;
  today_count: number;
}

export const leadService = {
  /** Public: submit a contact/lead form */
  async submit(payload: LeadPayload): Promise<{ success: boolean; message: string }> {
    const res = await api.post('/contact/submit', payload);
    return res.data;
  },

  /** Admin: paginated list */
  async getAll(params: Record<string, string | number> = {}): Promise<LeadListResponse> {
    const res = await api.get('/admin/leads', { params });
    return res.data.data;
  },

  /** Admin: single lead with follow-ups + activities */
  async getById(id: number): Promise<Lead> {
    const res = await api.get(`/admin/leads/${id}`);
    return res.data.data.lead;
  },

  /** Admin: update status / score */
  async updateStatus(id: number, status: Lead['status'], lead_score?: Lead['lead_score']): Promise<void> {
    await api.patch(`/admin/leads/${id}/status`, { status, lead_score });
  },

  /** Admin: add follow-up */
  async addFollowup(id: number, data: { type: LeadFollowup['type']; notes: string; next_followup_date?: string }): Promise<void> {
    await api.post(`/admin/leads/${id}/followup`, data);
  },

  /** Admin: soft delete */
  async deleteLead(id: number): Promise<void> {
    await api.delete(`/admin/leads/${id}`);
  },

  /** Admin: stats */
  async getStats(): Promise<LeadStats> {
    const res = await api.get('/admin/leads/stats');
    return res.data.data.stats;
  },

  /** Admin: upcoming followups grouped by date */
  async getUpcoming(days = 7): Promise<Record<string, UpcomingFollowup[]>> {
    const res = await api.get('/admin/leads/upcoming', { params: { days } });
    return res.data.data.followups ?? {};
  },

  /** Admin: daily lead counts for last N days */
  async getDailyStats(days = 14): Promise<DailyStat[]> {
    const res = await api.get('/admin/leads/daily-stats', { params: { days } });
    return res.data.data.stats ?? [];
  },

  /** Admin: export CSV URL */
  exportUrl(): string {
    return '/api/admin/leads/export';
  },
};
