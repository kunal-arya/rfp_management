import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SupplierResponse } from '@/apis/types';
import { MessageSquare, Plus, DollarSign, Calendar, Eye, Edit, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';
import { AdvancedFilterBar, Filters } from '../shared/AdvancedFilterBar';

interface ResponseListProps {
  responses: SupplierResponse[];
  isLoading: boolean;
  onViewResponse: (responseId: string) => void;
  onEditResponse: (responseId: string) => void;
  onDeleteResponse: (responseId: string) => void;
  onSubmitResponse: (responseId: string) => void;
  onApproveResponse: (responseId: string) => void;
  onRejectResponse: (responseId: string) => void;
  onCreateResponse: () => void;
  showCreateButton?: boolean;
  showActions?: boolean;
  showBuyerActions?: boolean;
  handleFilterChange?: (filters: Filters) => void;
  onClearFilters?: () => void; // Add clearFilters prop
  responseStatuses?: { value: string; label: string }[];
  initialFilters?: Filters;
}

export const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  isLoading,
  onViewResponse,
  onEditResponse,
  onDeleteResponse,
  onSubmitResponse,
  onApproveResponse,
  onRejectResponse,
  onCreateResponse,
  showCreateButton = true,
  showActions = true,
  showBuyerActions = false,
  handleFilterChange,
  onClearFilters,
  responseStatuses = [],
  initialFilters = {},
}) => {
  const filteredResponses = responses;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under review':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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

  const formatBudget = (budget: number) => {
    return `$${budget.toLocaleString()}`;
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
          <h2 className="text-2xl font-bold">Responses</h2>
          {handleFilterChange && responseStatuses.length > 0 && (
            <AdvancedFilterBar 
              page="MyResponsesPage" 
              onFilterChange={handleFilterChange} 
              onClearFilters={onClearFilters}
              statuses={responseStatuses}
              initialFilters={initialFilters}
            />
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {showCreateButton && (
            <Button onClick={onCreateResponse} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Create Response
            </Button>
          )}
        </div>
      </div>

      {/* Response List */}
      {filteredResponses.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No responses found</h3>
            <p className="text-muted-foreground mb-4">
              {showCreateButton ? 'Get started by creating your first response' : 'No responses have been submitted yet'}
            </p>
            {showCreateButton && (
              <Button onClick={onCreateResponse}>
                <Plus className="h-4 w-4 mr-2" />
                Create Response
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredResponses.map((response) => (
            <Card key={response.id} className="hover:shadow-md transition-shadow h-fit">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-left sm:text-lg font-semibold line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onViewResponse(response.id)}
                      >
                        Response to {response.rfp?.title}
                      </h3>
                    </div>
                    <Badge className={`${getStatusColor(response.status.code)} flex-shrink-0`}>
                      {response.status.label}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-3 text-sm sm:text-base flex-1">
                    {response.cover_letter}
                  </p>
                  
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Submitted: {formatDate(response.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>Budget: {formatBudget(response.proposed_budget)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span>By {response.supplier.email}</span>
                    </div>
                  </div>
                  
                  {showActions && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResponse(response.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      
                      {response.status.code === 'Draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditResponse(response.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSubmitResponse(response.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Submit</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteResponse(response.id)}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </>
                      )}
                      
                      {showBuyerActions && response.status.code === 'Submitted' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApproveResponse(response.id)}
                            className="flex-1 sm:flex-none text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRejectResponse(response.id)}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </>
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
