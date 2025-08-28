import apiClient from './client';
import { DateRange } from 'react-day-picker';

export interface AuditTrail {
  id: number;
  user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface AuditTrailResponse {
  data: AuditTrail[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditFilters {
  user_id?: string;
  action?: string;
  target_type?: string;
  target_id?: string;
  search?: string;
  dateRange?: DateRange;
  page?: number;
  limit?: number;
  // Backend-specific filter keys
  'gte___created_at'?: string;
  'lte___created_at'?: string;
}

export const auditApi = {
  // Get user's own audit trails
  getMyAuditTrails: async (filters?: AuditFilters): Promise<AuditTrailResponse> => {
    const response = await apiClient.get<AuditTrailResponse>('/audit/my', { params: filters });
    return response.data;
  },

  // Get audit trails for a specific target
  getTargetAuditTrails: async (targetType: string, targetId: string, filters?: AuditFilters): Promise<AuditTrailResponse> => {
    const response = await apiClient.get<AuditTrailResponse>(`/audit/target/${targetType}/${targetId}`, { params: filters });
    return response.data;
  },

  // Get all audit trails (admin only)
  getAllAuditTrails: async (filters?: AuditFilters): Promise<AuditTrailResponse> => {
    const response = await apiClient.get<AuditTrailResponse>('/audit/all', { params: filters });
    return response.data;
  },
};
