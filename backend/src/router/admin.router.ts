import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { hasPermission, protect } from '../middleware/auth.middleware';

const router = Router();

// Response Management Routes
/**
 * @swagger
 * /admin/responses:
 *   get:
 *     summary: Get all responses (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Responses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/responses', protect, hasPermission('admin', 'view_analytics'), adminController.getAdminResponses);

/**
 * @swagger
 * /admin/responses/{id}:
 *   get:
 *     summary: Get response details (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Response ID
 *     responses:
 *       200:
 *         description: Response details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: Response not found
 */
router.get('/responses/:id', protect, hasPermission('admin', 'view_analytics'), adminController.getAdminResponse);

// User Management Routes
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/users', protect, hasPermission('admin', 'manage_users'), adminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get specific user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.get('/users/get/:id', protect, hasPermission('admin', 'manage_users'), adminController.getUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:id', protect, hasPermission('admin', 'manage_users'), adminController.updateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protect, hasPermission('admin', 'manage_users'), adminController.deleteUser);

/**
 * @swagger
 * /admin/users/{id}/toggle-status:
 *   put:
 *     summary: Toggle user status (activate/deactivate)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate]
 *     responses:
 *       200:
 *         description: User status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:id/toggle-status', protect, hasPermission('admin', 'manage_users'), adminController.toggleUserStatus);

/**
 * @swagger
 * /admin/users/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                   description: Total number of users
 *                 userGrowthLastMonth:
 *                   type: string
 *                   description: Percentage change in users from last month
 *                 activeUsers:
 *                   type: number
 *                   description: Number of active users in last week
 *                 activeUserGrowthLastWeek:
 *                   type: string
 *                   description: Percentage change in active users from last week
 *                 totalBuyers:
 *                   type: number
 *                   description: Total number of buyers
 *                 totalSuppliers:
 *                   type: number
 *                   description: Total number of suppliers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/users/stats', protect, hasPermission('admin', 'manage_users'), adminController.getUserStats);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - roleName
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               roleName:
 *                 type: string
 *                 enum: [Buyer, Supplier, Admin]
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: Conflict - user already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/users', protect, hasPermission('admin', 'manage_users'), adminController.createUser);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRfps:
 *                   type: number
 *                   description: Total number of RFPs
 *                 totalResponses:
 *                   type: number
 *                   description: Total number of responses
 *                 newRfpsThisMonth:
 *                   type: number
 *                   description: New RFPs created this month
 *                 newResponsesThisMonth:
 *                   type: number
 *                   description: New responses submitted this month
 *                 monthlyGrowthData:
 *                   type: array
 *                   description: Monthly growth data for the last 6 months
 *                 rfpStatusDistribution:
 *                   type: array
 *                   description: Distribution of RFP statuses
 *                 responseMetrics:
 *                   type: object
 *                   description: Response performance metrics
 *                 systemMetrics:
 *                   type: object
 *                   description: System performance metrics
 *                 topPerformingBuyers:
 *                   type: array
 *                   description: Top performing buyers
 *                 topPerformingSuppliers:
 *                   type: array
 *                   description: Top performing suppliers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/analytics', protect, hasPermission('admin', 'view_analytics'), adminController.getAnalytics);

// Permission Management Routes
/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles with permissions (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/roles', protect, hasPermission('admin', 'manage_roles'), adminController.getAllRoles);

/**
 * @swagger
 * /admin/roles/{roleName}/permissions:
 *   get:
 *     summary: Get permissions for a specific role (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *         description: Role name (Buyer, Supplier, Admin)
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       404:
 *         description: Role not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/roles/:roleName/permissions', protect, hasPermission('admin', 'manage_roles'), adminController.getRolePermissions);

/**
 * @swagger
 * /admin/roles/{roleName}/permissions:
 *   put:
 *     summary: Update permissions for a specific role (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *         description: Role name (Buyer, Supplier, Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: object
 *                 description: Complete permissions object for the role
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
 *       400:
 *         description: Bad request - invalid permissions format
 *       404:
 *         description: Role not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.put('/roles/:roleName/permissions', protect, hasPermission('admin', 'manage_roles'), adminController.updateRolePermissions);

export default router;
