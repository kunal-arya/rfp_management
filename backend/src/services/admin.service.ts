import { PrismaClient } from '@prisma/client';
import * as auditService from './audit.service';
import { createAuditEntry } from './audit.service';
import { notificationService } from './notification.service';
import { USER_STATUS, AUDIT_ACTIONS } from '../utils/enum';

const prisma = new PrismaClient();

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  user?: any;
}) => {
  const { page = 1, limit = 10, search, role, status, user } = params;
  const offset = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role && role !== 'all') {
    whereClause.role = { name: role };
  }

  if (status && status !== 'all') {
    whereClause.status = status;
  }

  const users = await prisma.user.findMany({
    where: {
      ...whereClause,
      id: {
        not: user.userId
      }
    },
    include: {
      role: true,
    },
    skip: offset,
    take: parseInt(limit.toString()),
    orderBy: { created_at: 'desc' },
  });

  const total = await prisma.user.count({ where: { ...whereClause } });

  return {
    data: users,
    total,
    page: parseInt(page.toString()),
    limit: parseInt(limit.toString()),
  };
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUser = async (id: string, data: { name?: string; email?: string; role?: string; updatedBy?: string }) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const role = await prisma.role.findUnique({
    where: { name: data.role },
  });
  
  if (!role) {
    throw new Error('Role not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role_id: role.id,
    },
    include: {
      role: true,
    },
  });

  // Log admin action in audit trail
  if (data.updatedBy) {
    await createAuditEntry(data.updatedBy, AUDIT_ACTIONS.USER_UPDATED, 'User', id, {
      updatedUserId: id,
      updatedUserEmail: updatedUser.email,
      changes: { name: data.name, email: data.email, role: data.role }
    });
  }

  return updatedUser;
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id }
  });

  return { message: 'User deleted successfully' };
};

export const toggleUserStatus = async (id: string, action: 'activate' | 'deactivate', updatedBy?: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newStatus = action === 'activate' ? 'active' : 'inactive';
  
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    include: { role: true }
  });

  // Log admin action in audit trail
  if (updatedBy) {
    await createAuditEntry(updatedBy, AUDIT_ACTIONS.USER_STATUS_CHANGED, 'User', id, {
      targetUserId: id,
      action: action,
      newStatus: newStatus
    });
  }

  return {
    message: `User ${action}d successfully`,
    user: updatedUser
  };
};

export const getUserStats = async () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    lastMonthUsers,
    twoMonthsAgoUsers,
    activeUsersLastWeek,
    activeUsersTwoWeeksAgo,
    totalBuyers,
    inactiveBuyers,
    totalSuppliers,
    inactiveSuppliers,
  ] = await Promise.all([
    // Total Users
    prisma.user.count(),
    
    // Users created last month
    prisma.user.count({
      where: {
        created_at: { gte: lastMonth },
      },
    }),
    
    // Users created two months ago
    prisma.user.count({
      where: {
        created_at: { gte: twoMonthsAgo, lt: lastMonth },
      },
    }),
    
    // Active users in last week (users who logged in)
    prisma.auditTrail.groupBy({
      by: ['user_id'],
      where: {
        action: AUDIT_ACTIONS.USER_LOGIN,
        created_at: { gte: lastWeek },
      },
    }).then(result => result.length),
    
    // Active users in previous week
    prisma.auditTrail.groupBy({
      by: ['user_id'],
      where: {
        action: AUDIT_ACTIONS.USER_LOGIN,
        created_at: { gte: twoWeeksAgo, lt: lastWeek },
      },
    }).then(result => result.length),
    
    // Total Buyers
    prisma.user.count({
      where: {
        role: { name: 'Buyer' },
      },
    }),

    // InActive Buyers
    prisma.user.count({
      where: {
        role: { name: 'Buyer' },
        status: USER_STATUS.Inactive,
      },
    }),
    
    // Total Suppliers
    prisma.user.count({
      where: {
        role: { name: 'Supplier' },
      },
    }),

    // InActive Suppliers
    prisma.user.count({
      where: {
        role: { name: 'Supplier' },
        status: USER_STATUS.Inactive,
      },
    }),
  ]);

  // Calculate percentage changes
  const userGrowthLastMonth = twoMonthsAgoUsers === 0 
    ? (lastMonthUsers > 0 ? 100 : 0)
    : Math.round(((lastMonthUsers - twoMonthsAgoUsers) / twoMonthsAgoUsers) * 100);

  const activeUserGrowthLastWeek = activeUsersTwoWeeksAgo === 0
    ? (activeUsersLastWeek > 0 ? 100 : 0)
    : Math.round(((activeUsersLastWeek - activeUsersTwoWeeksAgo) / activeUsersTwoWeeksAgo) * 100);

  return {
    totalUsers,
    userGrowthLastMonth: userGrowthLastMonth > 0 ? `+${userGrowthLastMonth}%` : `${userGrowthLastMonth}%`,
    activeUsers: activeUsersLastWeek,
    activeUserGrowthLastWeek: activeUserGrowthLastWeek > 0 ? `+${activeUserGrowthLastWeek}%` : `${activeUserGrowthLastWeek}%`,
    totalBuyers,
    inactiveBuyers,
    totalSuppliers,
    inactiveSuppliers,
  };
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  roleName: string;
  createdBy?: string;
}) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Get role ID based on role name
  const role = await prisma.role.findUnique({
    where: { name: data.roleName }
  });

  if (!role) {
    throw new Error('Invalid role');
  }

  // Hash password
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      role_id: role.id,
      status: 'active'
    },
    include: {
      role: true
    }
  });

  // Log admin action in audit trail
  if (data.createdBy) {
    await createAuditEntry(data.createdBy, AUDIT_ACTIONS.USER_CREATED, 'User', user.id, {
      createdUserId: user.id,
      createdUserEmail: user.email,
      roleName: data.roleName
    });
  }

  return user;
};

// Permission Management Functions
export const getRolePermissions = async (roleName: string) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    select: { permissions: true }
  });

  if (!role) {
    throw new Error('Role not found');
  }

  return role.permissions;
};

export const updateRolePermissions = async (roleName: string, permissions: any, updatedBy?: string) => {
  // Validate that the role exists
  const existingRole = await prisma.role.findUnique({
    where: { name: roleName }
  });

  if (!existingRole) {
    throw new Error('Role not found');
  }

  // Validate permissions structure (basic validation)
  if (typeof permissions !== 'object' || permissions === null) {
    throw new Error('Invalid permissions format');
  }

  // Update the role permissions
  const updatedRole = await prisma.role.update({
    where: { name: roleName },
    data: { permissions },
    select: { permissions: true }
  });

  // Log admin action in audit trail
  if (updatedBy) {
    await createAuditEntry(updatedBy, AUDIT_ACTIONS.PERMISSIONS_UPDATED, 'Role', roleName, {
      roleName,
      updatedBy
    });
  }

  // Notification removed as per requirements

  return updatedRole.permissions;
};

export const getAllRoles = async () => {
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true
    }
  });

  return roles;
};

export const getResponseStats = async () => {
  const stats = await Promise.all([
    // Total responses
    prisma.supplierResponse.count(),

    // Pending review (Submitted status)
    prisma.supplierResponse.count({
      where: {
        status: {
          code: 'Submitted'
        }
      }
    }),

    // Approved responses
    prisma.supplierResponse.count({
      where: {
        status: {
          code: 'Approved'
        }
      }
    }),

    // Average rating (only for rated responses) - Note: Since rating doesn't exist in schema, we'll return 0
    Promise.resolve({ _avg: { rating: 0 } })
  ]);

  return {
    total_responses: stats[0],
    pending_review: stats[1],
    approved: stats[2],
    avg_rating: stats[3]._avg.rating || 0
  };
};

export const getAdminResponses = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const { page, limit, search, status } = params;
  const offset = (page - 1) * limit;

  // Create filters for admin to get all responses
  const responseFilters: any = {};
  if (status) {
    const statusRecord = await prisma.supplierResponseStatus.findUnique({
      where: { code: status }
    });
    if (statusRecord) {
      responseFilters.status_id = statusRecord.id;
    }
  }

  const responses = await prisma.supplierResponse.findMany({
    where: {
      ...responseFilters,
      ...(search && {
        OR: [
          { cover_letter: { contains: search, mode: 'insensitive' } },
          { rfp: { title: { contains: search, mode: 'insensitive' } } },
          { rfp: { buyer: { is: { email: { contains: search, mode: 'insensitive' } } } } },
          { supplier: { email: { contains: search, mode: 'insensitive' } } },
        ]
      }),
    },
    skip: offset,
    take: limit,
    include: {
      rfp: {
        include: {
          current_version: true,
          status: true,
          buyer: true,
        },
      },
      status: true,
      supplier: true,
      documents: true,
    },
    orderBy: { created_at: 'desc' },
  });

  const total = await prisma.supplierResponse.count({
    where: {
      ...responseFilters,
      ...(search && {
        OR: [
          { cover_letter: { contains: search, mode: 'insensitive' } },
          { rfp: { title: { contains: search, mode: 'insensitive' } } },
          { rfp: { buyer: { is: { email: { contains: search, mode: 'insensitive' } } } } },
          { supplier: { email: { contains: search, mode: 'insensitive' } } },
        ]
      }),
    },
  });

  // Get stats for the response management page
  const stats = await getResponseStats();

  return {
    data: responses,
    total,
    page,
    limit,
    stats
  };
};

export const getAdminResponse = async (responseId: string) => {
  const response = await prisma.supplierResponse.findUnique({
    where: { id: responseId },
    include: {
      rfp: {
        include: {
          current_version: true,
          status: true,
          buyer: true,
        },
      },
      status: true,
      supplier: true,
      documents: true,
    },
  });

  if (!response) {
    throw new Error('Response not found');
  }

  return response;
};
