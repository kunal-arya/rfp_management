import { Request, Response } from 'express';
import { createRfp, getMyRfps, getRfpById } from '../rfp.controller';
import * as rfpService from '../../services/rfp.service';
import { createMockRequest, createMockResponse, mockUsers, mockRfp } from '../../__tests__/utils';

// Extend Request interface for testing
interface TestRequest extends Request {
  user?: any;
}

// Mock the RFP service
jest.mock('../../services/rfp.service');

const mockRfpService = rfpService as jest.Mocked<typeof rfpService>;

describe('RFP Controller', () => {
  let req: Partial<TestRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    req.user = mockUsers.buyer;
    jest.clearAllMocks();
  });

  describe('createRfp', () => {
    const validRfpBody = {
      title: 'Test RFP',
      description: 'Test description',
      requirements: 'Test requirements',
      budget_min: 1000,
      budget_max: 5000,
      deadline: '2024-12-31T23:59:59Z',
      notes: 'Test notes',
    };

    it('should create RFP successfully', async () => {
      req.body = validRfpBody;
      const mockCreatedRfp = { 
        ...mockRfp, 
        title: validRfpBody.title,
        current_version_id: 'version-1',
      };

      mockRfpService.createRfp.mockResolvedValue(mockCreatedRfp as any);

      await createRfp(req as TestRequest, res as Response);

      expect(mockRfpService.createRfp).toHaveBeenCalledWith(
        validRfpBody,
        mockUsers.buyer.id
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'RFP created successfully',
        rfp: mockCreatedRfp,
      });
    });

    it('should return 400 for invalid input', async () => {
      req.body = { title: '' }; // Invalid data

      await createRfp(req as TestRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
      expect(mockRfpService.createRfp).not.toHaveBeenCalled();
    });

    it('should return 500 for service errors', async () => {
      req.body = validRfpBody;
      mockRfpService.createRfp.mockRejectedValue(new Error('Service error'));

      await createRfp(req as TestRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getMyRfps', () => {
    it('should get user RFPs successfully', async () => {
      req.query = { page: '1', limit: '10', search: 'test' };
      const mockData = {
        data: [mockRfp],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockRfpService.getMyRfps.mockResolvedValue(mockData as any);

      await getMyRfps(req as TestRequest, res as Response);

      expect(mockRfpService.getMyRfps).toHaveBeenCalledWith(
        mockUsers.buyer.id,
        expect.any(Object), // rfpFilters
        expect.any(Object), // versionFilters
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle invalid query parameters', async () => {
      req.query = { page: 'invalid' };

      await getMyRfps(req as TestRequest, res as Response);

      expect(mockRfpService.getMyRfps).toHaveBeenCalledWith(
        mockUsers.buyer.id,
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          page: 1, // Should default to 1
          limit: 10, // Should default to 10
        })
      );
    });

    it('should return 500 for service errors', async () => {
      mockRfpService.getMyRfps.mockRejectedValue(new Error('Service error'));

      await getMyRfps(req as TestRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getRfpById', () => {
    it('should get RFP by ID successfully', async () => {
      req.params = { rfp_id: 'rfp-1' };
      mockRfpService.getRfpById.mockResolvedValue(mockRfp as any);

      await getRfpById(req as TestRequest, res as Response);

      expect(mockRfpService.getRfpById).toHaveBeenCalledWith(
        'rfp-1',
        mockUsers.buyer.id,
        mockUsers.buyer.role.permissions
      );
      expect(res.json).toHaveBeenCalledWith(mockRfp);
    });

    it('should return 404 if RFP not found', async () => {
      req.params = { rfp_id: 'rfp-1' };
      mockRfpService.getRfpById.mockResolvedValue(null as any);

      await getRfpById(req as TestRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'RFP not found' });
    });

    it('should return 500 for service errors', async () => {
      req.params = { rfp_id: 'rfp-1' };
      mockRfpService.getRfpById.mockRejectedValue(new Error('Service error'));

      await getRfpById(req as TestRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});
