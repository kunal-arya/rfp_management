import apiClient from './client';
import { DashboardData, DashboardStats } from './types';

export const dashboardApi = {
  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/dashboard');
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
