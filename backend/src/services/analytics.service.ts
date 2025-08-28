import { PrismaClient } from '@prisma/client';
import { AUDIT_ACTIONS, RFP_STATUS, RoleName, USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export const getAnalyticsData = async () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalRfps,
    rfpStatusDistribution,
    monthlyGrowthData,
    responseMetrics,
    systemMetrics,
    topPerformingBuyers,
    topPerformingSuppliers,
    responseTimeMetrics
  ] = await Promise.all([
    // Total RFPs
    prisma.rFP.count({
      where: {
        deleted_at: null
      }
    }),
    
    // RFP Status Distribution with status labels
    prisma.rFP.groupBy({
      by: ['status_id'],
      _count: {
        status_id: true
      },
      where: {
        deleted_at: null
      }
    }),
    
    // Monthly Growth Data (last 6 months)
    (async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const [users, rfps, responses] = await Promise.all([
          prisma.user.count({
            where: {
              created_at: { gte: monthStart, lte: monthEnd }
            }
          }),
          prisma.rFP.count({
            where: {
              created_at: { gte: monthStart, lte: monthEnd },
              deleted_at: null
            }
          }),
          prisma.supplierResponse.count({
            where: {
              created_at: { gte: monthStart, lte: monthEnd }
            }
          })
        ]);
        
        months.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          users,
          rfps,
          responses
        });
      }
      return months;
    })(),
    
    // Response Performance Metrics
    (async () => {
      // Get all RFPs with their first response time
      const rfpsWithFirstResponse = await prisma.rFP.findMany({
        where: {
          supplier_responses: {
            some: {}
          },
          deleted_at: null
        },
        include: {
          supplier_responses: {
            orderBy: {
              created_at: 'asc'
            },
            take: 1
          }
        }
      });

      // Calculate average response time
      let totalResponseTime = 0;
      let responseCount = 0;

      rfpsWithFirstResponse.forEach(rfp => {
        if (rfp.supplier_responses.length > 0) {
          const responseTime = rfp.supplier_responses[0].created_at.getTime() - rfp.created_at.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      });

      const avgResponseTimeDays = responseCount > 0 ? Math.round((totalResponseTime / (1000 * 60 * 60 * 24)) / responseCount) : 0;
      
      // Response Rate (RFPs with at least one response)
      const rfpsWithResponses = await prisma.rFP.count({
        where: {
          supplier_responses: { some: {} },
          deleted_at: null
        }
      });
      
      // Success Rate (RFPs that have an awarded response)
      const awardedRfps = await prisma.rFP.count({
        where: {
          deleted_at: null,
          status: { code: RFP_STATUS.Awarded }
        }
      });

      // Average Responses per RFP
      const rfpResponseCounts = await prisma.rFP.findMany({
        include: {
          _count: {
            select: { supplier_responses: true }
          }
        },
        where: {
          deleted_at: null
        }
      });

      const totalResponseCount = rfpResponseCounts.reduce((sum, rfp) => sum + rfp._count.supplier_responses, 0);
      const avgResponsesPerRfp = rfpResponseCounts.length > 0 ? Math.round((totalResponseCount / rfpResponseCounts.length) * 10) / 10 : 0;
      
      return {
        avgResponseTime: avgResponseTimeDays > 0 ? `${avgResponseTimeDays} days` : 'N/A',
        responseRate: rfpsWithResponses,
        successRate: awardedRfps,
        avgResponsesPerRfp
      };
    })(),
    
    // System Performance Metrics
    (async () => {
      const [totalLogins, errorCount, loginEvents, logoutEvents] = await Promise.all([
        // Total logins in last week
        prisma.auditTrail.count({
          where: {
            action: AUDIT_ACTIONS.USER_LOGIN,
            created_at: { gte: lastWeek }
          }
        }),
        
        // Error count in last week
        prisma.auditTrail.count({
          where: {
            action: { in: [AUDIT_ACTIONS.SYSTEM_ERROR, AUDIT_ACTIONS.CLIENT_ERROR, AUDIT_ACTIONS.AUTHORIZATION_ERROR, AUDIT_ACTIONS.VALIDATION_ERROR, AUDIT_ACTIONS.PERMISSION_DENIED] },
            created_at: { gte: lastWeek }
          }
        }),

        prisma.auditTrail.findMany({
          where: {
            action: AUDIT_ACTIONS.USER_LOGIN,
            created_at: { gte: lastWeek }
          },
          select: { user_id: true, created_at: true },
          orderBy: { created_at: 'asc' }
        }),

        prisma.auditTrail.findMany({
          where: {
            action: AUDIT_ACTIONS.USER_LOGOUT,
            created_at: { gte: lastWeek }
          },
          select: { user_id: true, created_at: true },
          orderBy: { created_at: 'asc' }
        })
      ]);

      let sessions: number[] = [];

      // Simple pairing: for each login, find the next logout by the same user
      loginEvents.forEach(login => {
        const matchingLogout = logoutEvents.find(logout => 
          logout.user_id === login.user_id && logout.created_at > login.created_at
        );
        
        if (matchingLogout) {
          sessions.push(matchingLogout.created_at.getTime() - login.created_at.getTime());
        }
      });
      
      const averageDuration = sessions.length > 0 ? sessions.reduce((sum, duration) => sum + duration, 0) / sessions.length : 0;
      return {
        totalLogins,
        errorRate: totalLogins > 0 ? ((errorCount / totalLogins) * 100).toFixed(1) : '0',
        avgSessionDuration: `${Math.round(averageDuration / (1000 * 60))}m ${Math.round((averageDuration % (1000 * 60)) / 1000)}s`
      };
    })(),
    
    // Top Performing Buyers (by RFPs created)
    prisma.user.findMany({
      where: {
        role: { name: RoleName.Buyer },
        status: { equals: USER_STATUS.Active }
      },
      include: {
        _count: {
          select: { rfps: true }
        }
      },
      orderBy: {
        rfps: { _count: 'desc' }
      },
      take: 5
    }),
    
    // Top Performing Suppliers (by responses submitted)
    prisma.user.findMany({
      where: {
        role: { name: RoleName.Supplier },
        status: { equals: USER_STATUS.Active }
      },
      include: {
        _count: {
          select: { supplier_responses: true }
        }
      },
      orderBy: {
        supplier_responses: { _count: 'desc' }
      },
      take: 5
    }),
    
    // Response Time Metrics using Prisma queries
    (async () => {
      const rfpsWithResponses = await prisma.rFP.findMany({
        where: {
          supplier_responses: {
            some: {}
          },
          deleted_at: null
        },
        include: {
          supplier_responses: {
            orderBy: {
              created_at: 'asc'
            },
            take: 1
          }
        }
      });

      const timeRanges = {
        'Within 24h': 0,
        '24-72h': 0,
        '3-7 days': 0,
        'Over 7 days': 0
      };

      rfpsWithResponses.forEach(rfp => {
        if (rfp.supplier_responses.length > 0) {
          const responseTime = rfp.supplier_responses[0].created_at.getTime() - rfp.created_at.getTime();
          const hours = responseTime / (1000 * 60 * 60);
          
          if (hours < 24) {
            timeRanges['Within 24h']++;
          } else if (hours < 72) {
            timeRanges['24-72h']++;
          } else if (hours < 168) {
            timeRanges['3-7 days']++;
          } else {
            timeRanges['Over 7 days']++;
          }
        }
      });

      return Object.entries(timeRanges).map(([timeRange, count]) => ({
        time_range: timeRange,
        count
      }));
    })()
  ]);

  // Get RFP status labels for distribution
  const statusLabels = await prisma.rFPStatus.findMany({
    select: {
      id: true,
      label: true
    }
  });

  // Calculate percentages for RFP status distribution
  const totalRfpsForDistribution = rfpStatusDistribution.reduce((sum: number, item: any) => sum + item._count.status_id, 0);
  const rfpStatusWithPercentages = rfpStatusDistribution.map((item: any) => {
    const statusLabel = statusLabels.find(status => status.id === item.status_id)?.label || item.status_id;
    return {
      status: statusLabel,
      count: item._count.status_id,
      percentage: totalRfpsForDistribution > 0 ? Math.round((item._count.status_id / totalRfpsForDistribution) * 100) : 0
    };
  });

  // Calculate response rate percentage
  const responseRatePercentage = totalRfps > 0 ? Math.round((responseMetrics.responseRate / totalRfps) * 100) : 0;
  const successRatePercentage = totalRfps > 0 ? Math.round((responseMetrics.successRate / totalRfps) * 100) : 0;

  
  return {    
    // Charts Data
    monthlyGrowthData,
    rfpStatusDistribution: rfpStatusWithPercentages,
    responseTimeMetrics,
    
    // Performance Metrics
    responseMetrics: {
      ...responseMetrics,
      responseRate: `${responseRatePercentage}%`,
      successRate: `${successRatePercentage}%`
    },
    
    // System Metrics
    systemMetrics,
    
    // Top Performers
    topPerformingBuyers: topPerformingBuyers.map((user: any) => ({
      name: user.name,
      email: user.email,
      rfpsCreated: user._count.rfps
    })),
    
    topPerformingSuppliers: topPerformingSuppliers.map((user: any) => ({
      name: user.name,
      email: user.email,
      responsesSubmitted: user._count.supplier_responses
    }))
  };
};
