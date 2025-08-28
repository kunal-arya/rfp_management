import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RfpForm } from '@/components/rfp/RfpForm';
import { useRfpById, useUpdateRfp } from '@/hooks/useRfp';
import { CreateRfpData } from '@/apis/rfp';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const EditRfpPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const { data: rfp, isLoading, isError } = useRfpById(rfpId || '');
  const updateRfpMutation = useUpdateRfp();

  const handleSubmit = (data: CreateRfpData) => {
    if (!rfpId) return;
    
    const payload = {
      ...data,
      deadline: new Date(data.deadline).toISOString()
    };
    
    updateRfpMutation.mutate(
      { rfpId, data: payload },
      {
        onSuccess: () => {
          navigate(`/rfps/${rfpId}`);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading RFP...</p>
        </div>
      </div>
    );
  }

  if (isError || !rfp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading RFP or RFP not found</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Convert the RFP data to form format
  const initialData = {
    title: rfp.title,
    description: rfp.current_version?.description || '',
    requirements: rfp.current_version?.requirements || '',
    budget_min: rfp.current_version?.budget_min || undefined,
    budget_max: rfp.current_version?.budget_max || undefined,
    deadline: rfp.current_version?.deadline 
      ? new Date(rfp.current_version.deadline).toISOString().slice(0, 16)
      : '',
    notes: rfp.current_version?.notes || '',
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Edit RFP</h1>
          <p className="text-muted-foreground">
            Update the details of your Request for Proposal.
          </p>
        </div>
      </div>

      <RfpForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={updateRfpMutation.isPending}
        error={updateRfpMutation.error?.message || null}
      />
    </div>
  );
};
