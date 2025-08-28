import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponseList } from '@/components/response/ResponseList';
import { useMyResponses } from '@/hooks/useResponse';
import { useDeleteResponse, useSubmitResponse } from '@/hooks/useResponse';
import { Filters } from '@/components/shared/AdvancedFilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { ResponseFilters } from '@/apis/response';

// Extended filters that include the backend-specific filter keys
interface ExtendedResponseFilters extends ResponseFilters {
  response_status?: string;
  'gte___created_at'?: string;
  'lte___created_at'?: string;
  'gte___proposed_budget'?: number;
  'lte___proposed_budget'?: number;
}

export const MyResponsesPage: React.FC = () => {
  const navigate = useNavigate();

  // Use URL-based filters
  const { filters: urlFilters, updateUrlFilters, clearFilters } = useUrlFilters({
    page: 1,
    limit: 15,
  });

  const currentPage = urlFilters.page || 1;
  const pageSize = urlFilters.limit || 15;
  
  // Memoize the initial filters to prevent unnecessary re-renders
  const stableInitialFilters = useMemo(() => urlFilters, [
    urlFilters.search,
    urlFilters.status,
    urlFilters.dateRange?.from?.getTime(),
    urlFilters.dateRange?.to?.getTime(),
    urlFilters.budgetMin,
    urlFilters.budgetMax,
    urlFilters.show_new_rfps,
    urlFilters.page,
    urlFilters.limit,
  ]);
  
  // Convert URL filters to API filters
  const apiFilters: ExtendedResponseFilters = {
    search: urlFilters.search,
    response_status: urlFilters.status, // Send as response_status to match backend expectation
    page: currentPage,
    limit: pageSize,
  };

  // Handle date range filters - backend expects gte___created_at, lte___created_at
  if (urlFilters.dateRange?.from) {
    apiFilters['gte___created_at'] = format(urlFilters.dateRange.from, 'yyyy-MM-dd');
  }
  if (urlFilters.dateRange?.to) {
    apiFilters['lte___created_at'] = format(urlFilters.dateRange.to, 'yyyy-MM-dd');
  }

  // Handle budget filters - backend expects gte___proposed_budget, lte___proposed_budget
  if (urlFilters.budgetMin) {
    apiFilters['gte___proposed_budget'] = urlFilters.budgetMin;
  }
  if (urlFilters.budgetMax) {
    apiFilters['lte___proposed_budget'] = urlFilters.budgetMax;
  }

  const { data: responsesData, isLoading } = useMyResponses(apiFilters);
  const deleteResponseMutation = useDeleteResponse();
  const submitResponseMutation = useSubmitResponse();

  const handleViewResponse = (responseId: string) => {
    navigate(`/responses/${responseId}`);
  };

  const handleEditResponse = (responseId: string) => {
    navigate(`/responses/${responseId}/edit`);
  };

  const handleDeleteResponse = (responseId: string) => {
    if (confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      deleteResponseMutation.mutate(responseId);
    }
  };

  const handleSubmitResponse = (responseId: string) => {
    if (confirm('Are you sure you want to submit this response? You won\'t be able to edit it after submission.')) {
      submitResponseMutation.mutate(responseId);
    }
  };

  const handleCreateResponse = () => {
    navigate('/responses/create');
  };

  const handleNextPage = () => {
    if (responsesData && currentPage < Math.ceil(responsesData.total / pageSize)) {
      updateUrlFilters({ page: currentPage + 1 });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateUrlFilters({ page: currentPage - 1 });
    }
  };

  const responseStatuses = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Awarded', label: 'Awarded' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Responses</h1>
        <p className="text-muted-foreground">
          Manage your responses to RFPs and track their status.
        </p>
      </div>

      <div className="space-y-6">
        <ResponseList
          responses={responsesData?.data || []}
          isLoading={isLoading}
          onViewResponse={handleViewResponse}
          onEditResponse={handleEditResponse}
          onDeleteResponse={handleDeleteResponse}
          onSubmitResponse={handleSubmitResponse}
          onApproveResponse={() => {}} // Not available for suppliers
          onRejectResponse={() => {}} // Not available for suppliers
          onCreateResponse={handleCreateResponse}
          showCreateButton={true}
          showActions={true}
          showBuyerActions={false}
          handleFilterChange={(filters: Filters) => {
            // Reset to page 1 when filters change
            updateUrlFilters({ ...filters, page: 1 });
          }}
          onClearFilters={clearFilters}
          responseStatuses={responseStatuses}
          initialFilters={stableInitialFilters}
        />

        {/* Pagination */}
        {responsesData && responsesData.total > pageSize && (
          <Card>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, responsesData.total)} of {responsesData.total} responses
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
                  {currentPage} / {Math.ceil(responsesData.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(responsesData.total / pageSize)}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
