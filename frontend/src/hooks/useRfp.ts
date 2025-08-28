import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfpApi, CreateRfpData, UpdateRfpData, RfpFilters } from '@/apis/rfp';
import { useNavigate } from 'react-router-dom';

export const useAllRfps = (filters?: RfpFilters) => {
  return useQuery({
    queryKey: ['rfps', 'all', filters],
    queryFn: () => rfpApi.getAllRfps(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePublishedRfps = (filters?: RfpFilters) => {
  return useQuery({
    queryKey: ['rfps', 'published', filters],
    queryFn: () => rfpApi.getAllRfps({...filters, status: "Published", show_new_rfps: 1}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyRfps = (filters?: RfpFilters) => {
  return useQuery({
    queryKey: ['rfps', 'my', filters],
    queryFn: () => rfpApi.getMyRfps(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRfpById = (rfpId: string) => {
  return useQuery({
    queryKey: ['rfp', rfpId],
    queryFn: () => rfpApi.getRfpById(rfpId),
    enabled: !!rfpId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateRfp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateRfpData) => rfpApi.createRfp(data),
    onSuccess: (newRfp) => {
      // Invalidate and refetch RFPs
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Navigate to the new RFP
      navigate(`/rfps/${newRfp.id}`);
    },
    onError: (error) => {
      console.error('Failed to create RFP:', error);
    },
  });
};

export const useUpdateRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpId, data }: { rfpId: string; data: UpdateRfpData }) =>
      rfpApi.updateRfp(rfpId, data),
    onSuccess: (updatedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to update RFP:', error);
    },
  });
};

export const useDeleteRfp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (rfpId: string) => rfpApi.deleteRfp(rfpId),
    onSuccess: (_, rfpId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['rfp', rfpId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Navigate back to RFPs list
      navigate('/rfps');
    },
    onError: (error) => {
      console.error('Failed to delete RFP:', error);
    },
  });
};

export const useCloseRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rfpId: string) => rfpApi.closeRfp(rfpId),
    onSuccess: (updatedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to close RFP:', error);
    },
  });
};

export const useCancelRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rfpId: string) => rfpApi.cancelRfp(rfpId),
    onSuccess: (updatedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to cancel RFP:', error);
    },
  });
};

export const useAwardRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpId, responseId }: { rfpId: string; responseId: string }) =>
      rfpApi.awardRfp(rfpId, responseId),
    onSuccess: (updatedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['responses'] });
    },
    onError: (error) => {
      console.error('Failed to award RFP:', error);
    },
  });
};

export const usePublishRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rfpId: string) => rfpApi.publishRfp(rfpId),
    onSuccess: (publishedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', publishedRfp.id], publishedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to publish RFP:', error);
    },
  });
};

export const useCreateRfpVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpId, data }: { rfpId: string; data: CreateRfpData }) =>
      rfpApi.createRfpVersion(rfpId, data),
    onSuccess: (updatedRfp) => {
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      queryClient.invalidateQueries({ queryKey: ['rfp-versions', updatedRfp.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
    onError: (error) => {
      console.error('Failed to create RFP version:', error);
    },
  });
};

export const useRfpVersions = (rfpId: string) => {
  return useQuery({
    queryKey: ['rfp-versions', rfpId],
    queryFn: () => rfpApi.getRfpVersions(rfpId),
    enabled: !!rfpId,
  });
};

export const useSwitchRfpVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpId, versionId }: { rfpId: string; versionId: string }) =>
      rfpApi.switchRfpVersion(rfpId, versionId),
    onSuccess: (updatedRfp) => {
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      queryClient.invalidateQueries({ queryKey: ['rfp-versions', updatedRfp.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
    onError: (error) => {
      console.error('Failed to switch RFP version:', error);
    },
  });
};
