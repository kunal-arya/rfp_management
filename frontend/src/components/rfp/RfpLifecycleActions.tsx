import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCloseRfp, useCancelRfp, useAwardRfp } from '@/hooks/useRfp';
import { useAuth } from '@/contexts/AuthContext';
import { RFP, SupplierResponse } from '@/apis/types';
import { toast } from 'sonner';
import { Award, Lock, Ban } from 'lucide-react';

interface RfpLifecycleActionsProps {
  rfp: RFP;
  responses?: SupplierResponse[];
  onActionComplete?: () => void;
}

export const RfpLifecycleActions: React.FC<RfpLifecycleActionsProps> = ({
  rfp,
  responses = [],
  onActionComplete,
}) => {
  const { user, permissionHelpers } = useAuth();
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string>('');

  const closeRfpMutation = useCloseRfp();
  const cancelRfpMutation = useCancelRfp();
  const awardRfpMutation = useAwardRfp();

  const isAllowed = user?.role === 'Admin' || user?.id === rfp.buyer?.id;
  const canClose = isAllowed && permissionHelpers.hasPermission('rfp', 'close') && rfp.status.code === 'Published';
  const canCancel = isAllowed && permissionHelpers.hasPermission('rfp', 'cancel') && ['Draft', 'Published'].includes(rfp.status.code);
  const canAward = isAllowed && permissionHelpers.hasPermission('rfp', 'award') && ['Published', 'Closed'].includes(rfp.status.code);

  const approvedResponses = responses.filter(response => response.status.code === 'Approved');

  const handleCloseRfp = async () => {
    if (!window.confirm('Are you sure you want to close this RFP? This will prevent new responses from being submitted.')) {
      return;
    }

    try {
      await closeRfpMutation.mutateAsync(rfp.id);
      toast.success('RFP closed successfully');
      onActionComplete?.();
    } catch (error) {
      toast.error('Failed to close RFP');
    }
  };

  const handleCancelRfp = async () => {
    if (!window.confirm('Are you sure you want to cancel this RFP? This action cannot be undone.')) {
      return;
    }

    try {
      await cancelRfpMutation.mutateAsync(rfp.id);
      toast.success('RFP cancelled successfully');
      onActionComplete?.();
    } catch (error) {
      toast.error('Failed to cancel RFP');
    }
  };

  const handleAwardRfp = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedResponseId) {
      toast.error('Please select a response to award');
      return;
    }

    try {
      await awardRfpMutation.mutateAsync({ rfpId: rfp.id, responseId: selectedResponseId });
      toast.success('RFP awarded successfully');
      setIsAwardDialogOpen(false);
      setSelectedResponseId('');
      onActionComplete?.();
    } catch (error) {
      toast.error('Failed to award RFP');
    }
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canClose && (
        <Button
          onClick={handleCloseRfp}
          disabled={closeRfpMutation.isPending}
          variant="outline"
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          {closeRfpMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700 mr-2" />
          ) : (
            <Lock className="h-4 w-4 mr-2" />
          )}
          Close RFP
        </Button>
      )}

      {canCancel && (
        <Button
          onClick={handleCancelRfp}
          disabled={cancelRfpMutation.isPending}
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          {cancelRfpMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2" />
          ) : (
            <Ban className="h-4 w-4 mr-2" />
          )}
          Cancel RFP
        </Button>
      )}

      {canAward && approvedResponses.length > 0 && (
        <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Award className="h-4 w-4 mr-2" />
              Award RFP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award RFP</DialogTitle>
              <DialogDescription>
                Select the approved response you want to award this RFP to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="response-select">Select Response</Label>
                <Select value={selectedResponseId} onValueChange={setSelectedResponseId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an approved response" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {approvedResponses.map((response) => (
                      <SelectItem key={response.id} value={response.id} className="w-full">
                        <div className="flex w-full gap-2">
                          <span className="font-medium">{response.supplier.email}</span>
                          <span className="text-sm text-muted-foreground">
                            Budget: ${response.proposed_budget || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAwardDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAwardRfp}
                disabled={!selectedResponseId || awardRfpMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {awardRfpMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                Award RFP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canAward && approvedResponses.length === 0 && (
        <Button
          variant="outline"
          disabled
          className="border-gray-200 text-gray-500"
        >
          <Award className="h-4 w-4 mr-2" />
          No Approved Responses
        </Button>
      )}
    </div>
  );
};
