import apiClient from './client';
import { RFP, PaginatedResponse, RFPVersion } from './types';

export interface CreateRfpData {
  title: string;
  description: string;
  requirements: string;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  notes?: string;
}

export interface UpdateRfpData extends Partial<CreateRfpData> {
  version_id?: string;
}

export interface RfpFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  show_new_rfps?: number;
  includeStats?: boolean;
  // Backend-specific filter keys with ___ prefixes
  'gte___deadline'?: string;
  'lte___deadline'?: string;
  'gte___created_at'?: string;
  'lte___created_at'?: string;
  'gte___budget_min'?: number;
  'lte___budget_min'?: number;
  'gte___budget_max'?: number;
  'lte___budget_max'?: number;
  'eq___buyer_id'?: string;
  'contains___title'?: string;
  'contains___description'?: string;
}

export const rfpApi = {
  // Get all RFPs (for suppliers - published only)
  getAllRfps: async (filters?: RfpFilters): Promise<PaginatedResponse<RFP>> => {
    const response = await apiClient.get<PaginatedResponse<RFP>>('/rfp/all', { params: filters });
    return response.data;
  },

  // Get user's own RFPs (for buyers)
  getMyRfps: async (filters?: RfpFilters): Promise<PaginatedResponse<RFP>> => {
    const response = await apiClient.get<PaginatedResponse<RFP>>('/rfp/my', { params: filters });
    return response.data;
  },

  // Get specific RFP by ID
  getRfpById: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.get<RFP>(`/rfp/get/${rfpId}`);
    return response.data;
  },

  // Create new RFP
  createRfp: async (data: CreateRfpData): Promise<RFP> => {
    const response = await apiClient.post<RFP>('/rfp', data);
    return response.data;
  },

  // Update RFP
  updateRfp: async (rfpId: string, data: UpdateRfpData): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}`, data);
    return response.data;
  },

  // Delete RFP
  deleteRfp: async (rfpId: string): Promise<void> => {
    await apiClient.delete(`/rfp/${rfpId}`);
  },

  // Publish RFP
  publishRfp: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/publish`);
    return response.data;
  },

  // Close RFP
  closeRfp: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/close`);
    return response.data;
  },

  // Cancel RFP
  cancelRfp: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/cancel`);
    return response.data;
  },

  // Award RFP to a response
  awardRfp: async (rfpId: string, responseId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/award`, { response_id: responseId });
    return response.data;
  },

  // Create new RFP version
  createRfpVersion: async (rfpId: string, data: CreateRfpData): Promise<RFP> => {
    const response = await apiClient.post<RFP>(`/rfp/${rfpId}/versions`, data);
    return response.data;
  },

  // Get RFP versions
  getRfpVersions: async (rfpId: string): Promise<RFPVersion[]> => {
    const response = await apiClient.get<RFPVersion[]>(`/rfp/${rfpId}/versions`);
    return response.data;
  },

  // Switch RFP version
  switchRfpVersion: async (rfpId: string, versionId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/versions/${versionId}/switch`);
    return response.data;
  },
};
