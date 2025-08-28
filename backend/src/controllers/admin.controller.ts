import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as adminService from '../services/admin.service';
import * as analyticsService from '../services/analytics.service';

// User Management Controllers
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search, role, status } = req.query;
    
    const result = await adminService.getUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      role: role as string,
      status: status as string,
      user: req.user as any,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await adminService.getUser(id);
    res.json(user);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await adminService.updateUser(id, { name, email, role, updatedBy: req.user?.userId });
    res.json(user);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await adminService.deleteUser(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'activate' or 'deactivate'
    
    const result = await adminService.toggleUserStatus(id, action, req.user?.userId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Failed to toggle user status' });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await adminService.getUserStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Failed to get user stats' });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, roleName } = req.body;

    // Basic validation
    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['Buyer', 'Supplier', 'Admin'].includes(roleName)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

        const user = await adminService.createUser({ name, email, password, roleName, createdBy: req.user?.userId });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === 'Invalid role') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Analytics Controllers
export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analyticsData = await analyticsService.getAnalyticsData();
    res.json(analyticsData);
  } catch (error: any) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({ message: 'Failed to get analytics data' });
  }
};

// Response Management Controllers
export const getAdminResponses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await adminService.getAdminResponses({
      page,
      limit,
      search,
      status
    });

    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get responses' });
  }
};

export const getAdminResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const response = await adminService.getAdminResponse(id);
    res.json(response);
  } catch (error: any) {
    if (error.message === 'Response not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to get response details' });
  }
};

// Permission Management Controllers
export const getRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roleName } = req.params;
    
    const permissions = await adminService.getRolePermissions(roleName);
    res.json(permissions);
  } catch (error: any) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error getting role permissions:', error);
    res.status(500).json({ message: 'Failed to get role permissions' });
  }
};

export const updateRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roleName } = req.params;
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json({ message: 'Permissions data is required' });
    }

    const updatedPermissions = await adminService.updateRolePermissions(roleName, permissions, req.user?.userId);
    res.json(updatedPermissions);
  } catch (error: any) {
    if (error.message === 'Role not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Invalid permissions format') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error updating role permissions:', error);
    res.status(500).json({ message: 'Failed to update role permissions' });
  }
};

export const getAllRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = await adminService.getAllRoles();
    res.json(roles);
  } catch (error: any) {
    console.error('Error getting roles:', error);
    res.status(500).json({ message: 'Failed to get roles' });
  }
};
