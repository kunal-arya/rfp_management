import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/apis/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
