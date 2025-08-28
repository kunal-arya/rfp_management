import { createRfp, getMyRfps } from '../rfp.service';
import { PrismaClient } from '@prisma/client';
import { mockUsers, mockRfp } from '../../__tests__/utils';

// Mock Prisma Client
const mockPrisma = {
  rFPStatus: {
    findUnique: jest.fn(),
  },
  rFP: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
} as any;

// Mock dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../email.service', () => ({
  sendRfpPublishedNotification: jest.fn(),
  sendResponseSubmittedNotification: jest.fn(),
  sendRfpStatusChangeNotification: jest.fn(),
}));

jest.mock('../websocket.service', () => ({
  notifyRfpPublished: jest.fn(),
  notifyResponseSubmitted: jest.fn(),
  notifyRfpStatusChanged: jest.fn(),
}));

jest.mock('../utils/cloudinary', () => ({
  uploadToCloudinary: jest.fn(),
}));

describe('RFP Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRfp', () => {
    const rfpData = {
      title: 'Test RFP',
      description: 'Test description',
      requirements: 'Test requirements',
      budget_min: 1000,
      budget_max: 5000,
      deadline: '2024-12-31T23:59:59Z',
      notes: 'Test notes',
    };

    it('should create RFP successfully', async () => {
      const mockStatus = { id: 'status-1', code: 'Draft' };
      mockPrisma.rFPStatus.findUnique.mockResolvedValue(mockStatus);
      mockPrisma.rFP.create.mockResolvedValue({
        ...mockRfp,
        title: rfpData.title,
        versions: [
          {
            id: 'version-1',
            version_number: 1,
            description: rfpData.description,
            requirements: rfpData.requirements,
            budget_min: rfpData.budget_min,
            budget_max: rfpData.budget_max,
            deadline: rfpData.deadline,
            notes: rfpData.notes,
          },
        ],
      });

      const result = await createRfp(rfpData, mockUsers.buyer.id);

      expect(mockPrisma.rFPStatus.findUnique).toHaveBeenCalledWith({
        where: { code: 'Draft' },
      });
      expect(mockPrisma.rFP.create).toHaveBeenCalledWith({
        data: {
          title: rfpData.title,
          status_id: mockStatus.id,
          buyer_id: mockUsers.buyer.id,
          versions: {
            create: {
              version_number: 1,
              description: rfpData.description,
              requirements: rfpData.requirements,
              budget_min: rfpData.budget_min,
              budget_max: rfpData.budget_max,
              deadline: rfpData.deadline,
              notes: rfpData.notes,
            },
          },
        },
        include: {
          versions: true,
        },
      });

      expect(result).toHaveProperty('title', rfpData.title);
      expect(result).toHaveProperty('versions');
    });

    it('should throw error if draft status not found', async () => {
      mockPrisma.rFPStatus.findUnique.mockResolvedValue(null);

      await expect(createRfp(rfpData, mockUsers.buyer.id)).rejects.toThrow('Draft status not found');
    });

    it('should handle database errors', async () => {
      mockPrisma.rFPStatus.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(createRfp(rfpData, mockUsers.buyer.id)).rejects.toThrow('Database error');
    });
  });

  describe('getMyRfps', () => {
    it('should retrieve user RFPs successfully', async () => {
      const mockRfps = [mockRfp];
      const mockCount = 1;
      const mockResult = {
        data: mockRfps,
        total: mockCount,
        page: 1,
        limit: 10,
      };

      mockPrisma.rFP.findMany.mockResolvedValue(mockRfps);
      mockPrisma.rFP.count.mockResolvedValue(mockCount);

      // Use proper parameters: userId, rfpFilters, versionFilters, offset, limit, search
      const result = await getMyRfps(mockUsers.buyer.id, {}, {}, 0, 10);

      expect(mockPrisma.rFP.findMany).toHaveBeenCalled();
      expect(mockPrisma.rFP.count).toHaveBeenCalled();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toEqual(mockRfps);
      expect(result.total).toBe(mockCount);
    });

    it('should handle empty results', async () => {
      mockPrisma.rFP.findMany.mockResolvedValue([]);
      mockPrisma.rFP.count.mockResolvedValue(0);

      const result = await getMyRfps(mockUsers.buyer.id, {}, {}, 0, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle database errors', async () => {
      mockPrisma.rFP.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getMyRfps(mockUsers.buyer.id, {}, {}, 0, 10)).rejects.toThrow('Database error');
    });
  });
});
