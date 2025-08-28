import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRfpVersions, useCreateRfpVersion, useSwitchRfpVersion } from '@/hooks/useRfp';
import { useAuth } from '@/contexts/AuthContext';
import { RFP } from '@/apis/types';
import { RfpForm } from './RfpForm';
import { CreateRfpData } from '@/apis/rfp';
import { toast } from 'sonner';
import { 
  GitBranch, 
  Plus, 
  CheckCircle, 
  Clock, 
  FileText,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface RfpVersioningProps {
  rfp: RFP;
  onVersionChange?: () => void;
}

export const RfpVersioning: React.FC<RfpVersioningProps> = ({
  rfp,
  onVersionChange,
}) => {
  const { user } = useAuth();
  const [isCreateVersionDialogOpen, setIsCreateVersionDialogOpen] = useState(false);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);

  const { data: versions, isLoading: versionsLoading } = useRfpVersions(rfp.id);
  const createVersionMutation = useCreateRfpVersion();
  const switchVersionMutation = useSwitchRfpVersion();

  const isAllowed = user?.role === 'Admin' || user?.id === rfp.buyer?.id;
  const isDraft = rfp.status.code === 'Draft';

  const handleCreateVersion = (data: CreateRfpData) => {
    createVersionMutation.mutate(
      { rfpId: rfp.id, data },
      {
        onSuccess: () => {
          toast.success('New RFP version created successfully');
          setIsCreateVersionDialogOpen(false);
          onVersionChange?.();
        },
        onError: () => {
          toast.error('Failed to create new version');
        },
      }
    );
  };

  const handleSwitchVersion = (versionId: string) => {
    switchVersionMutation.mutate(
      { rfpId: rfp.id, versionId },
      {
        onSuccess: () => {
          toast.success('RFP version switched successfully');
          setIsVersionsDialogOpen(false);
          onVersionChange?.();
        },
        onError: () => {
          toast.error('Failed to switch version');
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`; 
    return 'Not specified';
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="space-y-4 w-full">
      {/* Version Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5" />
            Version Information
          </CardTitle>
          <CardDescription>
            Current version: {rfp.current_version?.version_number || 1}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-col md:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Current Version {rfp.current_version?.version_number || 1}
              </Badge>
              {versions && versions.length > 1 && (
                <Badge variant="secondary">
                  {versions.length} total versions
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {isDraft && (
                <Dialog open={isCreateVersionDialogOpen} onOpenChange={setIsCreateVersionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Version
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[90vw] max-h-[95vh] flex flex-col">
                    {/* Header stays fixed */}
                    <DialogHeader className="pb-6 shrink-0">
                      <DialogTitle className="text-2xl font-bold">Create New RFP Version</DialogTitle>
                      <DialogDescription className="text-base">
                        Create a new version of this RFP. This will increment the version number and set it as the current version.
                      </DialogDescription>
                    </DialogHeader>
                
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                      <div className="bg-muted/30 rounded-lg p-4 border">
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                          Current Version Info
                        </h4>
                        <p className="text-sm">
                          Creating version{" "}
                          {rfp.current_version?.version_number
                            ? rfp.current_version.version_number + 1
                            : 2}{" "}
                          from version {rfp.current_version?.version_number || 1}
                        </p>
                      </div>
                
                      <RfpForm
                        mode="create"
                        hideHeader={true}
                        initialData={{
                          title: rfp.title,
                          description: rfp.current_version?.description || "",
                          requirements: rfp.current_version?.requirements || "",
                          budget_min: rfp.current_version?.budget_min,
                          budget_max: rfp.current_version?.budget_max,
                          deadline: rfp.current_version?.deadline
                            ? format(new Date(rfp.current_version.deadline), "yyyy-MM-dd'T'HH:mm")
                            : "",
                          notes: rfp.current_version?.notes || "",
                        }}
                        onSubmit={handleCreateVersion}
                        isLoading={createVersionMutation.isPending}
                        error={createVersionMutation.error?.message}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setIsVersionsDialogOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View All Versions
              </Button>
            </div>
          </div>

          {/* Current Version Details */}
          {rfp.current_version && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">Current Version Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {formatDate(rfp.current_version.deadline)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Budget: {formatBudget(rfp.current_version.budget_min, rfp.current_version.budget_max)}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Description:</strong> {rfp.current_version.description}</p>
                <p><strong>Requirements:</strong> {rfp.current_version.requirements}</p>
                {rfp.current_version.notes && (
                  <p><strong>Notes:</strong> {rfp.current_version.notes}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Versions Dialog */}
      <Dialog open={isVersionsDialogOpen} onOpenChange={setIsVersionsDialogOpen}>
        <DialogContent className="max-w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>RFP Versions</DialogTitle>
            <DialogDescription>
              View and manage all versions of this RFP. You can switch between versions if the RFP is in Draft status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {versionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : versions && versions.length > 0 ? (
              <div className="space-y-3">
                {versions.map((version) => (
                  <Card key={version.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={version.id === rfp.current_version_id ? "default" : "outline"}
                              className="flex items-center gap-1"
                            >
                              {version.id === rfp.current_version_id ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              Version {version.version_number}
                              {version.id === rfp.current_version_id && " (Current)"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Created {formatDate(version.created_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span><span className='font-semibold'>Deadline:</span> {formatDate(version.deadline)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span><span className='font-semibold'>Budget:</span> {formatBudget(version.budget_min, version.budget_max)}</span>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p><strong>Description:</strong> {version.description}</p>
                            <p><strong>Requirements:</strong> {version.requirements}</p>
                            {version.notes && (
                              <p><strong>Notes:</strong> {version.notes}</p>
                            )}
                          </div>

                        {isDraft && version.id !== rfp.current_version_id && (
                          <div className='flex justify-end'>
                          <Button
                            size="sm"
                            variant="outline"
                            className='flex justify-end'
                            onClick={() => handleSwitchVersion(version.id)}
                            disabled={switchVersionMutation.isPending}
                          >
                            {switchVersionMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Switch to This Version'
                            )}
                          </Button>
                          </div>
                        )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No versions found. This RFP has only one version.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
