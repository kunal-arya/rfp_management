import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as rfpService from '../services/rfp.service';
import { createRfpSchema, getRfpResponsesSchema, submitResponseSchema, reviewResponseSchema } from '../validations/rfp.validation';
import { modifyGeneralFilterPrisma, processStatusFilters } from '../utils/filters';

export const createRfp = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = createRfpSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const rfp = await rfpService.createRfp(validationResult.data, user);
        res.status(201).json(rfp);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const publishRfp = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.publishRfp(rfp_id, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to publish this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const closeRfp = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.closeRfp(rfp_id, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to close this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP cannot be closed in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const cancelRfp = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.cancelRfp(rfp_id, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to cancel this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP cannot be cancelled in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const awardRfp = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id } = req.params;
    const { response_id } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!response_id) {
        return res.status(400).json({ message: 'Response ID is required' });
    }

    try {
        const updatedRfp = await rfpService.awardRfp(rfp_id, response_id, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to award this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP cannot be awarded in current status') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Response is not approved') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllRfps = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let { page: pageNumber, limit: limitNumber, search, show_new_rfps, includeStats, ...filters } = req.query;

        const page: number = pageNumber ? parseInt(pageNumber as string) : 1;
        const limit: number = limitNumber ? parseInt(limitNumber as string) : 10;

        const rfps = await rfpService.getAllRfpsPaginated(
            {
                page,
                limit,
                search: search as string | undefined,
                show_new_rfps,
                includeStats: includeStats === 'true',
                filters,
                user: req.user as any
            }
        );

        res.json(rfps);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyRfps = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let { page: pageNumber, limit: limitNumber, search, ...filters } = req.query;

        const page: number = pageNumber ? parseInt(pageNumber as string) : 1;
        const limit: number = limitNumber ? parseInt(limitNumber as string) : 10;

        const rfps = await rfpService.getMyRfpsPaginated({
            userId: user.userId,
            page,
            limit,
            search: search as string | undefined,
            filters,
            userRole: user.role
        });

        res.json(rfps);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getRfpById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { rfp_id } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const rfp = await rfpService.getRfpById(rfp_id, user.userId);
        res.json(rfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to view this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateRfp = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { rfp_id } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const validationResult = createRfpSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ errors: validationResult.error.issues });
        }

        const updatedRfp = await rfpService.updateRfp(rfp_id, validationResult.data, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to update this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP cannot be updated in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteRfp = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { rfp_id } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await rfpService.deleteRfp(rfp_id, user.userId);
        res.json({ message: 'RFP deleted successfully' });
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to delete this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP cannot be deleted in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDraftResponse = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = submitResponseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await rfpService.createDraftResponse(rfp_id, validationResult.data, user.userId, user.role);
        res.status(201).json(response);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitDraftResponse = async (req: AuthenticatedRequest, res: Response) => {
    const { responseId } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.submitDraftResponse(responseId, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to submit this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response is not in Draft status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export async function getNBAResponses(req: AuthenticatedRequest, res: Response) {
    const validationResult = getRfpResponsesSchema.safeParse(req.params);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { rfp_id } = validationResult.data;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const responses = await rfpService.getNBAResponses(rfp_id, user.userId, user.role);
        return res.json(responses);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to view responses for this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const reviewRfpResponse = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = reviewResponseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { rfp_id } = req.params;
    const { status } = validationResult.data;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.reviewRfpResponse(rfp_id, status, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to review this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.startsWith('Invalid status')) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const approveResponse = async (req: AuthenticatedRequest, res: Response) => {
    const { response_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.approveResponse(response_id, user);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to approve this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response cannot be approved in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const rejectResponse = async (req: AuthenticatedRequest, res: Response) => {
    const { response_id } = req.params;
    const { rejection_reason } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!rejection_reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
    }

    try {
        const updatedResponse = await rfpService.rejectResponse(response_id, rejection_reason, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to reject this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response cannot be rejected in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const reopenResponseForEdit = async (req: AuthenticatedRequest, res: Response) => {
    const { response_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.reopenResponseForEdit(response_id, user);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to reopen this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Only rejected responses can be reopened for editing') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const moveResponseToReview = async (req: AuthenticatedRequest, res: Response) => {
    const { response_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.moveResponseToReview(response_id, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to review this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response cannot be moved to review in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createRfpVersion = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id } = req.params;
    const validationResult = createRfpSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.createRfpVersion(rfp_id, validationResult.data, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to create versions for this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP versions can only be created for Draft RFPs') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getRfpVersions = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const versions = await rfpService.getRfpVersions(rfp_id, user.userId);
        res.json(versions);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to view versions of this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const switchRfpVersion = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_id, version_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.switchRfpVersion(rfp_id, version_id, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to switch versions of this RFP') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'RFP versions can only be switched for Draft RFPs') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Version not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const awardResponse = async (req: AuthenticatedRequest, res: Response) => {
    const { response_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.awardResponse(response_id, user.userId);
        res.json(updatedResponse.updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to award this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response cannot be awarded in current status') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Another response has already been awarded for this RFP') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadRfpDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_version_id } = req.params;
    const user = req.user;
    const file = req.file;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const document = await rfpService.uploadRfpDocument(rfp_version_id, user.userId, file);
        res.status(201).json(document);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to upload documents for this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadResponseDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { responseId } = req.params;
    const user = req.user;
    const file = req.file;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const document = await rfpService.uploadResponseDocument(responseId, user.userId, file);
        res.status(201).json(document);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyResponses = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let { page: pageNumber, limit: limitNumber, search, ...filters } = req.query;

        const page: number = pageNumber ? parseInt(pageNumber as string) : 1;
        const limit: number = limitNumber ? parseInt(limitNumber as string) : 10;

        const responses = await rfpService.getMyResponsesPaginated({
            userId: user.userId,
            page,
            limit,
            search: search as string | undefined,
            filters
        });

        res.json(responses);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getResponseById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { responseId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const response = await rfpService.getResponseById(responseId, user.userId);
        res.json(response);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to view this response') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateResponse = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { responseId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const validationResult = submitResponseSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ errors: validationResult.error.issues });
        }

        const updatedResponse = await rfpService.updateResponse(responseId, validationResult.data, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to update this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response cannot be updated in current status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { documentId } = req.params;
    const { type, parentId } = req.query;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!type || !parentId) {
        return res.status(400).json({ message: 'Type and parentId are required query parameters' });
    }

    if (type !== 'rfp' && type !== 'response') {
        return res.status(400).json({ message: 'Type must be either "rfp" or "response"' });
    }

    try {
        await rfpService.deleteDocument(documentId, type as string, parentId as string, user.userId);
        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        if (error.message === 'Document not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to delete this document') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
