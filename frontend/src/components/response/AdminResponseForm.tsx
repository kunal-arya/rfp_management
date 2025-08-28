import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateResponseData } from '@/apis/response';
import { MessageSquare, AlertCircle } from 'lucide-react';

const adminResponseSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  timeline: z.string().min(1, 'Timeline is required').max(500, 'Timeline must be less than 500 characters'),
  cover_letter: z.string().min(10, 'Cover letter must be at least 10 characters').max(2000, 'Cover letter must be less than 2000 characters'),
});

type AdminResponseFormData = z.infer<typeof adminResponseSchema>;

interface AdminResponseFormProps {
  rfpId: string;
  suppliers: any[];
  existingResponses?: any[];
  onSubmit: (data: CreateResponseData) => void;
  isLoading?: boolean;
  error?: string | null;
  hideHeader?: boolean;
}

export const AdminResponseForm: React.FC<AdminResponseFormProps> = ({
  rfpId,
  suppliers,
  existingResponses = [],
  onSubmit,
  isLoading = false,
  error,
  hideHeader = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AdminResponseFormData>({
    resolver: zodResolver(adminResponseSchema),
  });

  const selectedSupplierId = watch('supplier_id');

  // Filter out suppliers who have already submitted responses
  const availableSuppliers = suppliers.filter(supplier =>
    !existingResponses.some(response => response.supplier_id === supplier.id)
  );

  const handleFormSubmit = (data: AdminResponseFormData) => {
    const responseData: CreateResponseData = {
      rfp_id: rfpId,
      budget: data.budget,
      timeline: data.timeline,
      cover_letter: data.cover_letter,
      supplier_id: data.supplier_id, // Add supplier_id for admin
    };
    onSubmit(responseData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {!hideHeader && (
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Create Response (Admin)
        </CardTitle>
        <CardDescription>
          Create a response for this RFP. Select the supplier for whom you want to create the response.
        </CardDescription>
      </CardHeader>
      )}
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Supplier Selection - Only for Admin */}
          <div className="space-y-2">
            <Label htmlFor="supplier_id">Select Supplier *</Label>
            <Select
              value={selectedSupplierId}
              onValueChange={(value) => setValue('supplier_id', value)}
            >
              <SelectTrigger className={errors.supplier_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Choose supplier for this response" />
              </SelectTrigger>
              <SelectContent>
                {availableSuppliers?.length > 0 ? (
                  availableSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{supplier.name}</span>
                        <span className="text-sm text-muted-foreground">({supplier.email})</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No suppliers available (all have already responded)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.supplier_id && (
              <p className="text-sm text-destructive">{errors.supplier_id.message}</p>
            )}
            {availableSuppliers.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                All {suppliers.length} suppliers have already submitted responses for this RFP.
              </p>
            ) : (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  {existingResponses.length} of {suppliers.length} suppliers have already responded.
                  {availableSuppliers.length} suppliers available to create responses for.
                </p>
                {existingResponses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="font-medium">Existing responses:</span>
                    {existingResponses.slice(0, 3).map((response: any) => (
                      <span key={response.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                        {response.supplier?.email || 'Unknown'} ({response.status?.label || 'Unknown'})
                      </span>
                    ))}
                    {existingResponses.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{existingResponses.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($) *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Enter proposed budget"
              {...register('budget', { valueAsNumber: true })}
              className={errors.budget ? 'border-destructive' : ''}
            />
            {errors.budget && (
              <p className="text-sm text-destructive">{errors.budget.message}</p>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline *</Label>
            <Input
              id="timeline"
              placeholder="e.g., 3-6 months, ASAP, Q1 2024"
              {...register('timeline')}
              className={errors.timeline ? 'border-destructive' : ''}
            />
            {errors.timeline && (
              <p className="text-sm text-destructive">{errors.timeline.message}</p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter *</Label>
            <Textarea
              id="cover_letter"
              placeholder="Explain why this supplier is the best choice for this project. Include their approach, experience, and any relevant qualifications."
              rows={6}
              {...register('cover_letter')}
              className={errors.cover_letter ? 'border-destructive' : ''}
            />
            {errors.cover_letter && (
              <p className="text-sm text-destructive">{errors.cover_letter.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={isLoading || availableSuppliers.length === 0}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                'Create Response'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
