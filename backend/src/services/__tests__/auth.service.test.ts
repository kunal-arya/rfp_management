import { register, login } from '../auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUsers, mockRoles } from '../../__tests__/utils';

// Mock dependencies first
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  })),
}));

// Create mock instance
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
} as any;

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      name: 'John Doe',
      email: 'buyer@example.com',
      password: 'password123',
      roleName: 'Buyer' as const,
    };

    it('should register user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(mockRoles.buyer);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      mockPrisma.user.create.mockResolvedValue({
        ...mockUsers.buyer,
        name: registerData.name,
        email: registerData.email,
      });
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await register(registerData.name, registerData.email, registerData.password, registerData.roleName);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: registerData.roleName },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: registerData.name,
          email: registerData.email,
          password_hash: 'hashedpassword',
          role_id: mockRoles.buyer.id,
        },
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('permissions');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.name).toBe(registerData.name);
      expect(result.token).toBe('mock-token');
    });

    it('should throw error if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUsers.buyer);

      await expect(
        register(registerData.name, registerData.email, registerData.password, registerData.roleName)
      ).rejects.toThrow('Email already exists');
    });

    it('should throw error if role not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(null);

      await expect(
        register(registerData.name, registerData.email, registerData.password, registerData.roleName)
      ).rejects.toThrow('Role not found');
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(
        register(registerData.name, registerData.email, registerData.password, registerData.roleName)
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'buyer@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUsers.buyer,
        role: mockRoles.buyer,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await login(loginData.email, loginData.password);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
        include: { role: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUsers.buyer.password_hash);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUsers.buyer.id,
          role: mockRoles.buyer.name,
          permissions: mockRoles.buyer.permissions,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('permissions');
      expect(result).toHaveProperty('user');
      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe(loginData.email);
    });

    it('should throw error for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(login(loginData.email, loginData.password)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for incorrect password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUsers.buyer,
        role: mockRoles.buyer,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(login(loginData.email, loginData.password)).rejects.toThrow('Invalid credentials');
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(login(loginData.email, loginData.password)).rejects.toThrow('Database error');
    });
  });
});
