import apiClient from './client';
import { Document } from './types';

export const documentApi = {
  // Upload document for an RFP
  uploadForRfp: async (rfpVersionId: string, file: File): Promise<Document> => {
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
  
    // Ensure we have a valid file
    if (!file || file.size === 0) {
      throw new Error('Invalid file: file is empty or undefined');
    }
  
    const formData = new FormData();
    formData.append('document', file);
    formData.append('file_type', file.type);
  
    // Debug FormData contents
    for (const [key, value] of formData.entries()) {
      console.log('FormData entry:', key, value);
      if (value instanceof File) {
        console.log('File entry details:', {
          name: value.name,
          size: value.size,
          type: value.type
        });
      }
    }
    
    const response = await apiClient.post<Document>(`/rfp/${rfpVersionId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload document for a Response
  uploadForResponse: async (responseId: string, file: File): Promise<Document> => {
    // Ensure we have a valid file
    if (!file || file.size === 0) {
      throw new Error('Invalid file: file is empty or undefined');
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('file_type', file.type);

    const response = await apiClient.post<Document>(`/rfp/responses/${responseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (documentId: string, type: 'rfp' | 'response', parentId: string): Promise<void> => {
    await apiClient.delete(`/rfp/documents/${documentId}?type=${type}&parentId=${parentId}`);
  },
};
