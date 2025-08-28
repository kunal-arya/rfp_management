import { Router } from 'express';
import * as rfpController from '../controllers/rfp.controller';
import { protect, hasPermission } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Protect all routes in this router with a valid JWT
router.use(protect);

/**
 * @swagger
 * /rfp/all:
 *   get:
 *     summary: Get all published RFPs
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of published RFPs
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/all',
    hasPermission('rfp', 'view'),
    rfpController.getAllRfps
);

/**
 * @swagger
 * /rfps:
 *   get:
 *     summary: Get user's own RFPs (Buyers) or all RFPs (Admin)
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user's RFPs or all RFPs for admin
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/my',
    hasPermission('rfp', 'view'),
    rfpController.getMyRfps
);

/**
 * @swagger
 * /rfp/get/{id}:
 *   get:
 *     summary: Get specific RFP details
 *     tags: [RFPs]
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
 *         description: RFP details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: RFP not found
 */
router.get(
    '/get/:rfp_id',
    hasPermission('rfp', 'view'),
    rfpController.getRfpById
);

/**
 * @swagger
 * /rfp/{id}:
 *   put:
 *     summary: Update an RFP
 *     tags: [RFPs]
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
 *         description: RFP updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.put(
    '/:rfp_id',
    hasPermission('rfp', 'edit'),
    rfpController.updateRfp
);

/**
 * @swagger
 * /rfp/{id}:
 *   delete:
 *     summary: Delete an RFP
 *     tags: [RFPs]
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
 *         description: RFP deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.delete(
    '/:rfp_id',
    hasPermission('rfp', 'edit'),
    rfpController.deleteRfp
);

/**
 * @swagger
 * /rfps:
 *   post:
 *     summary: Create a new RFP
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               budget_min:
 *                 type: number
 *               budget_max:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: RFP created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/',
    hasPermission('rfp', 'create'),
    rfpController.createRfp
);

/**
 * @swagger
 * /rfp/{id}/publish:
 *   put:
 *     summary: Publish an RFP
 *     tags: [RFPs]
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
 *         description: RFP published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.put(
    '/:rfp_id/publish',
    hasPermission('rfp', 'publish'),
    rfpController.publishRfp
);

/**
 * @swagger
 * /rfp/{id}/close:
 *   put:
 *     summary: Close an RFP
 *     tags: [RFPs]
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
 *         description: RFP closed successfully
 *       400:
 *         description: RFP cannot be closed in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.put(
    '/:rfp_id/close',
    hasPermission('rfp', 'close'),
    rfpController.closeRfp
);

/**
 * @swagger
 * /rfp/{id}/cancel:
 *   put:
 *     summary: Cancel an RFP
 *     tags: [RFPs]
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
 *         description: RFP cancelled successfully
 *       400:
 *         description: RFP cannot be cancelled in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.put(
    '/:rfp_id/cancel',
    hasPermission('rfp', 'cancel'),
    rfpController.cancelRfp
);

/**
 * @swagger
 * /rfp/{id}/award:
 *   put:
 *     summary: Award an RFP to a response
 *     tags: [RFPs]
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
 *               response_id:
 *                 type: string
 *                 description: ID of the response to award
 *     responses:
 *       200:
 *         description: RFP awarded successfully
 *       400:
 *         description: RFP cannot be awarded or response is not approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP or response not found
 */
router.put(
    '/:rfp_id/award',
    hasPermission('rfp', 'award'),
    rfpController.awardRfp
);

/**
 * @swagger
 * /rfp/{rfp_id}/versions:
 *   post:
 *     summary: Create a new version of an RFP
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rfp_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: New RFP version created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.post(
    '/:rfp_id/versions',
    hasPermission('rfp', 'edit'),
    rfpController.createRfpVersion
);

/**
 * @swagger
 * /rfp/{rfp_id}/versions:
 *   get:
 *     summary: Get all versions of an RFP
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rfp_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of RFP versions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.get(
    '/:rfp_id/versions',
    hasPermission('rfp', 'view'),
    rfpController.getRfpVersions
);

/**
 * @swagger
 * /rfp/{rfp_id}/versions/{version_id}/switch:
 *   put:
 *     summary: Switch to a specific version of an RFP
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rfp_id
 *         name: version_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: RFP version switched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP or version not found
 */
router.put(
    '/:rfp_id/versions/:version_id/switch',
    hasPermission('rfp', 'edit'),
    rfpController.switchRfpVersion
);

/**
 * @swagger
 * /rfp/{id}/responses:
 *   post:
 *     summary: Submit a response to an RFP
 *     tags: [RFPs]
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
 *               proposed_budget:
 *                 type: number
 *               timeline:
 *                 type: string
 *               cover_letter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: RFP not found
 */
router.post(
    '/:rfp_id/responses',
    hasPermission('supplier_response', 'create'),
    rfpController.createDraftResponse
);

/**
 * @swagger
 * /rfp/responses/{responseId}/submit:
 *   put:
 *     summary: Submit a draft response
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response submitted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:responseId/submit',
    hasPermission('supplier_response', 'submit'),
    rfpController.submitDraftResponse
);

/**
 * @swagger
 * /rfp/responses/{responseId}/review:
 *   put:
 *     summary: Review a supplier response (Approve/Reject)
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
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
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *     responses:
 *       200:
 *         description: Response reviewed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/review/:rfp_id',
    hasPermission('rfp', 'change_status'),
    rfpController.reviewRfpResponse
);

/**
 * @swagger
 * /rfp/responses/{response_id}/approve:
 *   put:
 *     summary: Approve a response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: response_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response approved successfully
 *       400:
 *         description: Response cannot be approved in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:response_id/approve',
    hasPermission('supplier_response', 'approve'),
    rfpController.approveResponse
);

/**
 * @swagger
 * /rfp/responses/{response_id}/move-to-review:
 *   put:
 *     summary: Move a response to review status
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: response_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response moved to review successfully
 *       400:
 *         description: Response cannot be moved to review in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:response_id/move-to-review',
    hasPermission('supplier_response', 'review'),
    rfpController.moveResponseToReview
);

/**
 * @swagger
 * /rfp/responses/{response_id}/reject:
 *   put:
 *     summary: Reject a response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: response_id
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
 *               rejection_reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Response rejected successfully
 *       400:
 *         description: Response cannot be rejected in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:response_id/reject',
    hasPermission('supplier_response', 'reject'),
    rfpController.rejectResponse
);

/**
 * @swagger
 * /rfp/responses/{response_id}/reopen:
 *   put:
 *     summary: Reopen a rejected response for editing
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: response_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response reopened for editing successfully
 *       400:
 *         description: Only rejected responses can be reopened for editing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:response_id/reopen',
    hasPermission('supplier_response', 'reopen'),
    rfpController.reopenResponseForEdit
);

/**
 * @swagger
 * /rfp/responses/{response_id}/award:
 *   put:
 *     summary: Award a response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: response_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response awarded successfully
 *       400:
 *         description: Response cannot be awarded in current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:response_id/award',
    hasPermission('supplier_response', 'award'),
    rfpController.awardResponse
);

/**
 * @swagger
 * /rfp/{rfp_id}/responses:
 *   get:
 *     summary: Get all responses for a specific RFP
 *     tags: [RFPs]
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
 *         description: A list of responses for the RFP
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.get(
    '/:rfp_id/responses',
    hasPermission('rfp', 'read_responses'),
    rfpController.getNBAResponses
);

/**
 * @swagger
 * /rfp/{id}/documents:
 *   post:
 *     summary: Upload a document for an RFP
 *     tags: [RFPs]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.post(
    '/:rfp_version_id/documents',
    hasPermission('documents', 'upload_for_rfp'),
    upload.single('document'),
    rfpController.uploadRfpDocument
);

/**
 * @swagger
 * /rfp/responses/{responseId}/documents:
 *   post:
 *     summary: Upload a document for a response
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.post(
    '/responses/:responseId/documents',
    hasPermission('documents', 'upload_for_response'),
    upload.single('document'),
    rfpController.uploadResponseDocument
);

/**
 * @swagger
 * /rfp/my-responses:
 *   get:
 *     summary: Get supplier's responses
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of supplier's responses
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/my-responses',
    hasPermission('supplier_response', 'view'),
    rfpController.getMyResponses
);

/**
 * @swagger
 * /rfp/responses/{responseId}:
 *   get:
 *     summary: Get specific response details
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Response not found
 */
router.get(
    '/responses/:responseId',
    hasPermission('supplier_response', 'view'),
    rfpController.getResponseById
);

/**
 * @swagger
 * /rfp/responses/{responseId}:
 *   put:
 *     summary: Update a supplier response
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Response updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
router.put(
    '/responses/:responseId',
    hasPermission('supplier_response', 'edit'),
    rfpController.updateResponse
);

/**
 * @swagger
 * /rfp/documents/{documentId}:
 *   delete:
 *     summary: Delete a document (soft delete)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rfp, response]
 *         description: Type of document (rfp or response)
 *       - in: query
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: RFP version ID or response ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Document not found
 */
router.delete(
    '/documents/:documentId',
    protect,
    rfpController.deleteDocument
);

export default router;
