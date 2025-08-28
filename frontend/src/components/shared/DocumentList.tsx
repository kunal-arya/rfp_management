import React from 'react';
import { Document } from '@/apis/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, Download, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (documentId: string) => void;
  title?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, title = "Documents" }) => {
  const { permissionHelpers } = useAuth();
  
  const canDelete = permissionHelpers.canManageRfpDocuments;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground">No documents attached.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex gap-2 flex-col md:flex-row items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-3 min-w-0">
                  <File className="h-6 w-6 text-primary shrink-0" />
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block truncate max-w-[250px] font-medium hover:underline"
                  >
                    {doc.file_name}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                  {onDelete && canDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className='text-black'
                      onClick={() => onDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 ml-3 " />
                      Delete
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
