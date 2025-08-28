import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Download,
  Trash2,
  Eye,
  HardDrive,
  Upload,
  Folder,
  File,
  Image,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  associatedWith: string;
  status: string;
  accessCount: number;
  lastAccessed: string;
}

const DocumentManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - will be replaced with real API calls
  const documents: Document[] = [
    {
      id: '1',
      name: 'project-requirements.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'john.doe@example.com',
      uploadedAt: '2024-01-20T10:30:00Z',
      associatedWith: 'RFP-001',
      status: 'Active',
      accessCount: 15,
      lastAccessed: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'technical-specs.docx',
      type: 'DOCX',
      size: '1.8 MB',
      uploadedBy: 'jane.smith@example.com',
      uploadedAt: '2024-01-19T15:20:00Z',
      associatedWith: 'RFP-002',
      status: 'Active',
      accessCount: 8,
      lastAccessed: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      name: 'company-logo.png',
      type: 'PNG',
      size: '450 KB',
      uploadedBy: 'admin@example.com',
      uploadedAt: '2024-01-18T11:45:00Z',
      associatedWith: 'System',
      status: 'Active',
      accessCount: 45,
      lastAccessed: '2024-01-20T16:20:00Z'
    },
    {
      id: '4',
      name: 'response-template.zip',
      type: 'ZIP',
      size: '5.2 MB',
      uploadedBy: 'supplier@example.com',
      uploadedAt: '2024-01-17T09:30:00Z',
      associatedWith: 'Response-001',
      status: 'Archived',
      accessCount: 3,
      lastAccessed: '2024-01-19T12:00:00Z'
    },
    {
      id: '5',
      name: 'contract-draft.pdf',
      type: 'PDF',
      size: '3.1 MB',
      uploadedBy: 'legal@example.com',
      uploadedAt: '2024-01-16T14:15:00Z',
      associatedWith: 'Contract-001',
      status: 'Active',
      accessCount: 12,
      lastAccessed: '2024-01-20T13:45:00Z'
    }
  ];

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.associatedWith.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || document.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-4 w-4 text-red-500" />;
      case 'DOCX': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'PNG': return <Image className="h-4 w-4 text-green-500" />;
      case 'JPG': return <Image className="h-4 w-4 text-green-500" />;
      case 'ZIP': return <Archive className="h-4 w-4 text-purple-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      case 'Deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeStats = () => {
    const stats = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const getTotalStorageUsed = () => {
    return documents.reduce((total, doc) => {
      const sizeInMB = parseFloat(doc.size.replace(' MB', '').replace(' KB', '/1000'));
      return total + sizeInMB;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Manage and monitor system documents</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalStorageUsed().toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              of 1 GB total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently accessible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((sum, d) => sum + d.accessCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Document accesses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>File Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(getFileTypeStats()).map(([type, count]) => (
              <div key={type} className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  {getTypeIcon(type)}
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{type} files</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="PNG">PNG</option>
              <option value="JPG">JPG</option>
              <option value="ZIP">ZIP</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Document</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-left py-3 px-4 font-medium">Uploaded By</th>
                  <th className="text-left py-3 px-4 font-medium">Associated With</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Accesses</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(document.type)}
                        <div>
                          <div className="font-medium">{document.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{document.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{document.size}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{document.uploadedBy}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{document.associatedWith}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(document.status)}>
                        {document.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{document.accessCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Last: {new Date(document.lastAccessed).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Storage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-muted-foreground">
                {getTotalStorageUsed().toFixed(1)} MB / 1 GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(getTotalStorageUsed() / 1024) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {documents.filter(d => d.type === 'PDF').length}
                </div>
                <div className="text-sm text-muted-foreground">PDF Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.type === 'PNG' || d.type === 'JPG').length}
                </div>
                <div className="text-sm text-muted-foreground">Image Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {documents.filter(d => d.type === 'DOCX').length}
                </div>
                <div className="text-sm text-muted-foreground">Document Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {documents.filter(d => d.type === 'ZIP').length}
                </div>
                <div className="text-sm text-muted-foreground">Archive Files</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagementPage;
