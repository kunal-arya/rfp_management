import { Router } from 'express';
import { protect, hasPermission } from '../middleware/auth.middleware';
import * as auditController from '../controllers/audit.controller';

const router = Router();

/**
 * @swagger
 * /api/audit/my:
 *   get:
 *     summary: Get user's own audit trails
 *     tags: [Audit]
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
 *     responses:
 *       200:
 *         description: User's audit trails
 *       401:
 *         description: Unauthorized
 */
router.get('/my', protect, hasPermission('audit', 'view'), auditController.getUserAuditTrails);

/**
 * @swagger
 * /api/audit/target/{targetType}/{targetId}:
 *   get:
 *     summary: Get audit trails for a specific target
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of target (RFP, Response, Document, etc.)
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the target
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
 *     responses:
 *       200:
 *         description: Target's audit trails
 *       401:
 *         description: Unauthorized
 */
router.get('/target/:targetType/:targetId', protect, hasPermission('audit', 'view'), auditController.getTargetAuditTrails);

/**
 * @swagger
 * /api/audit/all:
 *   get:
 *     summary: Get all audit trails (admin only)
 *     tags: [Audit]
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
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: target_type
 *         schema:
 *           type: string
 *         description: Filter by target type
 *       - in: query
 *         name: target_id
 *         schema:
 *           type: string
 *         description: Filter by target ID
 *     responses:
 *       200:
 *         description: All audit trails
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/all', protect, hasPermission('audit', 'view'), auditController.getAllAuditTrails);

export default router;
