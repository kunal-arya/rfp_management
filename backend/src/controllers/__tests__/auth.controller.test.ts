import { Request, Response } from 'express';
import { register, login } from '../auth.controller';
import * as authService from '../../services/auth.service';
import { createMockRequest, createMockResponse, mockUsers } from '../../__tests__/utils';

// Mock the auth service
jest.mock('../../services/auth.service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterBody = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      roleName: 'Buyer',
    };

    it('should register user successfully', async () => {
      req.body = validRegisterBody;
      const mockResponse = {
        user: { 
          id: '1', 
          name: 'John Doe',
          email: 'test@example.com', 
          role: 'Buyer',
          role_id: 'buyer-role-id',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
        permissions: { dashboard: { view: { allowed: true } } },
        token: 'mock-token',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      await register(req as Request, res as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        validRegisterBody.name,
        validRegisterBody.email,
        validRegisterBody.password,
        validRegisterBody.roleName
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should return 400 for invalid input', async () => {
      req.body = { email: 'invalid-email' }; // Missing required fields

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 409 for existing email', async () => {
      req.body = validRegisterBody;
      mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
    });

    it('should return 400 for role not found', async () => {
      req.body = validRegisterBody;
      mockAuthService.register.mockRejectedValue(new Error('Role not found'));

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Role not found' });
    });

    it('should return 500 for other errors', async () => {
      req.body = validRegisterBody;
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('login', () => {
    const validLoginBody = {
      email: 'buyer@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      req.body = validLoginBody;
      const mockResponse = {
        token: 'mock-token',
        permissions: { dashboard: { view: { allowed: true } } },
        user: { 
          name: 'John Doe',
          id: '1', 
          email: 'buyer@example.com', 
          role: 'Buyer',
          role_id: 'buyer-role-id',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      await login(req as Request, res as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        validLoginBody.email,
        validLoginBody.password
      );
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should return 400 for invalid input', async () => {
      req.body = { email: 'invalid-email' }; // Missing password

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errors: expect.any(Array) })
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = validLoginBody;
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 500 for other errors', async () => {
      req.body = validLoginBody;
      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
