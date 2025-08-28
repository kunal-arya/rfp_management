import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as dashboardService from '../services/dashboard.service';

export const getDashboard = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const dashboardData = await dashboardService.getDashboardData(user.userId, user.role);
        res.json(dashboardData);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const stats = await dashboardService.getDashboardStats(user.userId, user.role);
        res.json(stats);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
