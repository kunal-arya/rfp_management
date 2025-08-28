import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { registerSchema, loginSchema } from '../validations/auth.validation';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { notifyUserCreated } from '../services/websocket.service';

export const register = async (req: Request, res: Response) => {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { name, email, password, roleName } = validationResult.data;

    try {
        const user = await authService.register(name, email, password, roleName);
        
        // Send notification to admin users about new user registration
        notifyUserCreated(user.user);
        
        res.status(201).json(user);
    } catch (error: any) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({ message: error.message });
        }
        if (error.message === 'Role not found') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { email, password } = validationResult.data;

    try {
        const result = await authService.login(email, password);
        return res.json(result);
    } catch (error: any) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        if (error.message === 'Your account is inactive, please contact the admin') {
            return res.status(401).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const user = await authService.createAdminUser(name, email, password);
        res.status(201).json(user);
    } catch (error: any) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({ message: error.message });
        }
        if (error.message === 'Admin role not found') {
            return res.status(500).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await authService.logout(req.user?.userId);
        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
