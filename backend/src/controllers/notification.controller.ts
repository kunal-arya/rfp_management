import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const notificationController = {
    getNotifications: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const unreadOnly = req.query.unreadOnly === 'true';

            const result = await notificationService.getUserNotifications(req.user, page, limit, unreadOnly);

            res.json({
                success: true,
                data: result.notifications,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        } catch (error: any) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get notifications'
            });
        }
    },

    getUnreadCount: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const count = await notificationService.getUnreadCount(userId);

            res.json({
                success: true,
                count
            });
        } catch (error: any) {
            console.error('Error getting unread count:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get unread count'
            });
        }
    },

    markAsRead: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const notificationId = req.params.id;

            await notificationService.markAsRead(notificationId, userId);

            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to mark notification as read'
            });
        }
    },

    markAllAsRead: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;

            await notificationService.markAllAsRead(userId);

            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error: any) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to mark all notifications as read'
            });
        }
    }
};
