import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuditTrail } from '@/apis/audit';
import { format } from 'date-fns';
import {
  Activity,
  User,
  FileText,
  MessageSquare,
  Upload,
  Trash2,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface AuditTrailListProps {
  auditTrails: AuditTrail[];
  isLoading?: boolean;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'RFP_CREATED':
    case 'RFP_UPDATED':
    case 'RFP_PUBLISHED':
    case 'RFP_STATUS_CHANGED':
      return <FileText className="h-5 w-5 text-blue-600" />;
    case 'RESPONSE_CREATED':
    case 'RESPONSE_UPDATED':
    case 'RESPONSE_SUBMITTED':
    case 'RESPONSE_APPROVED':
    case 'RESPONSE_REJECTED':
      return <MessageSquare className="h-5 w-5 text-purple-600" />;
    case 'DOCUMENT_UPLOADED':
      return <Upload className="h-5 w-5 text-green-600" />;
    case 'DOCUMENT_DELETED':
      return <Trash2 className="h-5 w-5 text-red-600" />;
    case 'USER_LOGIN':
      return <LogIn className="h-5 w-5 text-blue-600" />;
    case 'USER_REGISTERED':
      return <UserPlus className="h-5 w-5 text-emerald-600" />;
    default:
      return <Activity className="h-5 w-5 text-gray-600" />;
  }
};

const formatAction = (action: string) =>
  action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

const formatDetails = (details: Record<string, unknown>) => {
  if (!details) return '';
  const parts: string[] = [];
  if (details.title) parts.push(`"${details.title}"`);
  if (details.file_name) parts.push(`"${details.file_name}"`);
  if (details.rfp_title) parts.push(`for "${details.rfp_title}"`);
  if (details.previous_status && details.new_status) {
    parts.push(`from ${details.previous_status} to ${details.new_status}`);
  }
  return parts.join(' ');
};

const getClickableDetails = (audit: AuditTrail) => {
  const details = audit.details as Record<string, unknown>;
  if (!details) return null;

  // Check if this is an RFP-related action
  if (audit.action.includes('RFP') && details.title) {
    return {
      type: 'rfp',
      title: details.title as string,
      id: audit.target_id
    };
  }

  // Check if this is a response-related action
  if (audit.action.includes('RESPONSE') && details.rfp_title) {
    return {
      type: 'response',
      title: `Response for "${details.rfp_title}"`,
      id: audit.target_id
    };
  }

  return null;
};

export const AuditTrailList: React.FC<AuditTrailListProps> = ({ auditTrails, isLoading }) => {
  const handleItemClick = (clickableItem: { type: string; id: string }) => {
    if (clickableItem.type === 'rfp') {
      window.location.href = `/rfps/${clickableItem.id}`;
    } else if (clickableItem.type === 'response') {
      window.location.href = `/responses/${clickableItem.id}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!auditTrails || auditTrails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 opacity-60" />
        <p className="text-sm">No activity found</p>
      </div>
    );
  }

  return (
    <div className="pr-2 space-y-3 border-t border-gray-200">
      {auditTrails.map((audit) => {
        const clickableItem = getClickableDetails(audit);
        
        return (
          <div
            key={audit.id}
            className={`flex items-start gap-3 p-3 rounded-lg border hover:shadow-sm transition bg-white ${
              clickableItem ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => clickableItem && handleItemClick(clickableItem)}
          >
            <div className="flex-shrink-0 mt-1">
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100">
                {getActionIcon(audit.action)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <Badge className="text-xs mb-1 font-semibold">{formatAction(audit.action)}</Badge>
              </div>
              {audit.user && (
                <p className="text-sm text-start text-gray-800 font-semibold flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {audit.user.email}
                </p>
              )}
              {audit.details && (
                <p className={`text-sm text-start font-medium ${
                  clickableItem ? 'text-blue-600 hover:text-blue-800' : 'text-gray-500'
                }`}>
                  {formatDetails(audit.details)}
                </p>
              )}
              <p className="text-xs text-start text-gray-500 mt-1">
                {format(new Date(audit.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Usage inside Recent Activity card
export const RecentActivityCard = ({ auditData }: { auditData: { data: AuditTrail[] } }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Activity className="h-5 w-5 text-green-600" />
        Recent Activity
      </CardTitle>
      <CardDescription>Your recent system activity</CardDescription>
    </CardHeader>
    <CardContent>
      <AuditTrailList auditTrails={auditData?.data || []} isLoading={false} />
    </CardContent>
  </Card>
);
