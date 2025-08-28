import React from 'react';
import { useParams } from 'react-router-dom';
import { ResponseForm } from '@/components/response/ResponseForm';
import { useCreateResponse } from '@/hooks/useResponse';
import { CreateResponseData } from '@/apis/response';

export const CreateResponsePage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const createResponseMutation = useCreateResponse();

  const handleSubmit = (data: CreateResponseData) => {
    createResponseMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Response</h1>
        <p className="text-muted-foreground">
          Submit your response to the RFP. Make sure to provide detailed information about your approach and capabilities.
        </p>
      </div>

      <ResponseForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createResponseMutation.isPending}
        error={createResponseMutation.error?.message || null}
        rfpId={rfpId}
      />
    </div>
  );
};
