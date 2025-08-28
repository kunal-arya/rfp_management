import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponseList } from '@/components/response/ResponseList';
import { useRfpResponses } from '@/hooks/useResponse';
import { useApproveResponse, useRejectResponse } from '@/hooks/useResponse';

export const RfpResponsesPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const { data: responsesData, isLoading } = useRfpResponses(rfpId || '');
  const approveResponseMutation = useApproveResponse();
  const rejectResponseMutation = useRejectResponse();

  const handleViewResponse = (responseId: string) => {
    navigate(`/responses/${responseId}`);
  };

  const handleApproveResponse = (responseId: string) => {
    if (confirm('Are you sure you want to approve this response?')) {
      approveResponseMutation.mutate(responseId);
    }
  };

  const handleRejectResponse = (responseId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    rejectResponseMutation.mutate({ responseId, rejectionReason: reason || '' });
  };

  const handleCreateResponse = () => {
    navigate('/responses/create');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RFP Responses</h1>
        <p className="text-muted-foreground">
          Review and manage responses to your RFP.
        </p>
      </div>

      <ResponseList
        responses={responsesData || []}
        isLoading={isLoading}
        onViewResponse={handleViewResponse}
        onEditResponse={() => {}} // Not available for buyers
        onDeleteResponse={() => {}} // Not available for buyers
        onSubmitResponse={() => {}} // Not available for buyers
        onApproveResponse={handleApproveResponse}
        onRejectResponse={handleRejectResponse}
        onCreateResponse={handleCreateResponse}
        showCreateButton={false}
        showActions={true}
        showBuyerActions={true}
      />
    </div>
  );
};
