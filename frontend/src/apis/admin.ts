import apiClient from './client';
import { User, UserStats } from './types';

// Configuration APIs
export const getSystemConfig = () => apiClient.get('/admin/config');
export const updateSystemConfig = (config: any) => apiClient.put('/admin/config', config);

// Export APIs
export const exportUsers = (options: any) => apiClient.post('/admin/export/users', options);
export const exportRfps = (options: any) => apiClient.post('/admin/export/rfps', options);
export const exportResponses = (options: any) => apiClient.post('/admin/export/responses', options);
export const exportAuditLogs = (options: any) => apiClient.post('/admin/export/audit-logs', options);

// Report APIs
export const generateSystemReport = (options: any) => apiClient.post('/admin/reports/generate', options);
export const scheduleReport = (options: any) => apiClient.post('/admin/reports/schedule', options);

// Admin Dashboard APIs - Using existing dashboard routes
// These are handled by the dashboard service based on user role

// User Management APIs
export const getUsers = (params?: any) => apiClient.get('/admin/users', { params });
export const getUser = (id: string) => apiClient.get(`/admin/users/get/${id}`);
export const updateUser = (id: string, data: any) => apiClient.put(`/admin/users/${id}`, data);
export const deleteUser = (id: string) => apiClient.delete(`/admin/users/${id}`);
export const toggleUserStatus = (id: string, action: 'activate' | 'deactivate') => 
  apiClient.put(`/admin/users/${id}/toggle-status`, { action });

export const getUserStats = () => apiClient.get('/admin/users/stats');

export const createUser = (data: { name: string; email: string; password: string; roleName: string }) => 
  apiClient.post('/admin/users', data);

// Analytics APIs
export const getAnalytics = (params?: any) => apiClient.get('/admin/analytics', { params });

// Audit APIs
export const getAuditLogs = (params?: any) => apiClient.get('/admin/audit-logs', { params });

// RFP Management APIs
export const getAdminRfps = (params?: any) => apiClient.get('/admin/rfps', { params });
export const getAdminRfp = (id: string) => apiClient.get(`/admin/rfps/${id}`);

// Response Management APIs
export const getAdminResponses = (params?: any) => apiClient.get('/admin/responses', { params });
export const getAdminResponse = (id: string) => apiClient.get(`/admin/responses/${id}`);

// Notification APIs
export const getNotifications = (params?: any) => apiClient.get('/admin/notifications', { params });

// Document APIs
export const getDocuments = (params?: any) => apiClient.get('/admin/documents', { params });

// Support APIs
export const getSupportTickets = (params?: any) => apiClient.get('/admin/support/tickets', { params });

// Admin Audit APIs
export interface AdminAuditFilters {
  user_id?: string;
  action?: string;
  target_type?: string;
  target_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  'gte___created_at'?: string;
  'lte___created_at'?: string;
}

export interface AdminAuditResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

export const getAdminAuditTrails = (filters?: AdminAuditFilters) => 
  apiClient.get<AdminAuditResponse>('/audit/all', { params: filters });

export const getAdminAuditStats = () => 
  apiClient.get('/admin/audit/stats');

// Permission Management APIs
export const getAllRoles = () => apiClient.get('/admin/roles');
export const getRolePermissions = (roleName: string) => apiClient.get(`/admin/roles/${roleName}/permissions`);
export const updateRolePermissions = (roleName: string, permissions: any) => 
  apiClient.put(`/admin/roles/${roleName}/permissions`, { permissions });
