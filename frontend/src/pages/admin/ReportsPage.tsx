import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('user-activity');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const reportTypes = [
    { id: 'user-activity', name: 'User Activity Report', icon: Users },
    { id: 'rfp-performance', name: 'RFP Performance Report', icon: FileText },
    { id: 'revenue-analytics', name: 'Revenue Analytics', icon: DollarSign },
    { id: 'system-usage', name: 'System Usage Report', icon: Activity },
    { id: 'audit-trail', name: 'Audit Trail Report', icon: BarChart3 },
    { id: 'response-metrics', name: 'Response Metrics', icon: TrendingUp }
  ];

  const dateRanges = [
    { id: 'last-7-days', name: 'Last 7 Days' },
    { id: 'last-30-days', name: 'Last 30 Days' },
    { id: 'last-90-days', name: 'Last 90 Days' },
    { id: 'last-year', name: 'Last Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const generateReport = () => {
    // TODO: Implement report generation
    console.log('Generating report:', {
      type: reportType,
      dateRange,
      customStartDate,
      customEndDate
    });
  };

  const downloadReport = (format: string) => {
    // TODO: Implement report download
    console.log('Downloading report in', format, 'format');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download system reports</p>
        </div>
        <Button onClick={generateReport}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Report Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      reportType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setReportType(type.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{type.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {dateRanges.map((range) => (
                <div
                  key={range.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    dateRange === range.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDateRange(range.id)}
                >
                  <span className="font-medium">{range.name}</span>
                </div>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sample Report Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1,234</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">567</div>
                <div className="text-sm text-gray-600">Active RFPs</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Sample Chart Placeholder */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization will appear here</p>
              </div>
            </div>

            {/* Download Options */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => downloadReport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => downloadReport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
              <Button variant="outline" onClick={() => downloadReport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: '1',
                name: 'User Activity Report - January 2024',
                type: 'User Activity',
                generatedAt: '2024-01-20T10:30:00Z',
                size: '2.4 MB',
                format: 'PDF'
              },
              {
                id: '2',
                name: 'RFP Performance Report - Q4 2023',
                type: 'RFP Performance',
                generatedAt: '2024-01-15T14:20:00Z',
                size: '1.8 MB',
                format: 'Excel'
              },
              {
                id: '3',
                name: 'Revenue Analytics - December 2023',
                type: 'Revenue Analytics',
                generatedAt: '2024-01-10T09:15:00Z',
                size: '3.2 MB',
                format: 'PDF'
              }
            ].map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">
                      {report.type} • {new Date(report.generatedAt).toLocaleDateString()} • {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: '1',
                name: 'Weekly User Activity Report',
                frequency: 'Weekly',
                nextRun: '2024-01-27T09:00:00Z',
                recipients: 'admin@example.com, manager@example.com'
              },
              {
                id: '2',
                name: 'Monthly Revenue Report',
                frequency: 'Monthly',
                nextRun: '2024-02-01T09:00:00Z',
                recipients: 'finance@example.com'
              }
            ].map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{schedule.name}</div>
                  <div className="text-sm text-gray-500">
                    {schedule.frequency} • Next: {new Date(schedule.nextRun).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Recipients: {schedule.recipients}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Pause</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
