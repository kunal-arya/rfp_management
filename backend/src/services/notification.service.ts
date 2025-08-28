import { PrismaClient } from '@prisma/client';
import { RoleName, USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export interface NotificationData {
    template_code: string;
    user_id: string;
    data?: any;
}

export const notificationService = {
    getUserNotifications: async (user: any, page: number = 1, limit: number = 10, unreadOnly: boolean = false) => {
        const offset = (page - 1) * limit;

        const whereClause = {
            ...({ user_id: user.userId }),
            ...(unreadOnly && { is_read: false })
        };

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                include: {
                    template: true,
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: offset,
                take: limit
            }),
            prisma.notification.count({
                where: whereClause
            })
        ]);

        return {
            notifications,
            total,
            page,
            limit
        };
    },

    getUnreadCount: async (userId: string) => {
        return await prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });
    },

    markAsRead: async (notificationId: string, userId: string) => {
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                user_id: userId
            }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                is_read: true
            }
        });
    },

    markAllAsRead: async (userId: string) => {
        await prisma.notification.updateMany({
            where: {
                user_id: userId,
                is_read: false
            },
            data: {
                is_read: true
            }
        });
    },

    createNotification: async (notificationData: NotificationData) => {
        return await prisma.notification.create({
            data: {
                user_id: notificationData.user_id,
                template_code: notificationData.template_code,
                data: notificationData.data || {},
                sent_at: new Date()
            },
            include: {
                template: true,
                user: true
            }
        });
    },

    createNotificationForRole: async (roleName: string, templateCode: string, data?: any, excludeUserId?: string) => {
        // Get all users with the specified role
        const users = await prisma.user.findMany({
            where: {
                role: {
                    name: roleName
                },
                status: { equals: USER_STATUS.Active }
            }
        });

        // Filter out the user who performed the action (if provided)
        const filteredUsers = excludeUserId ? users.filter(user => user.id !== excludeUserId) : users;

        // Create notifications for filtered users in the role
        const notifications = await Promise.all(
            filteredUsers.map(user =>
                prisma.notification.create({
                    data: {
                        user_id: user.id,
                        template_code: templateCode,
                        data: data || {},
                        sent_at: new Date()
                    }
                })
            )
        );

        return notifications;
    },

    createNotificationForUser: async (userId: string, templateCode: string, data?: any, excludeUserId?: string) => {
        // Don't create notification if the target user is the same as the action performer
        if (excludeUserId && userId === excludeUserId) {
            return null;
        }

        return await prisma.notification.create({
            data: {
                user_id: userId,
                template_code: templateCode,
                data: data || {},
                sent_at: new Date()
            },
            include: {
                template: true,
                user: true
            }
        });
    },

    // Generic notification creation with automatic filtering
    createFilteredNotification: async (templateCode: string, data: any, actionPerformerId?: string) => {
        const { recipientRole, recipientUserId, ...notificationData } = data;

        // Create notification for a specific role, excluding the action performer
        if (recipientRole) {
            return await notificationService.createNotificationForRole(recipientRole, templateCode, notificationData, actionPerformerId);
        }

        // Create notification for a specific user, excluding the action performer
        if (recipientUserId) {
            return await notificationService.createNotificationForUser(recipientUserId, templateCode, notificationData, actionPerformerId);
        }

        throw new Error('Either recipientRole or recipientUserId must be provided');
    },

    // Helper method to create notification templates
    createNotificationTemplate: async (code: string, title: string, message: string, channel: string = 'BOTH') => {
        return await prisma.notificationTemplate.upsert({
            where: { code },
            update: {
                title,
                message,
                channel
            },
            create: {
                code,
                title,
                message,
                channel
            }
        });
    },

    // Initialize default notification templates
    initializeDefaultTemplates: async () => {
        const templates = [
            {
                code: 'RFP_PUBLISHED',
                title: 'New RFP Published',
                message: 'A new RFP "{{rfp_title}}" has been published by {{buyer_name}}. Deadline: {{deadline}}',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_SUBMITTED',
                title: 'New Response Received',
                message: 'A new response has been submitted for RFP "{{rfp_title}}" by {{supplier_name}}',
                channel: 'BOTH'
            },
            {
                code: 'RFP_STATUS_CHANGED',
                title: 'RFP Status Updated',
                message: 'The status of RFP "{{rfp_title}}" has been changed to {{new_status}}',
                channel: 'BOTH'
            },
            {
                code: 'DEADLINE_APPROACHING',
                title: 'RFP Deadline Approaching',
                message: 'The deadline for RFP "{{rfp_title}}" is approaching on {{deadline}}',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_MOVED_TO_REVIEW',
                title: 'Response Under Review',
                message: 'Your response to RFP "{{rfp_title}}" has been moved to review status. The buyer is now evaluating your proposal.',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_APPROVED',
                title: 'Response Approved',
                message: 'Congratulations! Your response to RFP "{{rfp_title}}" has been approved by the buyer.',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_REJECTED',
                title: 'Response Rejected',
                message: 'Your response to RFP "{{rfp_title}}" has been rejected. Reason: {{rejection_reason}}',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_AWARDED',
                title: 'Response Awarded',
                message: '🎉 Congratulations! Your response to RFP "{{rfp_title}}" has been awarded! You are the winning supplier.',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_REOPENED',
                title: 'Response Reopened for Editing',
                message: 'Your response to RFP "{{rfp_title}}" has been reopened for editing by the buyer. You can now update your response.',
                channel: 'BOTH'
            },
            {
                code: 'RFP_AWARDED',
                title: 'RFP Awarded',
                message: 'The RFP "{{rfp_title}}" has been awarded to a supplier. Thank you for your participation.',
                channel: 'BOTH'
            },

        ];

        for (const template of templates) {
            await notificationService.createNotificationTemplate(
                template.code,
                template.title,
                template.message,
                template.channel
            );
        }
    }
};
