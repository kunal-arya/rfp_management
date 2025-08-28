import React, { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { RfpList } from '@/components/rfp/RfpList';
import { useMyRfps, useDeleteRfp, usePublishRfp } from '@/hooks/useRfp';
import { Filters } from '@/components/shared/AdvancedFilterBar';
import { RfpFilters } from '@/apis/rfp';
import { ExportActions } from '@/components/shared/ExportActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUrlFilters } from '@/hooks/useUrlFilters';

export const MyRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

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
  const apiFilters: RfpFilters = {
    search: urlFilters.search,
    status: urlFilters.status,
    page: currentPage,
    limit: pageSize,
  };

  // Handle date range filters - backend expects gte___deadline, lte___deadline
  if (urlFilters.dateRange?.from) {
    apiFilters['gte___deadline'] = format(urlFilters.dateRange.from, 'yyyy-MM-dd');
  }
  if (urlFilters.dateRange?.to) {
    apiFilters['lte___deadline'] = format(urlFilters.dateRange.to, 'yyyy-MM-dd');
  }

  // Handle budget filters - backend expects gte___budget_min, lte___budget_max
  if (urlFilters.budgetMin) {
    apiFilters['gte___budget_min'] = urlFilters.budgetMin;
  }
  if (urlFilters.budgetMax) {
    apiFilters['lte___budget_max'] = urlFilters.budgetMax;
  }

  const { data: rfpsData, isLoading } = useMyRfps(apiFilters);
  const deleteRfpMutation = useDeleteRfp();
  const publishRfpMutation = usePublishRfp();

  const handleViewRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}`);
  };

  const handleEditRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}/edit`);
  };

  const handleDeleteRfp = (rfpId: string) => {
    if (confirm('Are you sure you want to delete this RFP? This action cannot be undone.')) {
      deleteRfpMutation.mutate(rfpId);
    }
  };

  const handlePublishRfp = (rfpId: string) => {
    if (confirm('Are you sure you want to publish this RFP? It will be visible to all suppliers.')) {
      publishRfpMutation.mutate(rfpId);
    }
  };

  const handleCreateRfp = () => {
    navigate('/rfps/create');
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'My RFPs',
  });

  const handleNextPage = () => {
    if (rfpsData && currentPage < Math.ceil(rfpsData.total / pageSize)) {
      updateUrlFilters({ page: currentPage + 1 });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateUrlFilters({ page: currentPage - 1 });
    }
  };

  const rfpStatuses = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Published', label: 'Published' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Awarded', label: 'Awarded' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">My RFPs</h1>
            <p className="text-muted-foreground">
              Manage your Request for Proposals and track responses from suppliers.
            </p>
          </div>
          <div className="flex gap-2">
            <ExportActions
              type="rfp-list"
              data={rfpsData?.data || []}
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6"> 
        <RfpList
          handleFilterChange={(filters: Filters) => {
            // Reset to page 1 when filters change
            updateUrlFilters({ ...filters, page: 1 });
          }}
          rfpStatuses={rfpStatuses}
          rfps={rfpsData?.data || []}
          isLoading={isLoading}
          onViewRfp={handleViewRfp}
          onEditRfp={handleEditRfp}
          onDeleteRfp={handleDeleteRfp}
          onPublishRfp={handlePublishRfp}
          onCreateRfp={handleCreateRfp}
          showCreateButton={true}
          showActions={true}
          page="MyRfpsPage"
          initialFilters={stableInitialFilters}
          onClearFilters={clearFilters}
        />

        {/* Pagination */}
        {rfpsData && rfpsData.total > pageSize && (
          <Card>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, rfpsData.total)} of {rfpsData.total} RFPs
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
                  {currentPage} / {Math.ceil(rfpsData.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(rfpsData.total / pageSize)}
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
