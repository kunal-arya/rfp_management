import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Settings,
  Database,
  Activity,
  Server,
  Wifi,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SupportTicket {
  id: string;
  title: string;
  user: string;
  priority: string;
  status: string;
  category: string;
  createdAt: string;
  lastUpdated: string;
  assignedTo?: string;
}

interface SystemAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  timestamp: string;
  resolved: boolean;
}

const SupportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data - will be replaced with real API calls
  const supportTickets: SupportTicket[] = [
    {
      id: 'TICKET-001',
      title: 'Cannot upload documents larger than 5MB',
      user: 'john.doe@example.com',
      priority: 'High',
      status: 'Open',
      category: 'File Upload',
      createdAt: '2024-01-20T10:30:00Z',
      lastUpdated: '2024-01-20T14:30:00Z',
      assignedTo: 'admin@example.com'
    },
    {
      id: 'TICKET-002',
      title: 'RFP creation form not loading',
      user: 'jane.smith@example.com',
      priority: 'Medium',
      status: 'In Progress',
      category: 'RFP Management',
      createdAt: '2024-01-19T15:20:00Z',
      lastUpdated: '2024-01-20T09:15:00Z',
      assignedTo: 'support@example.com'
    },
    {
      id: 'TICKET-003',
      title: 'Email notifications not being received',
      user: 'supplier@example.com',
      priority: 'Low',
      status: 'Resolved',
      category: 'Notifications',
      createdAt: '2024-01-18T11:45:00Z',
      lastUpdated: '2024-01-19T16:20:00Z'
    },
    {
      id: 'TICKET-004',
      title: 'Dashboard analytics not updating',
      user: 'buyer@example.com',
      priority: 'High',
      status: 'Open',
      category: 'Dashboard',
      createdAt: '2024-01-17T09:30:00Z',
      lastUpdated: '2024-01-20T12:00:00Z'
    },
    {
      id: 'TICKET-005',
      title: 'Login issues with 2FA enabled',
      user: 'admin@example.com',
      priority: 'Critical',
      status: 'In Progress',
      category: 'Authentication',
      createdAt: '2024-01-16T14:15:00Z',
      lastUpdated: '2024-01-20T13:45:00Z',
      assignedTo: 'admin@example.com'
    }
  ];

  const systemAlerts: SystemAlert[] = [
    {
      id: 'ALERT-001',
      type: 'Database',
      message: 'High database connection latency detected',
      severity: 'Warning',
      timestamp: '2024-01-20T16:30:00Z',
      resolved: false
    },
    {
      id: 'ALERT-002',
      type: 'API',
      message: 'API response time exceeded threshold',
      severity: 'Error',
      timestamp: '2024-01-20T15:45:00Z',
      resolved: true
    },
    {
      id: 'ALERT-003',
      type: 'Storage',
      message: 'Storage usage approaching limit (85%)',
      severity: 'Warning',
      timestamp: '2024-01-20T14:20:00Z',
      resolved: false
    },
    {
      id: 'ALERT-004',
      type: 'Security',
      message: 'Multiple failed login attempts detected',
      severity: 'Critical',
      timestamp: '2024-01-20T13:10:00Z',
      resolved: true
    }
  ];

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Error': return 'bg-orange-100 text-orange-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSystemHealthStatus = () => {
    const criticalAlerts = systemAlerts.filter(alert => alert.severity === 'Critical' && !alert.resolved).length;
    const errorAlerts = systemAlerts.filter(alert => alert.severity === 'Error' && !alert.resolved).length;
    
    if (criticalAlerts > 0) return { status: 'Critical', color: 'text-red-600' };
    if (errorAlerts > 0) return { status: 'Warning', color: 'text-yellow-600' };
    return { status: 'Healthy', color: 'text-green-600' };
  };

  const healthStatus = getSystemHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Support & Troubleshooting</h1>
          <p className="text-muted-foreground">Manage support tickets and system monitoring</p>
        </div>
        <Button>
          <HelpCircle className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus.color}`}>
              {healthStatus.status}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportTickets.filter(t => t.status === 'Open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending resolution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemAlerts.filter(a => !a.resolved).length}
            </div>
            <p className="text-xs text-muted-foreground">
              System alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 border rounded-lg ${alert.resolved ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {alert.type === 'Database' && <Database className="h-4 w-4 text-blue-500" />}
                      {alert.type === 'API' && <Server className="h-4 w-4 text-green-500" />}
                      {alert.type === 'Storage' && <Activity className="h-4 w-4 text-purple-500" />}
                      {alert.type === 'Security' && <Shield className="h-4 w-4 text-red-500" />}
                      <span className="font-medium">{alert.type}</span>
                    </div>
                    <Badge className={getSeverityBadgeColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {alert.resolved ? (
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    ) : (
                      <Button variant="outline" size="sm">Resolve</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>System Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Database Connection', status: 'Connected', icon: Database, color: 'text-green-500' },
                { name: 'API Server', status: 'Running', icon: Server, color: 'text-green-500' },
                { name: 'File Storage', status: 'Available', icon: Activity, color: 'text-green-500' },
                { name: 'Email Service', status: 'Connected', icon: MessageSquare, color: 'text-green-500' },
                { name: 'WebSocket', status: 'Active', icon: Wifi, color: 'text-green-500' },
                { name: 'Security Scanner', status: 'Running', icon: Shield, color: 'text-green-500' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <service.icon className={`h-5 w-5 ${service.color}`} />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Support Tickets</CardTitle>
            <div className="flex space-x-2">
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Ticket</th>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned To</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground">{ticket.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{ticket.user}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{ticket.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getPriorityBadgeColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{ticket.assignedTo || 'Unassigned'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Assign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
