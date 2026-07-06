import User from '../models/User.model.js';
import Scheme from '../models/Scheme.model.js';
import Application from '../models/Application.model.js';
import auditLogRepository from '../repositories/AuditLogRepository.js';
export const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = '50', page = '1' } = req.query;
    const limitNum = parseInt(limit, 10) || 50;
    const pageNum = parseInt(page, 10) || 1;
    const skipNum = (pageNum - 1) * limitNum;
    const { logs, total } = await auditLogRepository.getRecentLogs(limitNum, skipNum);
    res.status(200).json({
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. User role counts
    const userRoleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);
    const users = {
      citizen: 0,
      officer: 0,
      admin: 0,
    };
    userRoleCounts.forEach((group) => {
      if (group._id in users) {
        users[group._id] = group.count;
      }
    });
    // 2. Application status counts
    const appStatusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const applications = {
      Draft: 0,
      Submitted: 0,
      'Under Review': 0,
      'Action Required': 0,
      Approved: 0,
      Rejected: 0,
      total: 0,
    };
    let totalApps = 0;
    appStatusCounts.forEach((group) => {
      if (group._id in applications) {
        applications[group._id] = group.count;
        totalApps += group.count;
      }
    });
    applications.total = totalApps;
    // 3. Scheme category breakdown
    const schemeCategoryCounts = await Scheme.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    const schemesByCategory = {};
    let totalSchemes = 0;
    schemeCategoryCounts.forEach((group) => {
      schemesByCategory[group._id] = group.count;
      totalSchemes += group.count;
    });
    // 4. Monthly user registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);
    const formattedTrends = registrationTrends.map((trend) => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return {
        month: `${monthNames[trend._id.month - 1]} ${trend._id.year}`,
        registrations: trend.count,
      };
    });
    res.status(200).json({
      metrics: {
        users,
        applications,
        schemes: {
          total: totalSchemes,
          byCategory: schemesByCategory,
        },
      },
      registrationTrends: formattedTrends,
    });
  } catch (error) {
    next(error);
  }
};