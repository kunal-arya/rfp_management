import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';
import { EMAIL_TEMPLATES } from './email-templates';
import { RoleName, USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export const sendEmail = async (emailData: EmailData) => {
    try {
        const msg = {
            to: emailData.to,
            from: emailData.from || process.env.FROM_EMAIL || 'noreply@rfp-system.com',
            subject: emailData.subject,
            html: emailData.html,
        };

        if (!process.env.SENDGRID_API_KEY) {
            console.log('Email would be sent (development mode):', msg);
            return { success: true, message: 'Email logged (development mode)' };
        }

        await sgMail.send(msg);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, message: 'Email sending failed' };
    }
};

export const sendRfpPublishedNotification = async (rfpId: string) => {
    try {
        const rfp = await prisma.rFP.findUnique({
            where: { id: rfpId , deleted_at: null   },
            include: {
                current_version: true,
                buyer: true,
            },
        });

        if (!rfp) {
            throw new Error('RFP not found');
        }

        // Get all suppliers
        const suppliers = await prisma.user.findMany({
            where: {
                role: { name: RoleName.Supplier },
                status: { equals: USER_STATUS.Active }
            },
        });

        const emailPromises = suppliers.map(supplier => {
            const emailData: EmailData = {
                to: supplier.email,
                subject: `New RFP Available: ${rfp.title}`,
                html: EMAIL_TEMPLATES.rfpPublished(rfp),
            };
            return sendEmail(emailData);
        });

        await Promise.all(emailPromises);
        return { success: true, message: `Notifications sent to ${suppliers.length} suppliers` };
    } catch (error) {
        console.error('RFP published notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendResponseMovedToReviewNotification = async (responseId: string) => {
    try {
        const response = await prisma.supplierResponse.findUnique({
            where: { id: responseId },
            include: {
                supplier: true,
                rfp: {
                    include: {
                        current_version: true,
                        buyer: true,
                    },
                },
            },
        });

        if (!response) {
            throw new Error('Response not found');
        }

        const emailData: EmailData = {
            to: response.supplier.email,
            subject: `Your Response is Under Review: ${response.rfp.title}`,
            html: EMAIL_TEMPLATES.responseMovedToReview(response),
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('Response moved to review notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendResponseApprovedNotification = async (responseId: string) => {
    try {
        const response = await prisma.supplierResponse.findUnique({
            where: { id: responseId },
            include: {
                supplier: true,
                rfp: {
                    include: {
                        current_version: true,
                        buyer: true,
                    },
                },
            },
        });

        if (!response) {
            throw new Error('Response not found');
        }

        const emailData: EmailData = {
            to: response.supplier.email,
            subject: `Response Approved: ${response.rfp.title}`,
            html: EMAIL_TEMPLATES.responseApproved(response),
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('Response approved notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendResponseRejectedNotification = async (responseId: string, rejectionReason: string) => {
    try {
        const response = await prisma.supplierResponse.findUnique({
            where: { id: responseId },
            include: {
                supplier: true,
                rfp: {
                    include: {
                        current_version: true,
                        buyer: true,
                    },
                },
            },
        });

        if (!response) {
            throw new Error('Response not found');
        }

        const emailData: EmailData = {
            to: response.supplier.email,
            subject: `Response Update: ${response.rfp.title}`,
            html: EMAIL_TEMPLATES.responseRejected(response, rejectionReason),
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('Response rejected notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendResponseAwardedNotification = async (responseId: string) => {
    try {
        const response = await prisma.supplierResponse.findUnique({
            where: { id: responseId },
            include: {
                supplier: true,
                rfp: {
                    include: {
                        current_version: true,
                        buyer: true,
                    },
                },
            },
        });

        if (!response) {
            throw new Error('Response not found');
        }

        const emailData: EmailData = {
            to: response.supplier.email,
            subject: `🎉 RFP Awarded to You: ${response.rfp.title}`,
            html: EMAIL_TEMPLATES.responseAwarded(response),
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('Response awarded notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendResponseSubmittedNotification = async (responseId: string) => {
    try {
        const response = await prisma.supplierResponse.findUnique({
            where: { id: responseId },
            include: {
                supplier: true,
                rfp: {
                    include: {
                        current_version: true,
                        buyer: true,
                    },
                },
            },
        });

        if (!response) {
            throw new Error('Response not found');
        }

        const emailData: EmailData = {
            to: response.rfp.buyer.email,
            subject: `New Response Received: ${response.rfp.title}`,
            html: EMAIL_TEMPLATES.responseSubmitted(response),
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('Response submitted notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendRfpStatusChangeNotification = async (rfpId: string, newStatus: string) => {
    try {
        const rfp = await prisma.rFP.findUnique({
            where: { id: rfpId , deleted_at: null },
            include: {
                current_version: true,
                buyer: true,
                supplier_responses: {
                    include: {
                        supplier: true,
                    },
                },
            },
        });

        if (!rfp) {
            throw new Error('RFP not found');
        }

        // Notify all suppliers who responded to this RFP
        const emailPromises = rfp.supplier_responses.map(response => {
            const emailData: EmailData = {
                to: response.supplier.email,
                subject: `RFP Status Update: ${rfp.title}`,
                html: EMAIL_TEMPLATES.rfpAwarded(rfp),
            };
            return sendEmail(emailData);
        });

        await Promise.all(emailPromises);
        return { success: true, message: `Status update notifications sent to ${rfp.supplier_responses.length} suppliers` };
    } catch (error) {
        console.error('RFP status change notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendUserRegistrationWelcome = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const emailData: EmailData = {
            to: user.email,
            subject: 'Welcome to RFP Pro!',
            html: EMAIL_TEMPLATES.userRegistered(user),
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('User registration welcome email failed:', error);
        return { success: false, message: 'Welcome email failed' };
    }
};
