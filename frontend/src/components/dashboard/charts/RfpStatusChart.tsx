'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RfpStatusChartProps {
  stats: {
    draftRfps?: number;
    publishedRfps?: number;
    closedRfps?: number;
    awardedRfps?: number;
    cancelledRfps?: number;
    pendingResponses?: number; // Representing 'Under Review'
    approvedResponses?: number;
    rejectedResponses?: number;
    awardedResponses?: number;
  };
}

export const RfpStatusChart: React.FC<RfpStatusChartProps> = ({ stats }) => {
  const data = [
    { name: 'Draft', count: stats.draftRfps || 0 },
    { name: 'Published', count: stats.publishedRfps || 0 },
    { name: 'Closed', count: stats.closedRfps || 0 },
    { name: 'Awarded', count: stats.awardedRfps || 0 },
    { name: 'Cancelled', count: stats.cancelledRfps || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">RFP Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="var(--color-primary)" name="Number of RFPs" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
