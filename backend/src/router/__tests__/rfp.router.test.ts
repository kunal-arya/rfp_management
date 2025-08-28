import request from 'supertest';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import rfpRouter from '../rfp.router';
import * as rfpService from '../../services/rfp.service';
import { mockUsers, mockRfp } from '../../__tests__/utils';

// Mock the RFP service
jest.mock('../../services/rfp.service');

// Mock the Prisma client for middleware
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('../../index', () => ({
  prisma: mockPrismaClient,
}));

const mockRfpService = rfpService as jest.Mocked<typeof rfpService>;

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/rfp', rfpRouter);
  return app;
};

// Helper to create auth header
const createAuthHeader = (user = mockUsers.buyer) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  return `Bearer ${token}`;
};

describe('RFP Router', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
    // Mock user lookup for auth middleware
    mockPrismaClient.user.findUnique.mockResolvedValue(mockUsers.buyer);
  });

  describe('POST /api/rfp', () => {
    const validRfpData = {
      title: 'Test RFP',
      description: 'Test description',
      requirements: 'Test requirements',
      budget_min: 1000,
      budget_max: 5000,
      deadline: '2024-12-31T23:59:59Z',
      notes: 'Test notes',
    };

    it('should create RFP successfully with authentication', async () => {
      const mockCreatedRfp = { ...mockRfp, title: validRfpData.title };
      mockRfpService.createRfp.mockResolvedValue(mockCreatedRfp as any);

      const response = await request(app)
        .post('/api/rfp')
        .set('Authorization', createAuthHeader())
        .send(validRfpData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'RFP created successfully',
        rfp: mockCreatedRfp,
      });
      expect(mockRfpService.createRfp).toHaveBeenCalledWith(
        validRfpData,
        mockUsers.buyer.id
      );
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/rfp')
        .send(validRfpData)
        .expect(401);

      expect(mockRfpService.createRfp).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Invalid title
      };

      await request(app)
        .post('/api/rfp')
        .set('Authorization', createAuthHeader())
        .send(invalidData)
        .expect(400);

      expect(mockRfpService.createRfp).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/rfp', () => {
    it('should get user RFPs successfully with authentication', async () => {
      const mockData = {
        data: [mockRfp],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      };
      mockRfpService.getMyRfps.mockResolvedValue(mockData as any);

      const response = await request(app)
        .get('/api/rfp')
        .set('Authorization', createAuthHeader())
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(mockRfpService.getMyRfps).toHaveBeenCalledWith(
        mockUsers.buyer.id,
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/rfp')
        .expect(401);

      expect(mockRfpService.getMyRfps).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/rfp/:rfp_id', () => {
    it('should get RFP by ID successfully with authentication', async () => {
      mockRfpService.getRfpById.mockResolvedValue(mockRfp as any);

      const response = await request(app)
        .get('/api/rfp/rfp-1')
        .set('Authorization', createAuthHeader())
        .expect(200);

      expect(response.body).toEqual(mockRfp);
      expect(mockRfpService.getRfpById).toHaveBeenCalledWith(
        'rfp-1',
        mockUsers.buyer.id,
        mockUsers.buyer.role.permissions
      );
    });

    it('should return 404 if RFP not found', async () => {
      mockRfpService.getRfpById.mockResolvedValue(null as any);

      await request(app)
        .get('/api/rfp/rfp-1')
        .set('Authorization', createAuthHeader())
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/rfp/rfp-1')
        .expect(401);

      expect(mockRfpService.getRfpById).not.toHaveBeenCalled();
    });
  });
});
