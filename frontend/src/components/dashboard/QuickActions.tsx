import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const { permissionHelpers } = useAuth();
  const navigate = useNavigate();

  const buyerActions = [
    {
      title: 'Create RFP',
      description: 'Create a new Request for Proposal',
      icon: Plus,
      action: () => navigate('/rfps/create'),
      permission: permissionHelpers.canCreateRfp,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View My RFPs',
      description: 'Manage your existing RFPs',
      icon: FileText,
      action: () => navigate('/rfps/my'),
      permission: permissionHelpers.canViewRfp,
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  const supplierActions = [
    {
      title: 'Browse RFPs',
      description: 'Find RFPs to respond to',
      icon: Search,
      action: () => navigate('/rfps/browse'),
      permission: permissionHelpers.canViewRfp,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'My Responses',
      description: 'Manage your responses to RFPs',
      icon: MessageSquare,
      action: () => navigate('/responses/my'),
      permission: permissionHelpers.canViewResponse,
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  const actions = permissionHelpers.canCreateRfp ? buyerActions : supplierActions;
  const filteredActions = actions.filter(action => action.permission);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Settings className="h-5 w-5 text-gray-600" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common actions you can perform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white h-auto p-3 sm:p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm sm:text-base">{action.title}</div>
                  <div className="text-xs opacity-90 text-wrap">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
