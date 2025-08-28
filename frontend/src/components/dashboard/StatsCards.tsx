import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/apis/types';
import { FileText, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
  role: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, role }) => {
  const navigate = useNavigate();
  const isBuyer = role === 'Buyer';

  const handleCardClick = (destination: string, filters?: Record<string, string>) => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryParams ? `${destination}?${queryParams}` : destination;
    navigate(url);
  };

  const buyerStats = [
    {
      title: 'Total RFPs',
      value: stats.totalRfps || 0,
      description: 'RFPs created',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      destination: '/rfps/my',
    },
    {
      title: 'Published RFPs',
      value: stats.publishedRfps || 0,
      description: 'Active RFPs',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      destination: '/rfps/my',
      filters: { status: 'Published' },
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses || 0,
      description: 'Received responses',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      destination: null,
    },
    {
      title: 'Pending Review',
      value: stats.pendingResponses || 0,
      description: 'Awaiting review',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      destination: null,
    },
  ];

  const supplierStats = [
    {
      title: 'Available RFPs',
      value: stats.availableRfps || 0,
      description: 'Open for responses',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      destination: '/rfps/browse',
    },
    {
      title: 'My Responses',
      value: stats.totalResponses || 0,
      description: 'Submitted responses',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      destination: '/responses/my',
    },
    {
      title: 'Approved',
      value: stats.approvedResponses || 0,
      description: 'Successful responses',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      destination: '/responses/my',
      filters: { status: 'Approved' },
    },
    {
      title: 'Rejected',
      value: stats.rejectedResponses || 0,
      description: 'Unsuccessful responses',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      destination: '/responses/my',
      filters: { status: 'Rejected' },
    },
  ];

  const currentStats = isBuyer ? buyerStats : supplierStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {currentStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
            onClick={() => handleCardClick(stat.destination, stat.filters)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
