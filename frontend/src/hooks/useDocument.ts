import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/apis/document';

export const useUploadRfpDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpVersionId, file }: { rfpVersionId: string; file: File }) =>
      documentApi.uploadForRfp(rfpVersionId, file),
    onSuccess: (data) => {
      // Invalidate queries related to the RFP to refetch documents
      queryClient.invalidateQueries({ queryKey: ['rfp', (data as any).rfp_version?.rfp_id] });
    },
    onError: (error) => {
      console.error('Failed to upload RFP document:', error);
      // You might want to show a toast notification here
    },
  });
};

export const useUploadResponseDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, file }: { responseId: string; file: File }) =>
      documentApi.uploadForResponse(responseId, file),
    onSuccess: (data) => {
      // Invalidate queries related to the response to refetch documents
      queryClient.invalidateQueries({ queryKey: ['response', (data as any).rfp_response_id] });
    },
    onError: (error) => {
      console.error('Failed to upload response document:', error);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, type, parentId }: { documentId: string; type: 'rfp' | 'response'; parentId: string }) => 
      documentApi.deleteDocument(documentId, type, parentId),
    onSuccess: (_, { documentId, type }) => {
      console.log(`Document ${documentId} deleted`);
      
      // Invalidate specific queries based on document type
      if (type === 'rfp') {
        queryClient.invalidateQueries({ queryKey: ['rfps'] });
        queryClient.invalidateQueries({ queryKey: ['rfp'] });
      } else if (type === 'response') {
        queryClient.invalidateQueries({ queryKey: ['responses'] });
        queryClient.invalidateQueries({ queryKey: ['response'] });
      }
    },
    onError: (error) => {
      console.error('Failed to delete document:', error);
    },
  });
};
