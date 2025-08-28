import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RFP } from '@/apis/types';
import { FileText, Plus, Calendar, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { AdvancedFilterBar, Filters } from '../shared/AdvancedFilterBar';

interface RfpListProps {
  rfps: RFP[];
  isLoading: boolean;
  onViewRfp: (rfpId: string) => void;
  onEditRfp: (rfpId: string) => void;
  onDeleteRfp: (rfpId: string) => void;
  onPublishRfp: (rfpId: string) => void;
  onCreateRfp: () => void;
  showCreateButton?: boolean;
  showActions?: boolean;
  handleFilterChange?: (filters: Filters) => void;
  onClearFilters?: () => void; // Add clearFilters prop
  rfpStatuses?: { value: string; label: string }[];
  page?: "BrowseRfpsPage" | "MyRfpsPage";
  initialFilters?: Filters;
}

export const RfpList: React.FC<RfpListProps> = ({
  rfps,
  isLoading,
  onViewRfp,
  onEditRfp,
  onDeleteRfp,
  onPublishRfp,
  onCreateRfp,
  showCreateButton = true,
  showActions = true,
  handleFilterChange,
  onClearFilters,
  rfpStatuses,
  page = "MyRfpsPage",
  initialFilters,
}) => {

  const filteredRfps = rfps

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Not specified';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl font-bold">RFPs</h2>
          <AdvancedFilterBar 
            page={page} 
            onFilterChange={handleFilterChange} 
            onClearFilters={onClearFilters}
            statuses={rfpStatuses} 
            initialFilters={initialFilters}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RFPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Under Review">Under Review</option>
          </select> */}
          
          {showCreateButton && (
            <Button onClick={onCreateRfp} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Create RFP
            </Button>
          )}
        </div>
      </div>

      {/* RFP List */}
      {filteredRfps.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No RFPs found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first RFP
            </p>
            {showCreateButton && (
              <Button onClick={onCreateRfp}>
                <Plus className="h-4 w-4 mr-2" />
                Create RFP
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredRfps.map((rfp) => (
            <Card key={rfp.id} className="hover:shadow-md transition-shadow h-fit">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-left sm:text-lg font-semibold line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onViewRfp(rfp.id)}
                      >
                        {rfp.title}
                      </h3>
                    </div>
                    <Badge className={`${getStatusColor(rfp.status.code)} flex-shrink-0`}>
                      {rfp.status.label}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-3 text-sm sm:text-base flex-1">
                    {rfp.current_version?.description}
                  </p>
                  
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Deadline: {formatDate(rfp.current_version?.deadline || '')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Budget: {formatBudget(rfp.current_version?.budget_min, rfp.current_version?.budget_max)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span>{rfp.supplier_responses?.length || 0} responses</span>
                    </div>
                  </div>
                  
                  {showActions && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRfp(rfp.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      
                      {rfp.status.code === 'Draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditRfp(rfp.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPublishRfp(rfp.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <span className="hidden sm:inline">Publish</span>
                          </Button>
                        </>
                      )}
                      
                      {rfp.status.code === 'Draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteRfp(rfp.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
