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
import { CreateRfpData } from '@/apis/rfp';
import { FileText, AlertCircle } from 'lucide-react';

const rfpSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  budget_min: z.number().min(0, 'Minimum budget must be positive').optional(),
  budget_max: z.number().min(0, 'Maximum budget must be positive').optional(),
  deadline: z.string().min(1, 'Deadline is required').refine((date) => {
    const selectedDate = new Date(date);
    const now = new Date();
    return selectedDate > now;
  }, {
    message: "Deadline must be in the future",
  }),
  notes: z.string().optional(),
  buyer_id: z.string().optional(), // Optional for admin users
}).refine((data) => {
  if (data.budget_min && data.budget_max) {
    return data.budget_max >= data.budget_min;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budget_max"],
});

type RfpFormData = z.infer<typeof rfpSchema>;

interface RfpFormProps {
  initialData?: Partial<RfpFormData>;
  onSubmit: (data: CreateRfpData) => void;
  isLoading?: boolean;
  error?: string | null;
  mode: 'create' | 'edit';
  isAdmin?: boolean;
  buyers?: Array<{ id: string; email: string; name?: string }>;
  hideHeader?: boolean;
}

export const RfpForm: React.FC<RfpFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  error,
  mode,
  isAdmin = false,
  buyers = [],
  hideHeader = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RfpFormData>({
    resolver: zodResolver(rfpSchema),
    defaultValues: initialData,
  });

  const selectedBuyerId = watch('buyer_id');

  const handleFormSubmit = (data: RfpFormData) => {
    onSubmit(data as CreateRfpData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {!hideHeader && (
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {mode === 'create' ? 'Create New RFP' : 'Edit RFP'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Fill in the details below to create a new Request for Proposal'
            : 'Update the RFP details below'
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

          {/* Title and Buyer (for admin) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter RFP title"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="buyer_id">Buyer *</Label>
                <Select
                  value={selectedBuyerId || ''}
                  onValueChange={(value) => setValue('buyer_id', value)}
                >
                  <SelectTrigger className={errors.buyer_id ? 'border-destructive w-full' : 'w-full'}>
                    <SelectValue placeholder="Select buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        <span className="font-medium">{buyer.name}</span> <span className="text-xs text-muted-foreground">({buyer.email})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.buyer_id && (
                  <p className="text-sm text-destructive">{errors.buyer_id.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the project"
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              placeholder="List the specific requirements and deliverables"
              rows={4}
              {...register('requirements')}
              className={errors.requirements ? 'border-destructive' : ''}
            />
            {errors.requirements && (
              <p className="text-sm text-destructive">{errors.requirements.message}</p>
            )}
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Minimum Budget ($)</Label>
              <Input
                id="budget_min"
                type="number"
                placeholder="0"
                {...register('budget_min', { valueAsNumber: true })}
                className={errors.budget_min ? 'border-destructive' : ''}
              />
              {errors.budget_min && (
                <p className="text-sm text-destructive">{errors.budget_min.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Maximum Budget ($)</Label>
              <Input
                id="budget_max"
                type="number"
                placeholder="0"
                {...register('budget_max', { valueAsNumber: true })}
                className={errors.budget_max ? 'border-destructive' : ''}
              />
              {errors.budget_max && (
                <p className="text-sm text-destructive">{errors.budget_max.message}</p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                {...register('deadline')}
                className={errors.deadline ? 'border-destructive' : ''}
              />
            {errors.deadline && (
              <p className="text-sm text-destructive">{errors.deadline.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information or special requirements"
              rows={3}
              {...register('notes')}
            />
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
                mode === 'create' ? 'Create RFP' : 'Update RFP'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
