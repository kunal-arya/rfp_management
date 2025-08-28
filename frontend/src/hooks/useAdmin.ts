import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSystemConfig,
  updateSystemConfig,
  getDatabaseStats,
  testDatabaseConnection,
  createBackup,
  exportUsers,
  exportRfps,
  exportResponses,
  exportAuditLogs,
  generateSystemReport,
  scheduleReport,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  createUser,
  getAnalytics,
  getAuditLogs,
  getAdminRfps,
  getAdminRfp,
  getAdminResponses,
  getAdminResponse,
  getNotifications,
  getDocuments,
  getSupportTickets,
  getAdminAuditTrails,
  getAdminAuditStats,
  AdminAuditFilters,
  getAllRoles,
  getRolePermissions,
  updateRolePermissions,
} from '../apis/admin';

// Configuration hooks
export const useSystemConfig = () => useQuery({ queryKey: ['system-config'], queryFn: getSystemConfig });
export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSystemConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-config'] }),
  });
};

// Report hooks
export const useGenerateSystemReport = () => useMutation({ mutationFn: generateSystemReport });
export const useScheduleReport = () => useMutation({ mutationFn: scheduleReport });

// Admin Dashboard hooks - Using existing dashboard hooks
// These are handled by the dashboard service based on user role

// User Management hooks
export const useUsers = (params?: any) => useQuery({ 
  queryKey: ['admin-users', params], 
  queryFn: () => getUsers(params),
});
export const useUser = (id: string) => useQuery({ 
  queryKey: ['admin-user', id], 
  queryFn: () => getUser(id),
  enabled: !!id 
});
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useToggleUserStatus = (user_params?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'activate' | 'deactivate' }) => 
      toggleUserStatus(id, action),
    onSuccess: (_, { action }) => {
      toast.success(`User ${action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users', user_params] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });

    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
    },
  });
};

export const useUserStats = () => useQuery({ 
  queryKey: ['admin-user-stats'], 
  queryFn: getUserStats 
});

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });
};

// Analytics hooks
export const useAnalytics = (params?: any) => useQuery({ 
  queryKey: ['admin-analytics', params], 
  queryFn: () => getAnalytics(params) 
});

// Audit hooks
export const useAuditLogs = (params?: any) => useQuery({ 
  queryKey: ['admin-audit-logs', params], 
  queryFn: () => getAuditLogs(params) 
});

// RFP Management hooks
export const useAdminRfps = (params?: any) => useQuery({ 
  queryKey: ['admin-rfps', params], 
  queryFn: () => getAdminRfps(params) 
});
export const useAdminRfp = (id: string) => useQuery({ 
  queryKey: ['admin-rfp', id], 
  queryFn: () => getAdminRfp(id),
  enabled: !!id 
});

// Response Management hooks
export const useAdminResponses = (params?: any) => useQuery({ 
  queryKey: ['admin-responses', params], 
  queryFn: () => getAdminResponses(params) 
});
export const useAdminResponse = (id: string) => useQuery({ 
  queryKey: ['admin-response', id], 
  queryFn: () => getAdminResponse(id),
  enabled: !!id 
});

// Notification hooks
export const useNotifications = (params?: any) => useQuery({ 
  queryKey: ['admin-notifications', params], 
  queryFn: () => getNotifications(params) 
});

// Document hooks
export const useDocuments = (params?: any) => useQuery({ 
  queryKey: ['admin-documents', params], 
  queryFn: () => getDocuments(params) 
});

// Support hooks
export const useSupportTickets = (params?: any) => useQuery({ 
  queryKey: ['admin-support-tickets', params], 
  queryFn: () => getSupportTickets(params) 
});

// Admin Audit hooks
export const useAdminAuditTrails = (filters?: AdminAuditFilters) => useQuery({ 
  queryKey: ['admin-audit', filters], 
  queryFn: () => getAdminAuditTrails(filters).then(res => res.data) 
});

export const useAdminAuditStats = () => useQuery({ 
  queryKey: ['admin-audit-stats'], 
  queryFn: () => getAdminAuditStats().then(res => res.data) 
});

// Permission Management hooks
export const useAllRoles = () => useQuery({ 
  queryKey: ['admin-roles'], 
  queryFn: () => getAllRoles().then(res => res.data) 
});

export const useRolePermissions = (roleName: string) => useQuery({ 
  queryKey: ['admin-role-permissions', roleName], 
  queryFn: () => getRolePermissions(roleName).then(res => res.data),
  enabled: !!roleName 
});

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleName, permissions }: { roleName: string; permissions: any }) => 
      updateRolePermissions(roleName, permissions),
    onSuccess: (_, { roleName }) => {
      toast.success(`Permissions updated for ${roleName} role successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-role-permissions', roleName] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role permissions');
    },
  });
};
