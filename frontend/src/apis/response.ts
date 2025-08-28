import apiClient from './client';
import { SupplierResponse, PaginatedResponse } from './types';

export interface CreateResponseData {
  rfp_id: string;
  budget: number;
  timeline: string;
  cover_letter: string;
  supplier_id?: string; // For admin users to specify supplier
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateResponseData extends Partial<CreateResponseData> {}

export interface ResponseFilters {
  rfp_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const responseApi = {
  // Get all responses for a user (supplier)
  getMyResponses: async (filters?: ResponseFilters): Promise<PaginatedResponse<SupplierResponse>> => {
    const response = await apiClient.get<PaginatedResponse<SupplierResponse>>('/rfp/my-responses', { params: filters });
    return response.data;
  },

  // Get all responses for an RFP (buyer)
  getRfpResponses: async (rfpId: string, filters?: ResponseFilters): Promise<SupplierResponse[]> => {
    const response = await apiClient.get<SupplierResponse[]>(`/rfp/${rfpId}/responses`, { params: filters });
    return response.data;
  },

  // Get specific response by ID
  getResponseById: async (responseId: string): Promise<SupplierResponse> => {
    const response = await apiClient.get<SupplierResponse>(`/rfp/responses/${responseId}`);
    return response.data;
  },

  // Create new response
  createResponse: async (data: CreateResponseData): Promise<SupplierResponse> => {
    const rfp_id = data.rfp_id.toString()
    const payload = {
      proposed_budget: data.budget,
      timeline: data.timeline,
      cover_letter: data.cover_letter,
      ...(data.supplier_id && { supplier_id: data.supplier_id }) // Include supplier_id for admin users
     }
    const response = await apiClient.post<SupplierResponse>(`/rfp/${rfp_id}/responses`, payload);
    return response.data;
  },

  // Update response
  updateResponse: async (responseId: string, data: UpdateResponseData): Promise<SupplierResponse> => {
    const payload = { 
      proposed_budget: data.budget,
      ...data,
     }
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}`, payload);
    return response.data;
  },

  // Delete response
  deleteResponse: async (responseId: string): Promise<void> => {
    await apiClient.delete(`/rfp/responses/${responseId}`);
  },

  // Submit response (change status to Submitted)
  submitResponse: async (responseId: string): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}/submit`);
    return response.data;
  },

  // Approve response (buyer only)
  approveResponse: async (responseId: string): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}/approve`);
    return response.data;
  },

  // Reject response (buyer only)
  rejectResponse: async (responseId: string, rejectionReason: string): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  },

  // Award response (buyer only)
  awardResponse: async (responseId: string): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}/award`);
    return response.data;
  },

  // Move response to review (buyer only)
  moveResponseToReview: async (responseId: string): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}/move-to-review`);
    return response.data;
  },

  // Reopen response for editing (buyer only)
  reopenResponseForEdit: async (responseId: string): Promise<SupplierResponse> => {
    const response = await apiClient.put<SupplierResponse>(`/rfp/responses/${responseId}/reopen`);
    return response.data;
  },
};
