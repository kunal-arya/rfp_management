import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Search, 
  Download,
  Clock,
  User,
  Activity,
  Loader2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  FileText,
  Users,
  Settings,
  Database,
  Mail
} from 'lucide-react';
import { useAdminAuditTrails, useUsers } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { AUDIT_ACTIONS, getAuditActionDisplayName, getAuditActionCategory } from '@/utils/enums';
import { toast } from 'sonner';
import { generateAuditLogsCsv, downloadCsv } from '@/utils/export';

interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    email: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get all users for the user filter dropdown
  const { data: usersResponse } = useUsers({ limit: 1000 });
  const usersData = usersResponse?.data?.data || [];

  // Export functionality - now handled in frontend

  // Use admin audit trails with filters
  const { data: auditData, isLoading, error } = useAdminAuditTrails({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    ...(actionFilter !== 'all' && { 'eq___action': actionFilter }),
    ...(userFilter !== 'all' && { 'eq___user_id': userFilter }),
    ...(targetTypeFilter !== 'all' && { 'eq___target_type': targetTypeFilter }),
  });

  const auditLogs = auditData?.data || [];
  const total = auditData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Calculate stats from current data
  const totalLogs = total;
  const uniqueUsers = new Set(auditLogs.map((log: AuditLog) => log.user_id)).size;
  const securityEvents = auditLogs.filter((log: AuditLog) =>
    log.action.includes('LOGIN') ||
    log.action.includes('LOGOUT') ||
    log.action.includes('DELETE') ||
    log.action.includes('ERROR')
  ).length;
  const recentActivity = auditLogs.filter((log: AuditLog) => {
    const logTime = new Date(log.created_at);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return logTime > oneHourAgo;
  }).length;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, actionFilter, userFilter, targetTypeFilter]);

  const handleExportLogs = () => {
    try {
      // Generate CSV content from current audit logs data
      const csvContent = generateAuditLogsCsv(auditLogs);
      
      // Create filename with current date
      const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      
      // Download the CSV file
      downloadCsv(csvContent, filename);
      
      toast.success(`Audit logs exported successfully (${auditLogs.length} records)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export audit logs');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load audit logs</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const getActionBadgeColor = (action: string) => {
    const category = getAuditActionCategory(action);
    switch (category) {
      case 'User': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RFP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Response': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Document': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'System': return 'bg-red-100 text-red-800 border-red-200';
      case 'Admin': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    const category = getAuditActionCategory(action);
    switch (category) {
      case 'User': 
        if (action.includes('LOGIN')) return <CheckCircle className="h-4 w-4 text-green-600" />;
        if (action.includes('LOGOUT')) return <XCircle className="h-4 w-4 text-blue-600" />;
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'RFP': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'Response': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'Document': return <Database className="h-4 w-4 text-indigo-600" />;
      case 'System': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Admin': return <Settings className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDetails = (details: Record<string, unknown> | string | null) => {
    if (!details) return null;
    
    try {
      if (typeof details === 'string') {
        return details;
      }
      
      // For error logs, format them nicely
      if (details.stack) {
        return {
          type: 'error',
          message: details.message || 'Error occurred',
          url: details.url,
          method: details.method,
          statusCode: details.statusCode,
          stack: details.stack
        };
      }
      
      // For regular details, return as is
      return details;
    } catch {
      return null;
    }
  };



const renderDetails = (details: Record<string, unknown> | string | null, action: string) => {
    if (!details) return null;
  
    const formattedDetails = formatDetails(details);
    
    // Handle error logs with special formatting
    if (formattedDetails && typeof formattedDetails === 'object' && formattedDetails.type === 'error') {
      return (
        <div className="mt-3 space-y-2">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Error Details</span>
            </div>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Message:</span> {String(formattedDetails.message || '')}</div>
              <div><span className="font-medium">URL:</span> {String(formattedDetails.url || '')}</div>
              <div><span className="font-medium">Method:</span> {String(formattedDetails.method || '')}</div>
              <div><span className="font-medium">Status:</span> {String(formattedDetails.statusCode || '')}</div>
            </div>
            {formattedDetails.stack && (
              <details className="mt-2">
                <summary className="text-sm font-medium text-red-700 cursor-pointer">Stack Trace</summary>
                <pre className="mt-1 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                  {String(formattedDetails.stack)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
  
    // Handle specific action types with custom formatting
    if (formattedDetails && typeof formattedDetails === 'object') {
      // USER LOGIN details
      if (action.includes('LOGIN') && formattedDetails.role && formattedDetails.email) {
        return (
          <div className="mt-3">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Login Success</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Role:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    {String(formattedDetails.role)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Email:</span>
                  <span className="text-green-700 truncate">{String(formattedDetails.email)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
  
      // USER LOGOUT details
      if (action.includes('LOGOUT') && formattedDetails.logout_time) {
        return (
          <div className="mt-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Session Ended</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Logout Time:</span>
                </div>
                <span className="text-blue-700 break-all">
                  {format(new Date(String(formattedDetails.logout_time)), 'MMM dd, yyyy HH:mm:ss')}
                </span>
              </div>
            </div>
          </div>
        );
      }
  
      // RFP related actions
      if (action.includes('RFP')) {
        return (
          <div className="mt-3">
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">RFP Activity</span>
              </div>
              <div className="space-y-3 text-sm">
                {Object.entries(formattedDetails).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-medium capitalize text-purple-700 min-w-0 sm:min-w-[80px] flex-shrink-0">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-purple-600 break-words">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
  
      // Document related actions
      if (action.includes('DOCUMENT')) {
        return (
          <div className="mt-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Document Activity</span>
              </div>
              <div className="space-y-3 text-sm">
                {formattedDetails.filename && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium">File:</span>
                    </div>
                    <span className="text-indigo-700 break-all">{String(formattedDetails.filename)}</span>
                  </div>
                )}
                {formattedDetails.size && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium flex-shrink-0">Size:</span>
                    <span className="text-indigo-700">{String(formattedDetails.size)} bytes</span>
                  </div>
                )}
                {Object.entries(formattedDetails)
                  .filter(([key]) => !['filename', 'size'].includes(key))
                  .map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-medium capitalize text-indigo-700 min-w-0 sm:min-w-[80px] flex-shrink-0">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-indigo-600 break-words">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
  
      // Admin actions
      if (action.includes('ADMIN') || action.includes('USER_CREATE') || action.includes('USER_UPDATE')) {
        return (
          <div className="mt-3">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Admin Action</span>
              </div>
              <div className="space-y-2 text-sm">
                {Object.entries(formattedDetails).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="font-medium capitalize text-amber-700">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-amber-600">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }
  
    // Fallback for any other details - but make it more readable
    return (
      <div className="mt-3">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Additional Details</span>
          </div>
          
          {/* Try to render as key-value pairs if it's an object */}
          {formattedDetails && typeof formattedDetails === 'object' ? (
            <div className="space-y-2">
              {Object.entries(formattedDetails).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <span className="font-medium text-gray-700 capitalize min-w-0 flex-shrink-0">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-gray-600 break-words">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {String(formattedDetails)}
            </div>
          )}
        </div>
      </div>
    );
};  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">System-wide activity monitoring and security logs</p>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Unique users today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents}</div>
            <p className="text-xs text-muted-foreground">
              Authentication & security
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setSearchTerm(e.target.value)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.values(AUDIT_ACTIONS).map((action) => (
                    <SelectItem key={action} value={action}>
                      {getAuditActionDisplayName(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger  className='w-full'>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {usersData?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Type</label>
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="RFP">RFP</SelectItem>
                  <SelectItem value="SupplierResponse">Response</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="API_ENDPOINT">API Endpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({total.toLocaleString()} total logs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log: AuditLog) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <Badge variant="outline" className={getActionBadgeColor(log.action)}>
                          {getAuditActionDisplayName(log.action)}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {log.user?.email || log.user_id}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    
                    {renderDetails(log.details, log.action)}
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-3">
                      {log.target_type && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Target:</span>
                          {log.target_type} {log.target_id && `(${log.target_id})`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="font-medium">User ID:</span>
                        {log.user_id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

export default AuditLogsPage;
