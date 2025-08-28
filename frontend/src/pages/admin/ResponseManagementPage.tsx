import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Search,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminResponses } from '@/hooks/useAdmin';
import { useApproveResponse, useRejectResponse, useAwardResponse, useMoveResponseToReview, useReopenResponseForEdit } from '@/hooks/useResponse';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ResponseManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use admin responses API
  const { data: responsesData, isLoading, error, refetch } = useAdminResponses({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Action hooks
  const approveResponseMutation = useApproveResponse();
  const rejectResponseMutation = useRejectResponse();
  const awardResponseMutation = useAwardResponse();
  const moveToReviewMutation = useMoveResponseToReview();
  const reopenResponseMutation = useReopenResponseForEdit();

  const responses = responsesData?.data?.data || [];
  const total = responsesData?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const stats = responsesData?.data?.stats || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load responses</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
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
          <h1 className="text-2xl font-bold">Response Management</h1>
          <p className="text-muted-foreground">Manage and review all supplier responses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_responses || total}</div>
            <p className="text-xs text-muted-foreground">
              Total responses in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pending_review || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.approved || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
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
                  placeholder="Search responses..."
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
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Responses ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">RFP</th>
                  <th className="text-left py-3 px-4 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Proposed Budget</th>
                  <th className="text-left py-3 px-4 font-medium">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className='text-left'>
                        <div className="font-medium">{response.rfp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Buyer: {response.rfp.buyer.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{response.supplier.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(response.status.code)}>
                        {response.status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">${response.proposed_budget.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(response.updated_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/responses/${response.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          {/* Actions based on status - similar to Response Detail page */}
                          {response.status.code === 'Submitted' && (
                            <DropdownMenuItem
                              className="text-blue-600"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to move this response to review? This will allow you to approve or reject it.')) {
                                  moveToReviewMutation.mutate(response.id, {
                                    onSuccess: () => {
                                      toast.success('Response moved to review successfully');
                                      refetch();
                                    },
                                    onError: () => {
                                      toast.error('Failed to move response to review');
                                    }
                                  });
                                }
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Move to Review
                            </DropdownMenuItem>
                          )}

                          {response.status.code === 'Under Review' && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to approve this response?')) {
                                    approveResponseMutation.mutate(response.id, {
                                      onSuccess: () => {
                                        toast.success('Response approved successfully');
                                        refetch();
                                      },
                                      onError: () => {
                                        toast.error('Failed to approve response');
                                      }
                                    });
                                  }
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Response
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  const reason = prompt('Please provide a rejection reason:');
                                  if (reason && reason.trim()) {
                                    rejectResponseMutation.mutate({
                                      responseId: response.id,
                                      rejectionReason: reason.trim()
                                    }, {
                                      onSuccess: () => {
                                        toast.success('Response rejected successfully');
                                        refetch();
                                      },
                                      onError: () => {
                                        toast.error('Failed to reject response');
                                      }
                                    });
                                  }
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Response
                              </DropdownMenuItem>
                            </>
                          )}

                          {response.status.code === 'Approved' && (
                            <DropdownMenuItem
                              className="text-purple-600"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to award this response? This will award the RFP to this supplier.')) {
                                  awardResponseMutation.mutate(response.id, {
                                    onSuccess: () => {
                                      toast.success('Response awarded successfully');
                                      refetch();
                                    },
                                    onError: () => {
                                      toast.error('Failed to award response');
                                    }
                                  });
                                }
                              }}
                            >
                              <Award className="h-4 w-4 mr-2" />
                              Award Response
                            </DropdownMenuItem>
                          )}

                          {response.status.code === 'Rejected' && (
                            <DropdownMenuItem
                              className="text-orange-600"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to reopen this response for editing? The supplier will be able to modify their response.')) {
                                  reopenResponseMutation.mutate(response.id, {
                                    onSuccess: () => {
                                      toast.success('Response reopened for editing');
                                      refetch();
                                    },
                                    onError: () => {
                                      toast.error('Failed to reopen response');
                                    }
                                  });
                                }
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Reopen for Editing
                            </DropdownMenuItem>
                          )}
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


    </div>
  );
};

export default ResponseManagementPage;
