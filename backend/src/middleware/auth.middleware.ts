import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RoleName } from '../utils/enum';
import { createAuditEntry } from '../services/audit.service';
import { AUDIT_ACTIONS } from '../utils/enum';

const prisma = new PrismaClient();

// This is a simplified representation of our permissions object for type-checking
interface UserPermissions {
    [resource: string]: {
        [action: string]: {
            allowed: boolean;
            scope?: string;
            [key: string]: any;
        };
    };
}

// Extend the Express Request type to include our user payload
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
        permissions: UserPermissions;
    };
}

// Helper function to handle JWT expiration and session cleanup
const handleJwtExpiration = async (userId: string) => {
    try {
        // Get the user's last audit log entry
        const lastAuditLog = await prisma.auditTrail.findFirst({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            select: { action: true, created_at: true }
        });

        // If no audit log exists or the last action wasn't a logout, add a logout entry
        if (!lastAuditLog || !lastAuditLog.action.includes('LOGOUT')) {
            await createAuditEntry(userId, AUDIT_ACTIONS.USER_LOGOUT, 'User', userId, {
                reason: 'JWT_EXPIRED',
                logout_time: new Date().toISOString(),
                note: 'Automatic logout due to token expiration'
            });
            
            console.log(`Session cleanup: Added logout entry for user ${userId} due to JWT expiration`);
        }
    } catch (error) {
        console.error('Error handling JWT expiration cleanup:', error);
        // Don't throw error as this is cleanup logic
    }
};

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const [, token] = bearer.split(' ');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = user as any;
        next();
    } catch (e: any) {
        console.error('JWT verification error:', e);
        
        // Check if it's a JWT expiration error
        if (e.name === 'TokenExpiredError' && e.message === 'jwt expired') {
            try {
                // Decode the expired token to get user ID (without verification)
                const decoded = jwt.decode(token) as any;
                if (decoded && decoded.userId) {
                    // Handle session cleanup for expired token
                    await handleJwtExpiration(decoded.userId);
                }
            } catch (decodeError) {
                console.error('Error decoding expired token:', decodeError);
            }
            
            return res.status(401).json({ 
                message: 'Token expired', 
                code: 'TOKEN_EXPIRED',
                details: 'Your session has expired. Please log in again.'
            });
        }
        
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export const hasPermission = (resource: string, action: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userPermissions = req.user.permissions;
        const permission = userPermissions[resource]?.[action];

        if (!permission?.allowed) {
            console.log('Forbidden: You do not have permission to perform this action');
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }

        const { rfp_id, responseId, rfp_version_id } = req.params;
        const userId = req.user.userId;
        const isBuyer = req.user.role === RoleName.Buyer;
        const isSupplier = req.user.role === RoleName.Supplier;

        // Ownership and status checks
        try {
            if (permission.scope === 'own') {
                if (resource === 'rfp' && rfp_id && isBuyer) {
                    const rfp = await prisma.rFP.findUnique({ where: { id: rfp_id , deleted_at: null } });
                    if (rfp?.buyer_id !== userId) {
                        return res.status(403).json({ message: 'Forbidden: You do not own this resource' });
                    }
                } else if (resource === 'supplier_response' && responseId) {
                    const response = await prisma.supplierResponse.findUnique({ where: { id: responseId } });
                    if (response?.supplier_id !== userId) {
                        return res.status(403).json({ message: 'Forbidden: You do not own this resource' });
                    }
                } else if (resource === 'documents' && action === 'upload_for_rfp' && rfp_version_id) {
                    const rfpVersion = await prisma.rFPVersion.findUnique({ where: { id: rfp_version_id }, include: { rfp: true } });
                    if (rfpVersion?.rfp.buyer_id !== userId) {
                        return res.status(403).json({ message: 'Forbidden: You do not own this resource' });
                    }
                } else if (resource === 'documents' && action === 'upload_for_response' && responseId) {
                    const response = await prisma.supplierResponse.findUnique({ where: { id: responseId } });
                    if (response?.supplier_id !== userId) {
                        return res.status(403).json({ message: 'Forbidden: You do not own this resource' });
                    }
                }
            } else if (permission.scope === 'published') {
                if (resource === 'rfp' && rfp_id) {
                    const rfp = await prisma.rFP.findUnique({
                        where: { id: rfp_id , deleted_at: null },
                        include: { status: true },
                    });
                    if (rfp?.status.code !== 'Published') {
                        return res.status(403).json({ message: 'Forbidden: You can only view published RFPs' });
                    }
                }
            } else if (permission.scope === 'rfp_owner') {
                if (resource === 'supplier_response' && responseId) {
                    const response = await prisma.supplierResponse.findUnique({
                        where: { id: responseId },
                        include: { rfp: true },
                    });
                    if (response?.rfp.buyer_id !== userId) {
                        return res.status(403).json({ message: 'Forbidden: You are not the owner of the RFP' });
                    }
                }
            }

            if (permission.allowed_rfp_statuses && rfp_id) {
                const rfp = await prisma.rFP.findUnique({ where: { id: rfp_id , deleted_at: null }, include: { status: true } });
                if (!rfp || !permission.allowed_rfp_statuses.includes(rfp.status.code)) {
                    return res.status(403).json({ message: `Forbidden: Action only allowed for RFPs with status: ${permission.allowed_rfp_statuses.join(', ')}` });
                }
            }

            if (permission.allowed_response_statuses && responseId) {
                const response = await prisma.supplierResponse.findUnique({ where: { id: responseId }, include: { status: true } });
                if (!response || !permission.allowed_response_statuses.includes(response.status.code)) {
                    return res.status(403).json({ message: `Forbidden: Action only allowed for responses with status: ${permission.allowed_response_statuses.join(', ')}` });
                }
            }

        if (permission.allowed_transitions) {
                const { status: newStatus } = req.body;
                if (!newStatus) {
                    return res.status(400).json({ message: 'Bad Request: Missing status in request body' });
                }

                if (resource === 'rfp' && rfp_id) {
                    const rfp = await prisma.rFP.findUnique({
                        where: { id: rfp_id , deleted_at: null },
                        include: { status: true },
                    });
                    if (!rfp) {
                        return res.status(404).json({ message: 'RFP not found' });
                    }
                    const currentStatus = rfp.status.code;
                    const allowedNextStatuses = permission.allowed_transitions[currentStatus];
                    if (!allowedNextStatuses || !allowedNextStatuses.includes(newStatus)) {
                        return res.status(403).json({ message: `Forbidden: Transition from ${currentStatus} to ${newStatus} is not allowed` });
                    }
                }
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error during permission check' });
        }

        next();
    };
};
