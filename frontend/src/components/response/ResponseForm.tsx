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
import { usePublishedRfps } from '@/hooks/useRfp';

const responseSchema = z.object({
  rfp_id: z.string().min(1, 'RFP is required'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  timeline: z.string().min(1, 'Timeline is required').max(500, 'Timeline must be less than 500 characters'),
  cover_letter: z.string().min(10, 'Cover letter must be at least 10 characters').max(2000, 'Cover letter must be less than 2000 characters'),
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface ResponseFormProps {
  initialData?: Partial<ResponseFormData>;
  onSubmit: (data: CreateResponseData) => void;
  isLoading?: boolean;
  error?: string | null;
  mode: 'create' | 'edit';
  rfpId?: string;
  hideHeader?: boolean;
}

export const ResponseForm: React.FC<ResponseFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  error,
  mode,
  rfpId,
  hideHeader = false,
}) => {
  const { data: publishedRfps } = usePublishedRfps();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      ...initialData,
      rfp_id: rfpId || initialData?.rfp_id,
    },
  });

  const selectedRfpId = watch('rfp_id');

  const handleFormSubmit = (data: ResponseFormData) => {
    onSubmit(data as CreateResponseData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {!hideHeader && (
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {mode === 'create' ? 'Create Response' : 'Edit Response'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Fill in the details below to submit your response to the RFP'
            : 'Update your response details below'
          }
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

          {/* RFP Selection (dropdown for published RFPs) */}
          {!rfpId && (
            <div className="space-y-2 w-full">
              <Label htmlFor="rfp_id">Select RFP *</Label>
              <Select
                value={selectedRfpId}
                onValueChange={(value) => setValue('rfp_id', value)}
              >
                <SelectTrigger className={errors.rfp_id ? 'border-destructive w-full' : 'w-full'}>
                  <SelectValue placeholder="Choose an RFP to respond to" />
                </SelectTrigger>
                <SelectContent>
                  {publishedRfps?.data?.map((rfp) => (
                    <SelectItem key={rfp.id} value={rfp.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rfp.title}</span>
                        <span className="text-sm text-muted-foreground">
                          Budget: ${rfp.current_version?.budget_min || 0} - ${rfp.current_version?.budget_max || 'N/A'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rfp_id && (
                <p className="text-sm text-destructive">{errors.rfp_id.message}</p>
              )}
            </div>
          )}

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($) *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Enter your proposed budget"
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
              placeholder="Explain why you're the best choice for this project. Include your approach, experience, and any relevant qualifications."
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
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Response' : 'Update Response'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
