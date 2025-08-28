import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResponseById, useSubmitResponse, useReopenResponseForEdit } from '@/hooks/useResponse';
import { ResponseLifecycleActions } from '@/components/response/ResponseLifecycleActions';
import { EditResponseDialog } from '@/components/response/EditResponseDialog';
import { useDeleteDocument, useUploadResponseDocument } from '@/hooks/useDocument';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentList } from '@/components/shared/DocumentList';
import { FileUpload } from '@/components/shared/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  User, 
  DollarSign, 
  Clock, 
  Upload, 
  ArrowLeft,
  Loader2,
  MessageSquare,
  Calendar,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const ResponseDetailPage: React.FC = () => {
  const { responseId } = useParams<{ responseId: string }>();
  const navigate = useNavigate();
  const { user, permissionHelpers } = useAuth();
  const { data: response, isLoading, isError } = useResponseById(responseId || '');
  const deleteDocumentMutation = useDeleteDocument();
  const uploadDocumentMutation = useUploadResponseDocument();
  const submitResponseMutation = useSubmitResponse();
  const reopenResponseMutation = useReopenResponseForEdit();
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate({
        documentId: docId,
        type: 'response',
        parentId: responseId || '',
      });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!response?.id) {
      toast.error('Cannot upload documents: Response not found');
      return;
    }

    setUploadingDocs(true);
    try {
      for (const file of files) {
        await uploadDocumentMutation.mutateAsync({ 
          responseId: response.id, 
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

  // Permission checks
  const canManageDocuments = permissionHelpers.hasPermission('supplier_response', 'manage_documents');
  const canSubmitResponse = permissionHelpers.hasPermission('supplier_response', 'submit');
  const canEditResponse = permissionHelpers.hasPermission('supplier_response', 'edit');
  const canReopenResponse = permissionHelpers.hasPermission('supplier_response', 'reopen');
  const isAllowed = user?.role === "Admin" || user?.id === response?.supplier?.id;
  const canUploadDocuments = canManageDocuments && isAllowed; // Only supplier can upload documents
  const canDeleteDocuments = canManageDocuments && isAllowed; // Only supplier can delete documents
  const canSubmit = canSubmitResponse && isAllowed && response?.status.code === 'Draft';

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
      case 'submitted': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Response Details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading response details</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Response not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }


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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                Response to {response.rfp.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Badge className={`${getStatusColor(response.status.code)} text-white w-fit`}>
                  {response.status.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted by {response.supplier.email}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 flex-row-reverse">
            {canSubmit && (
              <Button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to submit this response? You won\'t be able to edit it after submission.')) {
                    submitResponseMutation.mutate(response.id);
                  }
                }}
                disabled={submitResponseMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {submitResponseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Response
              </Button>
            )}

            {/* Edit Button - Show for draft responses when user has edit permission */}
            {response.status.code === 'Draft' && canEditResponse && (
              <EditResponseDialog 
                response={response}
              />
            )}

            {/* Open to Edit Button - Show for rejected responses when user has reopen permission */}
            {response.status.code === 'Rejected' && canReopenResponse && (
              <Button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to reopen this response for editing? The supplier will be able to modify their response.')) {
                    reopenResponseMutation.mutate(response.id);
                  }
                }}
                disabled={reopenResponseMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
                size="sm"
              >
                {reopenResponseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Open to Edit
              </Button>
            )}
            
            {/* Lifecycle Actions */}
            <ResponseLifecycleActions 
              response={response}
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
            {response.status.code === 'Rejected' && response.rejection_reason && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                    <p className="text-sm text-red-700 mt-1">{response.rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Response Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Response Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Cover Letter</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {response.cover_letter}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Proposed Budget
                    </h3>
                    <p className="text-muted-foreground">
                      {formatCurrency(response.proposed_budget)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timeline
                    </h3>
                    <p className="text-muted-foreground">
                      {response.timeline || 'Not specified'}
                    </p>
                  </div>
                </div>
                {response.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Additional Notes</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {response.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Supporting Documents
                </CardTitle>
                <CardDescription>
                  Documents provided with this response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentList 
                  documents={response.documents || []}
                  onDelete={canDeleteDocuments ? handleDelete : undefined}
                  title=""
                />
              </CardContent>
            </Card>

            {/* Upload Documents - Only show if supplier owns the response */}
            {canUploadDocuments && response.status.code === 'Draft' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload New Documents
                  </CardTitle>
                  <CardDescription>
                    Add supporting documents to this response
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Response Info */}
            <Card>
              <CardHeader>
                <CardTitle>Response Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Supplier</h4>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {response.supplier?.email}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                  <Badge className={`${getStatusColor(response.status.code)} text-white`}>
                    {response.status.label}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">RFP</h3>
                  <p 
                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/rfps/${response.rfp.id}`)}
                  >
                    {response.rfp?.title}
                  </p>
                  <Badge className={`${getStatusColor(response.rfp.status.code)} text-white`}>
                    {response.rfp.status.label}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(response.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                {response.updated_at !== response.created_at && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(response.updated_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
