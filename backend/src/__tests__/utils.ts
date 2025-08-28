import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Mock user data for testing
export const mockUsers = {
  buyer: {
    id: '1',
    email: 'buyer@example.com',
    password_hash: '$2a$10$hashedpassword',
    role_id: 'buyer-role-id',
    created_at: new Date(),
    updated_at: new Date(),
    role: {
      id: 'buyer-role-id',
      name: 'Buyer',
      permissions: {
        dashboard: { view: { allowed: true } },
        rfp: {
          create: { allowed: true },
          view: { allowed: true, scope: 'own' },
          edit: { allowed: true, scope: 'own' },
          publish: { allowed: true, scope: 'own' },
        },
      },
    },
  },
  supplier: {
    id: '2',
    email: 'supplier@example.com',
    password_hash: '$2a$10$hashedpassword',
    role_id: 'supplier-role-id',
    created_at: new Date(),
    updated_at: new Date(),
    role: {
      id: 'supplier-role-id',
      name: 'Supplier',
      permissions: {
        dashboard: { view: { allowed: true } },
        rfp: { view: { allowed: true, scope: 'published' } },
        supplier_response: {
          create: { allowed: true },
          view: { allowed: true, scope: 'own' },
        },
      },
    },
  },
};

// Mock RFP data
export const mockRfp = {
  id: 'rfp-1',
  title: 'Test RFP',
  status_id: 'status-draft',
  buyer_id: '1',
  current_version_id: 'version-1',
  created_at: new Date(),
  updated_at: new Date(),
  status: {
    id: 'status-draft',
    code: 'Draft',
    label: 'Draft',
  },
  buyer: {
    id: '1',
    email: 'buyer@example.com',
    password_hash: '$2a$10$hashedpassword',
    role_id: 'buyer-role-id',
    created_at: new Date(),
    updated_at: new Date(),
  },
  current_version: {
    id: 'version-1',
    rfp_id: 'rfp-1',
    version_number: 1,
    description: 'Test RFP Description',
    requirements: 'Test Requirements',
    budget_min: 1000,
    budget_max: 5000,
    deadline: new Date('2024-12-31'),
    notes: 'Test Notes',
    created_at: new Date(),
  },
  supplier_responses: [],
  versions: [{
    id: 'version-1',
    rfp_id: 'rfp-1',
    version_number: 1,
    description: 'Test RFP Description',
    requirements: 'Test Requirements',
    budget_min: 1000,
    budget_max: 5000,
    deadline: new Date('2024-12-31'),
    notes: 'Test Notes',
    created_at: new Date(),
  }],
};

// Mock response data
export const mockResponse = {
  id: 'response-1',
  rfp_id: 'rfp-1',
  supplier_id: '2',
  status_id: 'status-draft',
  proposed_budget: 3000,
  timeline: '2 weeks',
  cover_letter: 'Test cover letter',
  created_at: new Date(),
  updated_at: new Date(),
  rfp: mockRfp,
  supplier: mockUsers.supplier,
  status: {
    id: 'status-draft',
    code: 'Draft',
    label: 'Draft',
  },
};

// Mock roles
export const mockRoles = {
  buyer: {
    id: 'buyer-role-id',
    name: 'Buyer',
    description: 'Buyer role',
    permissions: mockUsers.buyer.role.permissions,
  },
  supplier: {
    id: 'supplier-role-id',
    name: 'Supplier',
    description: 'Supplier role',
    permissions: mockUsers.supplier.role.permissions,
  },
};

// Helper to create authenticated request
export const createAuthenticatedRequest = (user: typeof mockUsers.buyer) => {
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
    user,
  };
};

// Extend Request interface for testing
interface TestRequest extends Request {
  user?: any;
}

// Mock Express Request
export const createMockRequest = (overrides: Partial<TestRequest> = {}): Partial<TestRequest> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

// Mock Express Response
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res;
};

// Mock Next function
export const createMockNext = () => jest.fn();

// Dashboard mock data
export const mockDashboardData = {
  buyer: {
    recentRfps: [mockRfp],
    recentResponses: [mockResponse],
    role: 'Buyer',
  },
  supplier: {
    recentRfps: [mockRfp],
    myResponses: [mockResponse],
    role: 'Supplier',
  },
};

export const mockDashboardStats = {
  buyer: {
    totalRfps: 10,
    publishedRfps: 5,
    draftRfps: 3,
    totalResponses: 15,
    pendingResponses: 8,
    role: 'Buyer',
  },
  supplier: {
    totalResponses: 8,
    draftResponses: 2,
    submittedResponses: 4,
    approvedResponses: 1,
    rejectedResponses: 1,
    availableRfps: 12,
    role: 'Supplier',
  },
};
