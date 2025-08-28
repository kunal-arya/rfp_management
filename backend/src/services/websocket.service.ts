import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export const initializeWebSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            socket.data.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.data.user.userId} connected`);

        // Join user to their role-specific room
        const userRole = socket.data.user.role;
        socket.join(userRole);

        // Join user to their personal room for user-specific notifications
        socket.join(`user_${socket.data.user.userId}`);

        socket.on('disconnect', () => {
            console.log(`User ${socket.data.user.userId} disconnected`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Notification functions
export const notifyRfpPublished = (rfpData: any, excludeBuyerId?: string) => {
    const io = getIO();

    // Send to all suppliers
    io.to('Supplier').emit('rfp_published', {
        type: 'RFP_PUBLISHED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });

    // Send to all admins
    io.to('Admin').emit('rfp_published', {
        type: 'RFP_PUBLISHED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseSubmitted = (responseData: any, buyerId: string) => {
    const io = getIO();
    io.to(`user_${buyerId}`).emit('response_submitted', {
        type: 'RESPONSE_SUBMITTED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
    // Also notify admin users
    io.to('Admin').emit('response_submitted', {
        type: 'RESPONSE_SUBMITTED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyRfpStatusChanged = (rfpData: any, supplierIds: string[]) => {
    const io = getIO();
    supplierIds.forEach(supplierId => {
        io.to(`user_${supplierId}`).emit('rfp_status_changed', {
            type: 'RFP_STATUS_CHANGED',
            data: rfpData,
            timestamp: new Date().toISOString()
        });
    });
    // Also notify admin users
    io.to('Admin').emit('rfp_status_changed', {
        type: 'RFP_STATUS_CHANGED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseMovedToReview = (responseData: any, supplierId: string) => {
    const io = getIO();
    io.to(`user_${supplierId}`).emit('response_moved_to_review', {
        type: 'RESPONSE_MOVED_TO_REVIEW',
        data: responseData,
        timestamp: new Date().toISOString()
    });

    // Also notify admin users
    io.to('Admin').emit('response_moved_to_review', {
        type: 'RESPONSE_MOVED_TO_REVIEW',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseApproved = (responseData: any, supplierId: string) => {
    const io = getIO();
    io.to(`user_${supplierId}`).emit('response_approved', {
        type: 'RESPONSE_APPROVED',
        data: responseData,
        timestamp: new Date().toISOString()
    });

    // Also notify admin users
    io.to('Admin').emit('response_approved', {
        type: 'RESPONSE_APPROVED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseRejected = (responseData: any, supplierId: string) => {
    const io = getIO();
    io.to(`user_${supplierId}`).emit('response_rejected', {
        type: 'RESPONSE_REJECTED',
        data: responseData,
        timestamp: new Date().toISOString()
    });

    // Also notify admin users
    io.to('Admin').emit('response_rejected', {
        type: 'RESPONSE_REJECTED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseAwarded = (responseData: any, supplierId: string) => {
    const io = getIO();
    io.to(`user_${supplierId}`).emit('response_awarded', {
        type: 'RESPONSE_AWARDED',
        data: responseData,
        timestamp: new Date().toISOString()
    });

    // Also notify admin users
    io.to('Admin').emit('response_awarded', {
        type: 'RESPONSE_AWARDED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseReopened = (responseData: any, supplierId: string) => {
    const io = getIO();
    io.to(`user_${supplierId}`).emit('response_reopened', {
        type: 'RESPONSE_REOPENED',
        data: responseData,
        timestamp: new Date().toISOString()
    });

    // Also notify admin users
    io.to('Admin').emit('response_reopened', {
        type: 'RESPONSE_REOPENED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyRfpAwarded = (rfpData: any, supplierIds: string[]) => {
    const io = getIO();
    supplierIds.forEach(supplierId => {
        io.to(`user_${supplierId}`).emit('rfp_awarded', {
            type: 'RFP_AWARDED',
            data: rfpData,
            timestamp: new Date().toISOString()
        });
    });

    // Also notify admin users
    io.to('Admin').emit('rfp_awarded', {
        type: 'RFP_AWARDED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyUser = (userId: string, event: string, data: any) => {
    const io = getIO();
    io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });

    // Also notify admin users
    io.to('Admin').emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });
};

// Additional WebSocket events for real-time dashboard updates
export const notifyRfpCreated = (rfpData: any) => {
    const io = getIO();
    io.to('Admin').emit('rfp_created', {
        type: 'RFP_CREATED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyRfpUpdated = (rfpData: any) => {
    const io = getIO();
    io.to('Buyer').emit('rfp_updated', {
        type: 'RFP_UPDATED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseCreated = (responseData: any) => {
    const io = getIO();
    io.to('Supplier').emit('response_created', {
        type: 'RESPONSE_CREATED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseUpdated = (responseData: any) => {
    const io = getIO();
    io.to('Supplier').emit('response_updated', {
        type: 'RESPONSE_UPDATED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyRfpDeleted = (rfpData: any) => {
    const io = getIO();
    io.to('Buyer').emit('rfp_deleted', {
        type: 'RFP_DELETED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyDocumentUploaded = (documentData: any, userId: string) => {
    const io = getIO();
    io.to(`user_${userId}`).emit('document_uploaded', {
        type: 'DOCUMENT_UPLOADED',
        data: documentData,
        timestamp: new Date().toISOString()
    });
};

export const notifyDocumentDeleted = (documentData: any, userId: string) => {
    const io = getIO();
    io.to(`user_${userId}`).emit('document_deleted', {
        type: 'DOCUMENT_DELETED',
        data: documentData,
        timestamp: new Date().toISOString()
    });
};

// Admin-specific notification functions
export const notifyUserCreated = (userData: any) => {
    const io = getIO();
    io.to('Admin').emit('user_created', {
        type: 'USER_CREATED',
        data: userData,
        timestamp: new Date().toISOString()
    });
};

export const notifyAdmins = (event: string, data: any) => {
    const io = getIO();
    io.to('Admin').emit(event, {
        type: event.toUpperCase(),
        data: data,
        timestamp: new Date().toISOString()
    });
};