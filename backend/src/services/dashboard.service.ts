import { PrismaClient } from '@prisma/client';
import { RFP_STATUS, RoleName, SUPPLIER_RESPONSE_STATUS, AUDIT_ACTIONS, USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export const getDashboardData = async (userId: string, userRole: string) => {
    if (userRole === 'Buyer') {
        return await getBuyerDashboard(userId);
    } else if (userRole === 'Supplier') {
        return await getSupplierDashboard(userId);
    } else if (userRole === 'Admin') {
        return await getAdminDashboard(userId);
    } else {
        throw new Error('Invalid user role');
    }
};

export const getDashboardStats = async (userId: string, userRole: string) => {
    if (userRole === 'Buyer') {
        return await getBuyerStats(userId);
    } else if (userRole === 'Supplier') {
        return await getSupplierStats(userId);
    } else if (userRole === 'Admin') {
        return await getAdminStats(userId);
    } else {
        throw new Error('Invalid user role');
    }
};

const getBuyerDashboard = async (userId: string) => {
    // Get recent RFPs created by the buyer
    const recentRfps = await prisma.rFP.findMany({
        where: { buyer_id: userId , deleted_at: null },
        include: {
            current_version: true,
            status: true,
            supplier_responses: {
                include: {
                    supplier: true,
                    status: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    // Get recent responses to buyer's RFPs
    const recentResponses = await prisma.supplierResponse.findMany({
        where: {
            rfp: { buyer_id: userId , deleted_at: null },
            status: { code: {
                not: SUPPLIER_RESPONSE_STATUS.Draft,
            } },
        },
        include: {
            supplier: true,
            rfp: {
                include: {
                    current_version: true,
                },
            },
            status: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    return {
        recentRfps,
        recentResponses,
        role: 'Buyer',
    };
};

const getSupplierDashboard = async (userId: string) => {
    // Get recent RFPs the supplier can respond to
    const publishedRfps = await prisma.rFP.findMany({
        where: {
            deleted_at: null,
            status: { code: {
               in: [RFP_STATUS.Published],
            } },
            supplier_responses: {
                none: { supplier_id: userId },
            },
        },
        include: {
            current_version: true,
            status: true,
            buyer: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    // Get supplier's recent responses
    const myResponses = await prisma.supplierResponse.findMany({
        where: { supplier_id: userId },
        include: {
            rfp: {
                include: {
                    current_version: true,
                    status: true,
                },
            },
            status: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    return {
        publishedRfps,
        myResponses,
        role: 'Supplier',
    };
};

const getBuyerStats = async (userId: string) => {
    const [
        totalRfps,
        publishedRfps,
        draftRfps,
        closedRfps,
        awardedRfps,
        cancelledRfps,
        totalResponses,
        pendingResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
    ] = await Promise.all([
        // Total RFPs
        prisma.rFP.count({ where: { buyer_id: userId , deleted_at: null } }),
        
        // Published RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Published }, deleted_at: null },
        }),
        
        // Draft RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Draft }, deleted_at: null },
        }),
        
        // Closed RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Closed }, deleted_at: null },
        }),
        
        // Awarded RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Awarded }, deleted_at: null },
        }),
        
        // Cancelled RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Cancelled }, deleted_at: null },
        }),
        
        // Total responses to buyer's RFPs
        prisma.supplierResponse.count({
            where: { rfp: { buyer_id: userId , deleted_at: null } },
        }),
        
        // Pending responses (Under Review)
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Under_Review },
            },
        }),
        
        // Approved responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Approved },
            },
        }),
        
        // Rejected responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Rejected },
            },
        }),
        
        // Awarded responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Awarded },
            },
        }),
    ]);

    return {
        totalRfps,
        publishedRfps,
        draftRfps,
        closedRfps,
        awardedRfps,
        cancelledRfps,
        totalResponses,
        pendingResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
        role: RoleName.Buyer,
    };
};

const getSupplierStats = async (userId: string) => {
    const [
        totalResponses,
        draftResponses,
        submittedResponses,
        underReviewResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
        availableRfps,
    ] = await Promise.all([
        // Total responses
        prisma.supplierResponse.count({ where: { supplier_id: userId } }),
        
        // Draft responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Draft } },
        }),
        
        // Submitted responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Submitted } },
        }),
        
        // Under Review responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Under_Review } },
        }),
        
        // Approved responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Approved } },
        }),
        
        // Rejected responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Rejected } },
        }),
        
        // Awarded responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Awarded } },
        }),
        
        // Available RFPs to respond to
        prisma.rFP.count({
            where: {
                deleted_at: null,
                status: { code: RFP_STATUS.Published },
                supplier_responses: {
                    none: { supplier_id: userId },
                },
            },
        }),
    ]);

    return {
        totalResponses,
        draftResponses,
        submittedResponses,
        underReviewResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
        availableRfps,
        role: RoleName.Supplier,
    };
};

const getAdminDashboard = async (userId: string) => {
    // Get recent system activity
    const recentRfps = await prisma.rFP.findMany({
        where: { deleted_at: null },
        include: {
            current_version: true,
            status: true,
            buyer: true,
            supplier_responses: {
                include: {
                    supplier: true,
                    status: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    // Get recent responses
    const recentResponses = await prisma.supplierResponse.findMany({
        where: {
            status: { code: { not: SUPPLIER_RESPONSE_STATUS.Draft } },
        },
        include: {
            supplier: true,
            rfp: {
                include: {
                    current_version: true,
                    buyer: true,
                },
            },
            status: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
        include: {
            role: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    return {
        recentRfps,
        recentResponses,
        recentUsers,
        role: 'Admin',
    };
};

const getAdminStats = async (userId: string) => {
    const [
        totalUsers,
        totalRfps,
        totalResponses,
        activeUsers,
        newUsersThisMonth,
        newRfpsThisMonth,
        avgResponseTime,
        successRate,
        avgResponsesPerRfp,
        activeUsersGrowth,
        platformHealth,
    ] = await Promise.all([
        // Total users
        prisma.user.count(),
        
        // Total RFPs
        prisma.rFP.count({ where: { deleted_at: null } }),
        
        // Total responses
        prisma.supplierResponse.count(),
        
        // Active users (users who logged in within last 30 days)
        prisma.user.count({
            where: {
                updated_at: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                status: { equals: USER_STATUS.Active }
            },
        }),
        
        // New users this month
        prisma.user.count({
            where: {
                created_at: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
        
        // New RFPs this month
        prisma.rFP.count({
            where: {
                created_at: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
                deleted_at: null,
            },
        }),
        
        // Average response time (real calculation)
        (async () => {
            const responses = await prisma.supplierResponse.findMany({
                where: {
                    status: { code: { not: SUPPLIER_RESPONSE_STATUS.Draft } },
                    rfp: { deleted_at: null },
                },
                include: {
                    rfp: {
                        include: { current_version: true },
                    },
                },
            });

            if (responses.length === 0) return '0 days';

            let totalDays = 0;
            let validResponses = 0;

            for (const response of responses) {
                const rfpCreatedAt = response.rfp.created_at;
                const responseCreatedAt = response.created_at;
                const daysDiff = Math.ceil((responseCreatedAt.getTime() - rfpCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff >= 0) {
                    totalDays += daysDiff;
                    validResponses++;
                }
            }

            if (validResponses === 0) return '0 days';
            const avgDays = Math.round((totalDays / validResponses) * 10) / 10;
            return `${avgDays} days`;
        })(),
        
        // Success rate (real calculation)
        (async () => {
            const totalRfps = await prisma.rFP.count({
                where: {
                    deleted_at: null,
                },
            });

            const awardedRfps = await prisma.rFP.count({
                where: {
                    deleted_at: null,
                    status: { code: RFP_STATUS.Awarded },
                },
            });

            if (totalRfps === 0) return '0%';
            const successRate = Math.round((awardedRfps / totalRfps) * 100);
            return `${successRate}%`;
        })(),
        
        // Average responses per RFP
        (async () => {
            const totalRfps = await prisma.rFP.count({ where: { deleted_at: null } });
            const totalResponses = await prisma.supplierResponse.count();
            
            if (totalRfps === 0) return '0';
            const avgResponses = Math.round((totalResponses / totalRfps) * 10) / 10;
            return avgResponses.toString();
        })(),
        
        // Active users growth (last week vs previous week)
        (async () => {
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            
            // Active users in last 7 days (users who logged in)
            const activeUsersLastWeekResult = await prisma.auditTrail.groupBy({
                by: ['user_id'],
                where: {
                    action: AUDIT_ACTIONS.USER_LOGIN,
                    created_at: { gte: oneWeekAgo },
                },
            });
            const activeUsersLastWeek = activeUsersLastWeekResult.length;
            
            // Active users in previous 7 days
            const activeUsersPreviousWeekResult = await prisma.auditTrail.groupBy({
                by: ['user_id'],
                where: {
                    action: AUDIT_ACTIONS.USER_LOGIN,
                    created_at: { 
                        gte: twoWeeksAgo, 
                        lt: oneWeekAgo 
                    },
                },
            });
            const activeUsersPreviousWeek = activeUsersPreviousWeekResult.length;
            
            // Handle edge cases properly
            if (activeUsersPreviousWeek === 0 && activeUsersLastWeek === 0) {
                return '0%'; // No users in either period
            }
            
            if (activeUsersPreviousWeek === 0 && activeUsersLastWeek > 0) {
                return '+100%';
            }
            
            const growth = Math.round(((activeUsersLastWeek - activeUsersPreviousWeek) / activeUsersPreviousWeek) * 100);
            return growth > 0 ? `+${growth}%` : `${growth}%`;
        })(),
        
        // Platform Health (static for now - TODO: implement proper monitoring)
        (() => {
            return '99.9%'; // Static uptime - replace with real monitoring later
        })(),
    ]);

    return {
        totalUsers,
        totalRfps,
        totalResponses,
        activeUsers,
        newUsersThisMonth,
        newRfpsThisMonth,
        avgResponseTime,
        successRate,
        avgResponsesPerRfp: avgResponsesPerRfp,
        activeUsersGrowth: activeUsersGrowth,
        platformHealth: platformHealth,
        role: 'Admin',
    };
};
