import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRfpById, usePublishRfp, useDeleteRfp } from '@/hooks/useRfp';
import { RfpLifecycleActions } from '@/components/rfp/RfpLifecycleActions';
import { RfpVersioning } from '@/components/rfp/RfpVersioning';
import { useRfpResponses } from '@/hooks/useResponse';
import { useDeleteDocument, useUploadRfpDocument } from '@/hooks/useDocument';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentList } from '@/components/shared/DocumentList';
import { FileUpload } from '@/components/shared/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Clock, 
  Upload, 
  MessageSquare,
  ArrowLeft,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const RfpDetailPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const { user, permissionHelpers } = useAuth();
  const { data: rfp, isLoading, isError } = useRfpById(rfpId || '');
  const { data: responses, isLoading: responsesLoading } = useRfpResponses(rfpId || '');
  const deleteDocumentMutation = useDeleteDocument();
  const uploadDocumentMutation = useUploadRfpDocument();
  const publishRfpMutation = usePublishRfp();
  const deleteRfpMutation = useDeleteRfp();
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      if (rfp?.current_version?.id) {
        deleteDocumentMutation.mutate({
          documentId: docId,
          type: 'rfp',
          parentId: rfp.current_version.id,
        });
      }
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!rfp?.current_version?.id) {
      toast.error('Cannot upload documents: RFP version not found');
      return;
    }

    setUploadingDocs(true);
    try {
      for (const file of files) {
        await uploadDocumentMutation.mutateAsync({ 
          rfpVersionId: rfp.current_version.id, 
          file 
        });
        toast.success(`Document "${file.name}" uploaded successfully!`);
      }
    } catch (error) {
      console.error('Failed to upload documents:', error);
      toast.error('Failed to upload some documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  const canManageDocuments = permissionHelpers.hasPermission('rfp', 'manage_documents');
  const canCreateResponse = permissionHelpers.hasPermission('supplier_response', 'create');
  const canPublishRfp = permissionHelpers.hasPermission('rfp', 'publish');
  const isAllowed = user?.role === 'Admin' || user?.id === rfp?.buyer?.id;
  const isPublished = rfp?.status.code === 'Published';
  const isDraft = rfp?.status.code === 'Draft';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading RFP details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading RFP details</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">RFP not found</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-500';
      case 'published': return 'bg-green-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{rfp.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Badge className={`${getStatusColor(rfp.status.code)} text-white w-fit`}>
                  {rfp.status.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created on {format(new Date(rfp.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 flex-row-reverse">
            {isAllowed && canPublishRfp && isDraft && (
              <Button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to publish this RFP? This will make it visible to all suppliers.')) {
                    publishRfpMutation.mutate(rfpId || '');
                  }
                }}
                disabled={publishRfpMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                {publishRfpMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Publish RFP
              </Button>
            )}
            
            {isAllowed && isDraft && (
              <Button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this RFP? This action cannot be undone.')) {
                    deleteRfpMutation.mutate(rfpId || '');
                  }
                }}
                disabled={deleteRfpMutation.isPending}
                variant="destructive"
                size="sm"
              >
                {deleteRfpMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete RFP
              </Button>
            )}
            
            {/* Lifecycle Actions */}
            <RfpLifecycleActions 
              rfp={rfp} 
              responses={responses || []}
              onActionComplete={() => {
                // Refetch data after lifecycle action
                window.location.reload();
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFP Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  RFP Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {rfp.current_version?.description}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {rfp.current_version?.requirements}
                  </p>
                </div>
                {rfp.current_version?.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Additional Notes</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {rfp.current_version.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          {/* Versioning Section */}
          <RfpVersioning 
            rfp={rfp}
            onVersionChange={() => {
              window.location.reload();
            }}
          />

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>
                  Documents provided with this RFP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentList 
                  documents={rfp.current_version?.documents || []}
                  onDelete={handleDelete}
                  title=""
                />
              </CardContent>
            </Card>

            {/* Upload Documents - Only show if user has permission and RFP is not published */}
            {canManageDocuments && isAllowed && isDraft && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload New Documents
                  </CardTitle>
                  <CardDescription>
                    Add supporting documents to this RFP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload 
                    onFilesSelect={handleFileUpload} 
                    isLoading={uploadingDocs || uploadDocumentMutation.isPending} 
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Supplier Responses ({responses?.length || 0})
                </CardTitle>
                <CardDescription>
                  Responses submitted by suppliers for this RFP
                </CardDescription>
              </CardHeader>
              <CardContent>
                {responsesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading responses...
                  </div>
                ) : responses && responses && responses.length > 0 ? (
                  <div className="space-y-4">
                    {responses
                      .map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{response.supplier.email}</span>
                          </div>
                          <Badge variant={response.status.code === 'Submitted' ? 'default' : 'secondary'}>
                            {response.status.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div>Budget: {formatCurrency(response.proposed_budget)}</div>
                          <div>Timeline: {response.timeline || 'Not specified'}</div>
                        </div>
                        {response.cover_letter && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {response.cover_letter.substring(0, 150)}...
                          </p>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/responses/${response.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No responses submitted yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RFP Info */}
            <Card>
              <CardHeader>
                <CardTitle>RFP Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                    <p className="font-medium">{rfp.buyer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">
                      {format(new Date(rfp.current_version?.deadline || ''), 'MMM dd, yyyy - HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                    <p className="font-medium">
                      {rfp.current_version?.budget_min || rfp.current_version?.budget_max ? (
                        `${formatCurrency(rfp.current_version.budget_min)} - ${formatCurrency(rfp.current_version.budget_max)}`
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {format(new Date(rfp.updated_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action for Suppliers */}
            {!isAllowed && canCreateResponse && isPublished && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Response</CardTitle>
                  <CardDescription>
                    Submit your proposal for this RFP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/responses/create/${rfpId}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Response
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
