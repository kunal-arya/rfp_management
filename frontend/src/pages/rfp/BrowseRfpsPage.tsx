import React, { useRef, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { RfpList } from '@/components/rfp/RfpList';
import { useAllRfps } from '@/hooks/useRfp';
import { Filters } from '@/components/shared/AdvancedFilterBar';
import { RfpFilters } from '@/apis/rfp';
import { ExportActions } from '@/components/shared/ExportActions';
import { PrintView } from '@/components/shared/PrintView';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useAuth } from '@/contexts/AuthContext';

export const BrowseRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
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

  // Handle show_new_rfps filter
  if (urlFilters.show_new_rfps) {
    apiFilters.show_new_rfps = 1;
  }

  // Handle date range filters - backend expects gte___created_at, lte___created_at
  if (urlFilters.dateRange?.from) {
    apiFilters['gte___created_at'] = format(urlFilters.dateRange.from, 'yyyy-MM-dd');
  }
  if (urlFilters.dateRange?.to) {
    apiFilters['lte___created_at'] = format(urlFilters.dateRange.to, 'yyyy-MM-dd');
  }

  // Handle budget filters - backend expects gte___budget_min, lte___budget_max
  if (urlFilters.budgetMin) {
    apiFilters['gte___budget_min'] = urlFilters.budgetMin;
  }
  if (urlFilters.budgetMax) {
    apiFilters['lte___budget_max'] = urlFilters.budgetMax;
  }

  const { data: rfpsData, isLoading } = useAllRfps(apiFilters);
  
  const handleViewRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}`);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Available RFPs',
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

  // Only Published RFPs are available to suppliers
  const rfpStatuses = [
    { value: 'Published', label: 'Published' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Awarded', label: 'Awarded' },
  ];

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }


  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse RFPs</h1>
            <p className="text-muted-foreground">
              Find and respond to Request for Proposals from buyers.
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

      <RfpList
        rfps={rfpsData?.data || []}
        isLoading={isLoading}
        onViewRfp={handleViewRfp}
        onEditRfp={() => {}}
        onDeleteRfp={() => {}}
        onPublishRfp={() => {}}
        onCreateRfp={() => {}}
        showCreateButton={false}
        showActions={false}
        handleFilterChange={(filters: Filters) => {
          // Reset to page 1 when filters change
          updateUrlFilters({ ...filters, page: 1 });
        }}
        rfpStatuses={rfpStatuses}
        page="BrowseRfpsPage"
        initialFilters={stableInitialFilters}
        onClearFilters={clearFilters}
      />

      {/* Pagination */}
      {rfpsData && rfpsData.total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, rfpsData.total)} of {rfpsData.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(rfpsData.total / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(rfpsData.total / pageSize)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <PrintView
        ref={printRef}
        type="rfp-list"
        data={rfpsData?.data || []}
      />
    </div>
  );
};
