import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRouter from '../auth.router';
import * as authService from '../../services/auth.service';

// Mock the auth service
jest.mock('../../services/auth.service');

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
};

describe('Auth Router', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      roleName: 'Buyer',
    };

    it('should register user successfully', async () => {
      const mockResponse = {
        user: { id: '1', name: 'John Doe', email: 'test@example.com', role: 'Buyer', role_id: '1', status: 'active', created_at: new Date('2025-08-24T07:23:49.564Z'), updated_at: new Date('2025-08-24T07:23:49.564Z') },
        permissions: { dashboard: { view: { allowed: true } } },
        token: 'mock-token',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        validRegisterData.name,
        validRegisterData.email,
        validRegisterData.password,
        validRegisterData.roleName
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        // Missing password and roleName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 409 for existing email', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(409);

      expect(response.body).toEqual({ message: 'Email already exists' });
    });

    it('should return 500 for server errors', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(500);

      expect(response.body).toEqual({ message: 'Internal server error' });
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'buyer@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const mockResponse = {
        token: 'mock-token',
        permissions: { dashboard: { view: { allowed: true } } },
        user: { name: 'John Doe', id: '1', email: 'buyer@example.com', role: 'Buyer', role_id: '1', status: 'active', created_at: new Date('2025-08-24T07:23:49.603Z'), updated_at: new Date('2025-08-24T07:23:49.603Z') },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        validLoginData.email,
        validLoginData.password
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 500 for server errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(500);

      expect(response.body).toEqual({ message: 'Internal server error' });
    });
  });
});
