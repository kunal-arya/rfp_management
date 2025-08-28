import { Request, Response, NextFunction } from 'express';
import { createAuditEntry } from '../services/audit.service';
import { AUDIT_ACTIONS } from '../utils/enum';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Custom error class for better error handling
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error logging function
const logErrorToAudit = async (req: AuthenticatedRequest, error: any, statusCode: number) => {
  try {
    const userId = req.user?.userId || 'anonymous';
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      statusCode,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    };

    // Determine error type for audit action
    let auditAction = AUDIT_ACTIONS.SYSTEM_ERROR;
    
    if (statusCode === 401) {
      auditAction = AUDIT_ACTIONS.AUTHENTICATION_ERROR;
    } else if (statusCode === 403) {
      auditAction = AUDIT_ACTIONS.AUTHORIZATION_ERROR;
    } else if (statusCode === 404) {
      auditAction = AUDIT_ACTIONS.RESOURCE_NOT_FOUND;
    } else if (statusCode === 422) {
      auditAction = AUDIT_ACTIONS.VALIDATION_ERROR;
    } else if (statusCode >= 500) {
      auditAction = AUDIT_ACTIONS.SYSTEM_ERROR;
    } else {
      auditAction = AUDIT_ACTIONS.CLIENT_ERROR;
    }

    await createAuditEntry(
      userId,
      auditAction,
      'API_ENDPOINT',
      `${req.method} ${req.url}`,
      errorDetails
    );
  } catch (auditError) {
    // Don't let audit logging errors break the error handling
    console.error('Failed to log error to audit trail:', auditError);
  }
};

// Main error handling middleware
export const errorHandler = async (
  error: any,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.message) {
    message = error.message;
  }

  // Log error to audit trail
  await logErrorToAudit(req, error, statusCode);


  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Async error wrapper for controllers
export const asyncHandler = (fn: Function) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
