import React, { useState } from 'react';
import { RfpForm } from '@/components/rfp/RfpForm';
import { FileUpload } from '@/components/shared/FileUpload';
import { useCreateRfp } from '@/hooks/useRfp';
import { useUploadRfpDocument } from '@/hooks/useDocument';
import { CreateRfpData } from '@/apis/rfp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

export const CreateRfpPage: React.FC = () => {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [createdRfpId, setCreatedRfpId] = useState<string | null>(null);
  
  const createRfpMutation = useCreateRfp();
  const uploadDocumentMutation = useUploadRfpDocument();

  const handleRfpSubmit = (data: CreateRfpData) => {
    const payload = {
      ...data,
      deadline: new Date(data.deadline).toISOString()
    };
    
    createRfpMutation.mutate(payload, {
      onSuccess: (createdRfp) => {
        setCreatedRfpId(createdRfp.id);
        toast.success('RFP created successfully!');
        
        // Upload documents if any
        if (pendingFiles.length > 0 && createdRfp.current_version_id) {
          uploadPendingFiles(createdRfp.current_version_id);
        }
      }
    });
  };

  const uploadPendingFiles = async (versionId: string) => {
    for (const file of pendingFiles) {
      try {
        await uploadDocumentMutation.mutateAsync({
          rfpVersionId: versionId,
          file
        });
        toast.success(`Document "${file.name}" uploaded successfully!`);
      } catch (error) {
        console.error('Failed to upload document:', error);
        toast.error(`Failed to upload "${file.name}"`);
      }
    }
    setPendingFiles([]);
  };

  // const handleFilesSelect = (files: File[]) => {
  //   if (createdRfpId) {
  //     // RFP already created, upload immediately
  //     // This shouldn't happen in the current flow, but handle it just in case
  //     toast.info('Please create the RFP first, then upload documents');
  //   } else {
  //     // RFP not created yet, store files for later upload
  //     setPendingFiles(files);
  //     toast.success(`${files.length} file(s) selected for upload after RFP creation`);
  //   }
  // };

  const isLoading = createRfpMutation.isPending || uploadDocumentMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create New RFP</h1>
        <p className="text-muted-foreground">
          Create a new Request for Proposal and upload supporting documents to find the right suppliers for your project.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* RFP Form */}
        <RfpForm
          mode="create"
          onSubmit={handleRfpSubmit}
          isLoading={isLoading}
          error={createRfpMutation.error?.message || null}
        />

        {/* Document Upload Section */}
        {/* <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Supporting Documents
            </CardTitle>
            <CardDescription>
              Upload any supporting documents for this RFP. Documents will be uploaded after the RFP is created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFilesSelect={handleFilesSelect}
              isLoading={uploadDocumentMutation.isPending}
            />
            
            {pendingFiles.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {pendingFiles.length} file(s) ready for upload:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {pendingFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};
