import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  Mail,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  template: string;
  priority: string;
}

const NotificationManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data - will be replaced with real API calls
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'Email',
      recipient: 'user@example.com',
      subject: 'RFP Published: Website Development',
      status: 'Delivered',
      sentAt: '2024-01-20T10:30:00Z',
      deliveredAt: '2024-01-20T10:30:05Z',
      readAt: '2024-01-20T10:35:00Z',
      template: 'rfp_published',
      priority: 'High'
    },
    {
      id: '2',
      type: 'Push',
      recipient: 'supplier@example.com',
      subject: 'New Response Received',
      status: 'Sent',
      sentAt: '2024-01-20T09:15:00Z',
      template: 'response_received',
      priority: 'Medium'
    },
    {
      id: '3',
      type: 'Email',
      recipient: 'admin@example.com',
      subject: 'System Alert: High Response Rate',
      status: 'Failed',
      sentAt: '2024-01-20T08:45:00Z',
      template: 'system_alert',
      priority: 'High'
    },
    {
      id: '4',
      type: 'In-App',
      recipient: 'buyer@example.com',
      subject: 'RFP Deadline Approaching',
      status: 'Delivered',
      sentAt: '2024-01-20T07:30:00Z',
      deliveredAt: '2024-01-20T07:30:02Z',
      template: 'deadline_reminder',
      priority: 'Medium'
    },
    {
      id: '5',
      type: 'Email',
      recipient: 'supplier@example.com',
      subject: 'Welcome to RFP Platform',
      status: 'Pending',
      sentAt: '2024-01-20T06:00:00Z',
      template: 'welcome_email',
      priority: 'Low'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Push': return <Bell className="h-4 w-4" />;
      case 'In-App': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">Manage and monitor system notifications</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.status === 'Delivered').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.status === 'Failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Delivery failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
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
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="Delivered">Delivered</option>
              <option value="Sent">Sent</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="Email">Email</option>
              <option value="Push">Push</option>
              <option value="In-App">In-App</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium">Subject</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Sent</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(notification.type)}
                        <span className="text-sm">{notification.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{notification.recipient}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{notification.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        Template: {notification.template}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(notification.status)}>
                        {notification.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getPriorityBadgeColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(notification.sentAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.sentAt).toLocaleTimeString()}
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
                            <Mail className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Delete
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

      {/* Template Management */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'RFP Published', id: 'rfp_published', status: 'Active' },
              { name: 'Response Received', id: 'response_received', status: 'Active' },
              { name: 'Welcome Email', id: 'welcome_email', status: 'Active' },
              { name: 'Deadline Reminder', id: 'deadline_reminder', status: 'Active' },
              { name: 'System Alert', id: 'system_alert', status: 'Active' },
              { name: 'Password Reset', id: 'password_reset', status: 'Draft' },
            ].map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <Badge variant={template.status === 'Active' ? 'default' : 'secondary'}>
                    {template.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">ID: {template.id}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Test</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagementPage;
