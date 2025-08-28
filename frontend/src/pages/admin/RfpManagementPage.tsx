import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Users,
  Loader2,
  Plus,
  Play,
  Pause,
  Award,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllRfps, useCreateRfp, usePublishRfp, useCloseRfp, useDeleteRfp, useAwardRfp } from '@/hooks/useRfp';
import { useRfpResponses, useCreateResponse } from '@/hooks/useResponse';
import { useUsers } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { RfpForm } from '@/components/rfp/RfpForm';
import { ResponseForm } from '@/components/response/ResponseForm';
import { AdminResponseForm } from '@/components/response/AdminResponseForm';
import { CreateRfpData } from '@/apis/rfp';
import { CreateResponseData } from '@/apis/response';
import { useNavigate } from 'react-router-dom';
import { SupplierResponse } from '@/apis/types';

interface Rfp {
  id: string;
  title: string;
  buyer: {
    id: string;
    email: string;
  };
  status: {
    code: string;
    label: string;
  };
  current_version: {
    budget_min?: number;
    budget_max?: number;
    deadline: string;
    description: string;
  };
  supplier_responses: any[];
  created_at: string;
}

interface RfpStats {
  totalRfps: number;
  publishedRfps: number;
  awardedRfps: number;
  totalResponses: number;
}

const RfpManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitResponseDialogOpen, setIsSubmitResponseDialogOpen] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState<Rfp | null>(null);
  const [selectedResponseId, setSelectedResponseId] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get buyers for create RFP form
  const { data: usersResponse } = useUsers({ role: 'Buyer', limit: 1000 });
  const buyers = usersResponse?.data?.data || [];

  // Get suppliers for submit response form
  const { data: suppliersResponse } = useUsers({ role: 'Supplier', limit: 1000 });
  const suppliers = suppliersResponse?.data?.data || [];

  // Use real API data with stats
  const { data: rfpsData, isLoading, error, refetch } = useAllRfps({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    includeStats: true
  });

  // RFP action hooks
  const createRfpMutation = useCreateRfp();
  const publishRfpMutation = usePublishRfp();
  const closeRfpMutation = useCloseRfp();
  const deleteRfpMutation = useDeleteRfp();
  const awardRfpMutation = useAwardRfp();

  // Response action hooks
  const createResponseMutation = useCreateResponse();

  // Get responses for the selected RFP (all responses to filter out suppliers who already submitted)
  const { data: responses, isLoading: responsesLoading } = useRfpResponses(
    selectedRfp?.id || '',
    {} // Get all responses, not just approved ones
  );

  const rfps = rfpsData?.data || [];
  const total = rfpsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const stats: RfpStats = (rfpsData as any)?.stats || {
    totalRfps: 0,
    publishedRfps: 0,
    awardedRfps: 0,
    totalResponses: 0
  };

  const handleCreateRfp = async (data: CreateRfpData) => {
    try {
      await createRfpMutation.mutateAsync(data);
      toast.success('RFP created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create RFP');
    }
  };

  const handleRfpAction = async (action: string, rfpId: string) => {
    try {
      switch (action) {
        case 'publish':
          await publishRfpMutation.mutateAsync(rfpId);
          toast.success('RFP published successfully');
          break;
        case 'close':
          await closeRfpMutation.mutateAsync(rfpId);
          toast.success('RFP closed successfully');
          break;
        case 'edit':
          // Navigate to edit page
          navigate(`/admin/rfps/${rfpId}/edit`);
          return;
        default:
          toast.error(`Unknown action: ${action}`);
          return;
      }
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} RFP`);
    }
  };

  const handleDeleteRfp = async (rfpId: string) => {
    try {
      await deleteRfpMutation.mutateAsync(rfpId);
      toast.success('RFP deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRfp(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete RFP');
    }
  };

  const handleViewResponses = (rfpId: string) => {
    // Navigate to responses page for this RFP
    navigate(`/admin/responses?rfp_id=${rfpId}`);
  };

  const handleViewDetails = (rfpId: string) => {
    // Navigate to responses page for this RFP
    navigate(`/rfps/${rfpId}`);
  };

  const handleAwardRfp = (rfp: Rfp) => {
    setSelectedRfp(rfp);
    setSelectedResponseId('');
    setIsAwardDialogOpen(true);
  };

  const handleAwardSubmit = async () => {
    if (!selectedRfp || !selectedResponseId) {
      toast.error('Please select a response to award');
      return;
    }

    try {
      await awardRfpMutation.mutateAsync({
        rfpId: selectedRfp.id,
        responseId: selectedResponseId
      });
      toast.success('RFP awarded successfully');
      setIsAwardDialogOpen(false);
      setSelectedRfp(null);
      setSelectedResponseId('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to award RFP');
    }
  };

  const handleSubmitResponse = async (data: CreateResponseData) => {
    if (!selectedRfp) {
      toast.error('No RFP selected');
      return;
    }

    try {
      // Add the RFP ID to the data
      const responseData = {
        ...data,
        rfp_id: selectedRfp.id
      };

      await createResponseMutation.mutateAsync(responseData);
      toast.success('Response submitted successfully');
      setIsSubmitResponseDialogOpen(false);
      setSelectedRfp(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit response');
    }
  };

  const openSubmitResponseDialog = (rfp: Rfp) => {
    setSelectedRfp(rfp);
    setIsSubmitResponseDialogOpen(true);
  };

  const openDeleteDialog = (rfp: Rfp) => {
    setSelectedRfp(rfp);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading RFPs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load RFPs</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Published': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-yellow-100 text-yellow-800';
      case 'Awarded': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Awarded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">RFP Management</h1>
          <p className="text-muted-foreground">Manage and oversee all RFPs in the system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create RFP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New RFP</DialogTitle>
              <DialogDescription>
                Create a new RFP for a specific buyer. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <RfpForm
              mode="create"
              onSubmit={handleCreateRfp}
              isLoading={createRfpMutation.isPending}
              isAdmin={true}
              buyers={buyers}
              hideHeader={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRfps}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedRfps}</div>
            <p className="text-xs text-muted-foreground">
              Active RFPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              Across all RFPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awarded</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.awardedRfps}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search RFPs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Awarded">Awarded</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RFPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>RFPs ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Buyer</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Responses</th>
                  <th className="text-left py-3 px-4 font-medium">Deadline</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfps.map((rfp: Rfp) => (
                  <tr key={rfp.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{rfp.title}</div>
                        <div className="text-sm text-gray-500">
                          Budget: ${rfp.current_version.budget_min || 0} - ${rfp.current_version.budget_max || '∞'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{rfp.buyer.email}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(rfp.status.code)}>
                        {rfp.status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        {rfp.supplier_responses.length}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(rfp.current_version.deadline), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(rfp.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewResponses(rfp.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Responses
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openSubmitResponseDialog(rfp)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Submit Response
                          </DropdownMenuItem>
                          {rfp.status.code === 'Draft' && (
                            <DropdownMenuItem 
                              onClick={() => handleRfpAction('publish', rfp.id)}
                              disabled={publishRfpMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {publishRfpMutation.isPending ? 'Publishing...' : 'Publish'}
                            </DropdownMenuItem>
                          )}
                          {rfp.status.code === 'Published' && (
                            <DropdownMenuItem 
                              onClick={() => handleRfpAction('close', rfp.id)}
                              disabled={closeRfpMutation.isPending}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              {closeRfpMutation.isPending ? 'Closing...' : 'Close'}
                            </DropdownMenuItem>
                          )}
                          {rfp.status.code === 'Closed' && rfp.supplier_responses.length > 0 && (
                            <DropdownMenuItem onClick={() => handleAwardRfp(rfp)}>
                              <Award className="h-4 w-4 mr-2" />
                              Award
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(rfp)}
                            disabled={deleteRfpMutation.isPending}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteRfpMutation.isPending ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Award RFP Dialog */}
      <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Award RFP
            </DialogTitle>
            <DialogDescription>
              Select a response to award this RFP. Only approved responses are shown.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRfp && (
            <div className="space-y-6">
              {/* RFP Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedRfp.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Buyer:</span> {selectedRfp.buyer.email}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge className={`ml-2 ${getStatusBadgeColor(selectedRfp.status.code)}`}>
                        {selectedRfp.status.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> ${selectedRfp.current_version.budget_min || 0} - ${selectedRfp.current_version.budget_max || '∞'}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {format(new Date(selectedRfp.current_version.deadline), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Responses Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Select Response to Award</h3>
                  {responsesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>

                {responses && responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.map((response: SupplierResponse) => (
                      <Card 
                        key={response.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedResponseId === response.id 
                            ? 'ring-2 ring-orange-500 bg-orange-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedResponseId(response.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">{response.supplier.email}</h4>
                                <Badge className={getResponseStatusBadgeColor(response.status.code)}>
                                  {response.status.label}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                {response.proposed_budget && (
                                  <div>
                                    <span className="font-medium">Proposed Budget:</span> ${response.proposed_budget.toLocaleString()}
                                  </div>
                                )}
                                {response.timeline && (
                                  <div>
                                    <span className="font-medium">Timeline:</span> {response.timeline}
                                  </div>
                                )}
                                {response.cover_letter && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Cover Letter:</span>
                                    <p className="mt-1 text-gray-600 line-clamp-2">{response.cover_letter}</p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                Submitted: {format(new Date(response.submitted_at || response.created_at), 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                            {selectedResponseId === response.id && (
                              <CheckCircle className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No approved responses found for this RFP.</p>
                    <p className="text-sm text-gray-400 mt-2">Responses must be approved before they can be awarded.</p>
                  </div>
                )}
              </div>

              {/* Dialog Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAwardDialogOpen(false);
                    setSelectedRfp(null);
                    setSelectedResponseId('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAwardSubmit}
                  disabled={!selectedResponseId || awardRfpMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {awardRfpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Awarding...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Award RFP
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Response Dialog */}
      <Dialog open={isSubmitResponseDialogOpen} onOpenChange={setIsSubmitResponseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Submit Response
            </DialogTitle>
            <DialogDescription>
              Create a response for this RFP. As an admin, you can choose which supplier to create the response for.
            </DialogDescription>
          </DialogHeader>

          {selectedRfp && (
            <div className="space-y-6">
              {/* RFP Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedRfp.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Buyer:</span> {selectedRfp.buyer.email}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${getStatusBadgeColor(selectedRfp.status.code)}`}>
                        {selectedRfp.status.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> ${selectedRfp.current_version.budget_min || 0} - ${selectedRfp.current_version.budget_max || '∞'}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {format(new Date(selectedRfp.current_version.deadline), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Form */}
              <AdminResponseForm
                rfpId={selectedRfp.id}
                hideHeader={true}
                suppliers={suppliers}
                existingResponses={responses || []}
                onSubmit={handleSubmitResponse}
                isLoading={createResponseMutation.isPending}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete RFP
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRfp?.title}"? This action cannot be undone and will permanently remove the RFP and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRfp && handleDeleteRfp(selectedRfp.id)}
              disabled={deleteRfpMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRfpMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete RFP'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RfpManagementPage;
