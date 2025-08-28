import { useQuery } from '@tanstack/react-query';
import { auditApi, AuditFilters } from '@/apis/audit';

export const useMyAuditTrails = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['audit', 'my', filters],
    queryFn: () => auditApi.getMyAuditTrails(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTargetAuditTrails = (targetType: string, targetId: string, filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['audit', 'target', targetType, targetId, filters],
    queryFn: () => auditApi.getTargetAuditTrails(targetType, targetId, filters),
    enabled: !!targetType && !!targetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllAuditTrails = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ['audit', 'all', filters],
    queryFn: () => auditApi.getAllAuditTrails(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
