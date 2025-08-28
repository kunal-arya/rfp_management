import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { responseApi, CreateResponseData, UpdateResponseData, ResponseFilters } from '@/apis/response';
import { useNavigate } from 'react-router-dom';

export const useMyResponses = (filters?: ResponseFilters) => {
  return useQuery({
    queryKey: ['responses', 'my', filters],
    queryFn: () => responseApi.getMyResponses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRfpResponses = (rfpId: string, filters?: ResponseFilters) => {
  return useQuery({
    queryKey: ['responses', 'rfp', rfpId, filters],
    queryFn: () => responseApi.getRfpResponses(rfpId, filters),
    enabled: !!rfpId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useResponseById = (responseId: string) => {
  return useQuery({
    queryKey: ['response', responseId],
    queryFn: () => responseApi.getResponseById(responseId),
    enabled: !!responseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateResponse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateResponseData) => responseApi.createResponse(data),
    onSuccess: (newResponse) => {
      // Invalidate and refetch responses
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', newResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Navigate to the new response
      navigate(`/responses/${newResponse.id}`);
    },
    onError: (error) => {
      console.error('Failed to create response:', error);
    },
  });
};

export const useUpdateResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, data }: { responseId: string; data: UpdateResponseData }) =>
      responseApi.updateResponse(responseId, data),
    onSuccess: (updatedResponse) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', updatedResponse.id], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to update response:', error);
    },
  });
};

export const useDeleteResponse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (responseId: string) => responseApi.deleteResponse(responseId),
    onSuccess: (_, responseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['response', responseId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Navigate back to responses list
      navigate('/responses');
    },
    onError: (error) => {
      console.error('Failed to delete response:', error);
    },
  });
};

export const useSubmitResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => responseApi.submitResponse(responseId),
    onSuccess: (updatedResponse, responseId) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', responseId], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to submit response:', error);
    },
  });
};

export const useApproveResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => responseApi.approveResponse(responseId),
    onSuccess: (updatedResponse) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', updatedResponse.id], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to approve response:', error);
    },
  });
};

export const useRejectResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, rejectionReason }: { responseId: string; rejectionReason: string }) =>
      responseApi.rejectResponse(responseId, rejectionReason),
    onSuccess: (updatedResponse) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', updatedResponse.id], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to reject response:', error);
    },
  });
};


export const useAwardResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => responseApi.awardResponse(responseId),
    onSuccess: (updatedResponse) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', updatedResponse.id], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
    onError: (error) => {
      console.error('Failed to award response:', error);
    },
  });
};

export const useMoveResponseToReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => responseApi.moveResponseToReview(responseId),
    onSuccess: (updatedResponse) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', updatedResponse.id], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to move response to review:', error);
    },
  });
};

export const useReopenResponseForEdit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => responseApi.reopenResponseForEdit(responseId),
    onSuccess: (updatedResponse) => {
      // Update the specific response in cache
      queryClient.setQueryData(['response', updatedResponse.id], updatedResponse);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['responses', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['responses', 'rfp', updatedResponse.rfp_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to reopen response for editing:', error);
    },
  });
};