import apiClient  from './client';

export interface Notification {
  id: string;
  user_id: string;
  template_code: string;
  data: any;
  is_read: boolean;
  created_at: string;
  sent_at: string | null;
  template: {
    id: string;
    code: string;
    title: string;
    message: string;
    channel: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export const notificationApi = {
  // Get user notifications with pagination
  getNotifications: async (page: number = 1, limit: number = 10, unreadOnly: boolean = false): Promise<NotificationResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: 'true' })
    });

    const response = await apiClient.get<NotificationResponse>(`/notifications?${params}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/count');
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>('/notifications/read-all');
    return response.data;
  }
};
