import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats } from '@/apis/types';

interface SupplierResponseChartProps {
  stats: DashboardStats;
}

export const SupplierResponseChart: React.FC<SupplierResponseChartProps> = ({ stats }) => {
  const chartData = [
    {
      name: 'Draft',
      value: stats.draftResponses || 0,
      color: '#6B7280',
    },
    {
      name: 'Submitted',
      value: stats.submittedResponses || 0,
      color: '#3B82F6',
    },
    {
      name: 'Under Review',
      value: stats.underReviewResponses || 0,
      color: '#F59E0B',
    },
    {
      name: 'Approved',
      value: stats.approvedResponses || 0,
      color: '#10B981',
    },
    {
      name: 'Rejected',
      value: stats.rejectedResponses || 0,
      color: '#EF4444',
    },
    {
      name: 'Awarded',
      value: stats.awardedResponses || 0,
      color: '#8B5CF6',
    },
  ].filter(item => item.value > 0); // Only show statuses with responses

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Response Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No responses yet</p>
            <p className="text-sm">Start browsing RFPs to submit your first response</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Response Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [value, 'Responses']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar 
              dataKey="value" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
