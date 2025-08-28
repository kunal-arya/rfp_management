import React, { useMemo } from 'react';
import { useMyAuditTrails } from '@/hooks/useAudit';
import { AuditTrailList } from '@/components/shared/AuditTrailList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { AuditFilters } from '@/apis/audit';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { AdvancedFilterBar, Filters } from '@/components/shared/AdvancedFilterBar';

export const AuditTrailPage: React.FC = () => {
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
    urlFilters.action,
    urlFilters.dateRange?.from?.getTime(),
    urlFilters.dateRange?.to?.getTime(),
    urlFilters.budgetMin,
    urlFilters.budgetMax,
    urlFilters.show_new_rfps,
    urlFilters.page,
    urlFilters.limit,
  ]);

  // Convert URL filters to API filters
  const apiFilters: AuditFilters = {
    search: urlFilters.search,
    action: urlFilters.action,
    page: currentPage,
    limit: pageSize,
  };

  // Handle date range filters - backend expects gte___created_at, lte___created_at
  if (urlFilters.dateRange?.from) {
    apiFilters['gte___created_at'] = urlFilters.dateRange.from.toISOString();
  }
  if (urlFilters.dateRange?.to) {
    apiFilters['lte___created_at'] = urlFilters.dateRange.to.toISOString();
  }

  const { data: myAuditTrails, isLoading } = useMyAuditTrails(apiFilters);

  const handleNextPage = () => {
    if (myAuditTrails && currentPage < Math.ceil(myAuditTrails.total / pageSize)) {
      updateUrlFilters({ page: currentPage + 1 });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateUrlFilters({ page: currentPage - 1 });
    }
  };

  const auditActions = [
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'USER_REGISTERED', label: 'User Registered' },
    { value: 'RFP_CREATED', label: 'RFP Created' },
    { value: 'RFP_UPDATED', label: 'RFP Updated' },
    { value: 'RFP_PUBLISHED', label: 'RFP Published' },
    { value: 'RESPONSE_SUBMITTED', label: 'Response Submitted' },
    { value: 'RESPONSE_APPROVED', label: 'Response Approved' },
    { value: 'RESPONSE_REJECTED', label: 'Response Rejected' },
    { value: 'DOCUMENT_UPLOADED', label: 'Document Uploaded' },
    { value: 'DOCUMENT_DELETED', label: 'Document Deleted' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Activity History</h1>
            <p className="text-muted-foreground">
              Track your system activity and view detailed audit logs of all your actions.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <AdvancedFilterBar
          onFilterChange={(filters: Filters) => {
            // Reset to page 1 when filters change
            updateUrlFilters({ ...filters, page: 1 });
          }}
          onClearFilters={clearFilters}
          statuses={auditActions}
          initialFilters={stableInitialFilters}
          page="AuditPage"
        />
      </div>

      {/* Audit Trail List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-left">
            <Activity className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-left">
            Your recent system activity and audit trail entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditTrailList 
            auditTrails={myAuditTrails?.data || []} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {myAuditTrails && myAuditTrails.total > pageSize && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, myAuditTrails.total)} of {myAuditTrails.total} entries
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
                {currentPage} / {Math.ceil(myAuditTrails.total / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= Math.ceil(myAuditTrails.total / pageSize)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


