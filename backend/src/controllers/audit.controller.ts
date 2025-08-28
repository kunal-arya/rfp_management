import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { auditService } from '../services/audit.service';
import { modifyGeneralFilterPrisma } from '../utils/filters';

// Get user's own audit trails
export const getUserAuditTrails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const action = req.query.action as string;

    // Extract additional filters (excluding search, action, page, limit)
    const { search: _, action: __, page: ___, limit: ____, ...additionalFilters } = req.query;

    const auditTrails = await auditService.getUserAuditTrails(user.userId, page, limit, search, action, additionalFilters);
    res.json(auditTrails);
  } catch (error: any) {
    console.error('Failed to get user audit trails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get audit trails for a specific target (RFP, Response, etc.)
export const getTargetAuditTrails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const auditTrails = await auditService.getTargetAuditTrails(targetType, targetId, page, limit);
    res.json(auditTrails);
  } catch (error: any) {
    console.error('Failed to get target audit trails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all audit trails (admin only)
export const getAllAuditTrails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let { page: pageNumber, limit: limitNumber, search, ...filters } = req.query;

    const page: number = pageNumber ? parseInt(pageNumber as string) : 1;
    const limit: number = limitNumber ? parseInt(limitNumber as string) : 10;
    const offset = (page - 1) * limit;

    // Process filters using the same pattern as getAllRfps
    const generalFilters = modifyGeneralFilterPrisma(filters);

    const auditTrails = await auditService.getAllAuditTrails(
      page, 
      limit, 
      generalFilters, 
      search as string | undefined
    );
    res.json(auditTrails);
  } catch (error: any) {
    console.error('Failed to get all audit trails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
