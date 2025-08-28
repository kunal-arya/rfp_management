import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, hasPermission } from '../auth.middleware';
import { createMockRequest, createMockResponse, createMockNext, mockUsers } from '../../__tests__/utils';

// Extend Request interface for testing
interface TestRequest extends Request {
  user?: any;
}

// Mock the Prisma client
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('../../index', () => ({
  prisma: mockPrismaClient,
}));

describe('Auth Middleware', () => {
  let req: Partial<TestRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no authorization header', async () => {
      req.headers = {};

      await protect(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      req.headers = { authorization: 'InvalidToken' };

      await protect(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers = { authorization: 'Bearer invalidtoken' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      const token = 'validtoken';
      req.headers = { authorization: `Bearer ${token}` };
      
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'nonexistent' });
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await protect(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set user and call next if token is valid', async () => {
      const token = 'validtoken';
      req.headers = { authorization: `Bearer ${token}` };
      
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUsers.buyer);

      await protect(req as TestRequest, res as Response, next);

      expect(req.user).toEqual(mockUsers.buyer);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const token = 'validtoken';
      req.headers = { authorization: `Bearer ${token}` };
      
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1' });
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database error'));

      await protect(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('hasPermission middleware', () => {
    beforeEach(() => {
      req.user = mockUsers.buyer;
    });

    it('should call next if user has permission', () => {
      const middleware = hasPermission('rfp', 'create');
      
      middleware(req as TestRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have permission', () => {
      const middleware = hasPermission('rfp', 'publish');
      req.user = mockUsers.supplier; // Supplier doesn't have publish permission

      middleware(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied: insufficient permissions' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not authenticated', () => {
      const middleware = hasPermission('rfp', 'create');
      req.user = undefined;

      middleware(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied: insufficient permissions' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if resource does not exist in permissions', () => {
      const middleware = hasPermission('nonexistent', 'action');

      middleware(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied: insufficient permissions' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if action does not exist in permissions', () => {
      const middleware = hasPermission('rfp', 'nonexistent');

      middleware(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied: insufficient permissions' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle permissions with allowed: false', () => {
      // Mock a user with explicitly denied permissions
      const userWithDeniedPermission = {
        ...mockUsers.buyer,
        role: {
          ...mockUsers.buyer.role,
          permissions: {
            rfp: {
              delete: { allowed: false }
            }
          }
        }
      };
      req.user = userWithDeniedPermission;

      const middleware = hasPermission('rfp', 'delete');

      middleware(req as TestRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Access denied: insufficient permissions' 
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
