import { PrismaClient, Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAuditEntry } from './audit.service';
import { AUDIT_ACTIONS } from '../utils/enum';

const prisma = new PrismaClient();

export const register = async (name: string, email: string, password: string, roleName: 'Buyer' | 'Supplier' | 'Admin') => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
        // This should not happen if the database is seeded correctly
        throw new Error('Role not found');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password_hash,
            role_id: role.id,
        },
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    const token = jwtToken(user, role);
    // Create audit trail entry for registration
    await createAuditEntry(user.id, AUDIT_ACTIONS.USER_REGISTERED, 'User', user.id, {
        name: user.name,
        email: user.email,
        role: role.name,
    });

    const response = {
        user: {
            ...userWithoutPassword,
            role: role.name,
        },
        permissions: role.permissions,
        token: token
    }
    return response;
};

const jwtToken = (user: User, role: Role) => {

    const token = jwt.sign(
        {
            userId: user.id,
            role: role.name,
            permissions: role.permissions
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    );

    return token
}

export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true, // Include the full role object
        },
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.status === 'inactive') {
        throw new Error('Your account is inactive, please contact the admin');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = jwtToken(user, user.role);

    // Create audit trail entry for login
    await createAuditEntry(user.id, AUDIT_ACTIONS.USER_LOGIN, 'User', user.id, {
        email: user.email,
        role: user.role.name,
    });

    return {
        token,
        permissions: user.role.permissions,
        user: {
            name: user.name,
            email: user.email,
            id: user.id,
            role_id: user.role_id,
            role: user.role.name,
        }
    };
};

export const createAdminUser = async (name: string, email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (!adminRole) {
        throw new Error('Admin role not found');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password_hash,
            role_id: adminRole.id,
        },
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    
    // Create audit trail entry for admin user creation
    await createAuditEntry(user.id, AUDIT_ACTIONS.USER_REGISTERED, 'User', user.id, {
        name: user.name,
        email: user.email,
        role: 'Admin',
        created_by: 'system',
    });

    return {
        user: {
            ...userWithoutPassword,
            role: 'Admin',
        },
        permissions: adminRole.permissions,
    };
};

export const logout = async (userId?: string) => {
    if (!userId) {
        throw new Error('User ID is required for logout');
    }

    // Create audit trail entry for logout
    await createAuditEntry(userId, AUDIT_ACTIONS.USER_LOGOUT, 'User', userId, {
        logout_time: new Date().toISOString(),
    });

    return {
        message: 'Logged out successfully',
        logout_time: new Date().toISOString(),
    };
};
