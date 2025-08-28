import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useDashboard, useDashboardStats } from '@/hooks/useDashboard';
import { useAllAuditTrails } from '@/hooks/useAudit';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Activity,
  Shield,
  Settings
} from 'lucide-react';
import { AuditTrailList } from '@/components/shared/AuditTrailList';

const AdminDashboardPage: React.FC = () => {
  const { isLoading: dashboardLoading, error: dashboardError } = useDashboard();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: auditData, isLoading: auditLoading } = useAllAuditTrails({ limit: 5 });
  const navigate = useNavigate();

  const isLoading = dashboardLoading || statsLoading || auditLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load admin dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Use real data or fallback to mock data
  const statsData = stats || {
    totalUsers: "-",
    totalRfps: "-",
    totalResponses: "-",
    activeUsers: "-",
    newUsersThisMonth: "-",
    newRfpsThisMonth: "-",
    avgResponseTime: "-",
    successRate: "-",
    avgResponsesPerRfp: "-",
    activeUsersGrowth: "-",
    platformHealth: "-"
  };

  // Use audit data for recent activity
  const activityData = auditData?.data || [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{statsData.newUsersThisMonth}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalRfps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{statsData.newRfpsThisMonth}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalResponses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{statsData.avgResponsesPerRfp || '0'}</span> avg per RFP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{statsData.activeUsersGrowth || '0%'}</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statsData.successRate}</div>
            <p className="text-sm text-muted-foreground mt-2">
              RFPs successfully awarded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{statsData.avgResponseTime}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Time to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statsData.platformHealth || '100%'}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Uptime this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-left">
            <Activity className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-left">
            System-wide recent activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {activityData.length > 0 ? (
            <>
              <AuditTrailList 
                auditTrails={activityData || []} 
                isLoading={isLoading} 
              /> 
              <div className="pt-2">
                <Link 
                  to="/admin/audit" 
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Activity →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
                No recent activity
              </div>
            )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Manage Users</p>
            </button>
            <button 
              onClick={() => navigate('/admin/rfps')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">View RFPs</p>
            </button>
            <button 
              onClick={() => navigate('/admin/audit')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Shield className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-sm font-medium">Audit Logs</p>
            </button>
            <button 
              onClick={() => navigate('/admin/settings')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Settings className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium">Settings</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
