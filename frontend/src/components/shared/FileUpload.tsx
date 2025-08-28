'use client';

import { UploadCloud, File, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, isLoading }) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'image/tiff': ['.tiff'],
      'image/bmp': ['.bmp'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (files.length > 0) {
      onFilesSelect(files);
      setFiles([]); // Clear files after passing them up
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-primary font-semibold">Drop the files here ...</p>
        ) : (
          <p className="text-muted-foreground">
            Drag & drop some files here, or click to select files
            <br />
            <span className="text-xs">(PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG, PNG, GIF, WEBP, SVG, TIFF, BMP)</span>
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Files to upload:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <Button onClick={handleUploadClick} disabled={isLoading}>
              {isLoading ? (
                 <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading...
                </>
              ) : 'Upload Files'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
