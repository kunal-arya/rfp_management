import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApproveResponse, useRejectResponse, useAwardResponse, useMoveResponseToReview } from '@/hooks/useResponse';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierResponse } from '@/apis/types';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Award, MessageSquare } from 'lucide-react';

interface ResponseLifecycleActionsProps {
  response: SupplierResponse;
  onActionComplete?: () => void;
}

export const ResponseLifecycleActions: React.FC<ResponseLifecycleActionsProps> = ({
  response,
  onActionComplete,
}) => {
  const { user, permissionHelpers } = useAuth();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const approveResponseMutation = useApproveResponse();
  const rejectResponseMutation = useRejectResponse();
  const awardResponseMutation = useAwardResponse();
  const moveToReviewMutation = useMoveResponseToReview();

  const isAllowed = user?.role === "Admin" || user?.id === response.rfp?.buyer?.id;
  const canMoveToReview = isAllowed && permissionHelpers.hasPermission('supplier_response', 'review') && response.status.code === 'Submitted';
  const canApprove = isAllowed && permissionHelpers.hasPermission('supplier_response', 'approve') && response.status.code === 'Under Review';
  const canReject = isAllowed && permissionHelpers.hasPermission('supplier_response', 'reject') && response.status.code === 'Under Review';
  const canAward = isAllowed && permissionHelpers.hasPermission('supplier_response', 'award') && response.status.code === 'Approved';

  const handleApproveResponse = async () => {
    if (!window.confirm('Are you sure you want to approve this response?')) {
      return;
    }

    try {
      await approveResponseMutation.mutateAsync(response.id);
      toast.success('Response approved successfully');
      onActionComplete?.();
    } catch {
      toast.error('Failed to approve response');
    }
  };

  const handleRejectResponse = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectResponseMutation.mutateAsync({ responseId: response.id, rejectionReason: rejectionReason.trim() });
      toast.success('Response rejected successfully');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      onActionComplete?.();
    } catch {
      toast.error('Failed to reject response');
    }
  };

  const handleMoveToReview = async () => {
    if (!window.confirm('Are you sure you want to move this response to review? This will allow you to approve or reject it.')) {
      return;
    }

    try {
      await moveToReviewMutation.mutateAsync(response.id);
      toast.success('Response moved to review successfully');
      onActionComplete?.();
    } catch {
      toast.error('Failed to move response to review');
    }
  };

  const handleAwardResponse = async () => {
    if (!window.confirm('Are you sure you want to award this response? This will award the RFP to this supplier.')) {
      return;
    }

    try {
      await awardResponseMutation.mutateAsync(response.id);
      toast.success('Response awarded successfully');
      onActionComplete?.();
    } catch {
      toast.error('Failed to award response');
    }
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canMoveToReview && (
        <Button
          onClick={handleMoveToReview}
          disabled={moveToReviewMutation.isPending}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {moveToReviewMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          Move to Review
        </Button>
      )}

      {canApprove && (
        <Button
          onClick={handleApproveResponse}
          disabled={approveResponseMutation.isPending}
          variant="outline"
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          {approveResponseMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Approve Response
        </Button>
      )}

      {canReject && (
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Response
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Response</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this response. This will be shared with the supplier.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectResponse}
                disabled={!rejectionReason.trim() || rejectResponseMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectResponseMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canAward && (
        <Button
          onClick={handleAwardResponse}
          disabled={awardResponseMutation.isPending}
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          {awardResponseMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 mr-2" />
          ) : (
            <Award className="h-4 w-4 mr-2" />
          )}
          Award Response
        </Button>
      )}
    </div>
  );
};
