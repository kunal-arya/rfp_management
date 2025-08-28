import React, { useState } from 'react';
import { Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotification';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useNotifications(page, 10, false);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const pagination = data?.pagination;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatMessage = (message: string, data: any) => {
    let formattedMessage = message;
    
    // Replace placeholders with actual data
    Object.keys(data || {}).forEach(key => {
      const placeholder = `{{${key}}}`;
      formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    
    return formattedMessage;
  };

  const getNotificationIcon = (templateCode: string) => {
    switch (templateCode) {
      case 'RFP_PUBLISHED':
        return '📢';
      case 'RESPONSE_SUBMITTED':
        return '📝';
      case 'RFP_STATUS_CHANGED':
        return '🔄';
      case 'DEADLINE_APPROACHING':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.template_code) {
      case 'RFP_PUBLISHED':
        if (notification.data?.rfp_id) {
          window.location.href = `/rfps/${notification.data.rfp_id}`;
        }
        break;
      case 'RESPONSE_SUBMITTED':
        if (notification.data?.response_id) {
          window.location.href = `/responses/${notification.data.response_id}`;
        }
        break;
      case 'RFP_STATUS_CHANGED':
        if (notification.data?.rfp_id) {
          window.location.href = `/rfps/${notification.data.rfp_id}`;
        }
        break;
    }

    onClose();
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-gray-500">
        Failed to load notifications
      </div>
    );
  }

  return (
    <div className="max-h-96">
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No notifications
        </div>
      ) : (
        <>
          <ScrollArea className="h-64">
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50",
                    !notification.is_read && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.template_code)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.template.title}
                        </h4>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatMessage(notification.template.message, notification.data)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="p-3 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
          
          {notifications.some(n => !n.is_read) && (
            <div className="p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
