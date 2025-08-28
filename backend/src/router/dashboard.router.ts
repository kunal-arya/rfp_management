import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect, hasPermission } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes in this router with a valid JWT
router.use(protect);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get role-specific dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data for the user's role
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    dashboardController.getDashboard
);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/stats',
    dashboardController.getDashboardStats
);

export default router;
