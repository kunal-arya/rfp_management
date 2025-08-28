import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResponseForm } from './ResponseForm';
import { useUpdateResponse } from '@/hooks/useResponse';
import { UpdateResponseData } from '@/apis/response';
import { SupplierResponse } from '@/apis/types';
import { Edit } from 'lucide-react';

interface EditResponseDialogProps {
  response: SupplierResponse;
}

export const EditResponseDialog: React.FC<EditResponseDialogProps> = ({
  response,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateResponseMutation = useUpdateResponse();

  const handleSubmit = (data: UpdateResponseData) => {
    updateResponseMutation.mutate(
      { responseId: response.id, data },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      }
    );
  };

  const initialData = {
    rfp_id: response.rfp.id,
    budget: response.proposed_budget,
    timeline: response.timeline,
    cover_letter: response.cover_letter,
    notes: response.notes || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Response
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Response</DialogTitle>
          <DialogDescription>
            Update your response details for "{response.rfp.title}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <ResponseForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={updateResponseMutation.isPending}
            error={updateResponseMutation.error?.message || null}
            rfpId={response.rfp.id}
            hideHeader={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
