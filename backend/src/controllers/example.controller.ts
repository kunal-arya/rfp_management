import { Response } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Example of how to use the new error handling system
export const exampleController = {
  // Using asyncHandler wrapper - errors are automatically caught and logged
  getExample: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('ID is required', 400);
    }
    
    // Your business logic here
    const result = { id, message: 'Success' };
    
    res.json(result);
  }),

  // Example with custom error
  createExample: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
      throw new AppError('Name and email are required', 422);
    }
    
    // Simulate some business logic that might fail
    if (email === 'existing@example.com') {
      throw new AppError('Email already exists', 409);
    }
    
    // Your business logic here
    const result = { name, email, id: '123' };
    
    res.status(201).json(result);
  }),

  // Example with service error handling
  updateExample: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!id) {
      throw new AppError('ID is required', 400);
    }
    
    if (!name) {
      throw new AppError('Name is required', 422);
    }
    
    // Simulate service call that might throw an error
    try {
      // Your service call here
      const result = { id, name, updated: true };
      res.json(result);
    } catch (error: any) {
      // Service errors are automatically caught by asyncHandler
      throw new AppError(error.message || 'Update failed', 500);
    }
  })
};
