import { Router } from 'express';
import Analytics from '../models/Analytics';
import { parseQuery } from '../utils/queryHelper';

const router = Router();

// Dashboard statistics endpoint
router.get('/dashboard', async (req, res, next) => {
  try {
    // Try to use the latest analytics document (monthly preferred, fallback to weekly/daily)
    let analytics = await Analytics.findOne({}, {}, { sort: { date: -1 } });
    let stats;
    if (analytics) {
      stats = analytics.metrics;
    } else {
      // Fallback: aggregate live from collections
      const [Order, User, Product, Shop] = [
        require('../models/Order').default,
        require('../models/User').default,
        require('../models/Product').default,
        require('../models/Shop').default,
      ];
      // Date ranges
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);

      // Helper for change calculation
      const calcChange = (current: number, prev: number) => ({
        value: current,
        prev,
        abs: current - prev,
        percent: prev ? ((current - prev) / prev) * 100 : null
      });

      // Orders & Revenue
      const [
        totalOrders,
        totalOrdersLastWeek,
        totalOrdersLastMonth,
        totalOrdersLastYear,
        totalRevenue,
        totalRevenueLastWeek,
        totalRevenueLastMonth,
        totalRevenueLastYear,
        totalUsers,
        totalUsersLastWeek,
        totalUsersLastMonth,
        totalUsersLastYear,
        newUsers,
        newUsersLastWeek,
        newUsersLastMonth,
        newUsersLastYear,
        totalProducts,
        totalShops
      ] = await Promise.all([
        Order.countDocuments({}),
        Order.countDocuments({ createdAt: { $gte: startOfLastWeek, $lt: startOfWeek } }),
        Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
        Order.countDocuments({ createdAt: { $gte: startOfLastYear, $lt: startOfYear } }),
        Order.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.total' } } }]).then((r: any[]) => r[0]?.total || 0),
        Order.aggregate([{ $match: { createdAt: { $gte: startOfLastWeek, $lt: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]).then((r: any[]) => r[0]?.total || 0),
        Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]).then((r: any[]) => r[0]?.total || 0),
        Order.aggregate([{ $match: { createdAt: { $gte: startOfLastYear, $lt: startOfYear } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]).then((r: any[]) => r[0]?.total || 0),
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: startOfLastWeek, $lt: startOfWeek } }),
        User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
        User.countDocuments({ createdAt: { $gte: startOfLastYear, $lt: startOfYear } }),
        User.countDocuments({ createdAt: { $gte: startOfToday } }),
        User.countDocuments({ createdAt: { $gte: startOfLastWeek, $lt: startOfWeek } }),
        User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
        User.countDocuments({ createdAt: { $gte: startOfLastYear, $lt: startOfYear } }),
        Product.countDocuments({}),
        Shop.countDocuments({})
      ]);

      // Delivery times (in minutes)
      const deliveryTimes = await Order.aggregate([
        { $match: { actualDeliveryTime: { $exists: true, $ne: null }, estimatedDeliveryTime: { $exists: true, $ne: null } } },
        { $project: {
          deliveryMinutes: { $divide: [{ $subtract: ['$actualDeliveryTime', '$estimatedDeliveryTime'] }, 1000 * 60] }
        } }
      ]);
      const deliveryMinutesArr = deliveryTimes.map((d: any) => d.deliveryMinutes).filter((x: number) => typeof x === 'number');
      const averageDeliveryTime = deliveryMinutesArr.length ? (deliveryMinutesArr.reduce((a: number, b: number) => a + b, 0) / deliveryMinutesArr.length) : null;
      const longestDeliveryTime = deliveryMinutesArr.length ? Math.max(...deliveryMinutesArr) : null;
      const shortestDeliveryTime = deliveryMinutesArr.length ? Math.min(...deliveryMinutesArr) : null;

      // Top products by sales
      const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        { $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          orderCount: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }},
        { $sort: { orderCount: -1 } },
        { $limit: 5 },
        // Lookup product image
        { $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo'
        }},
        { $addFields: {
            image: { $arrayElemAt: ['$productInfo.images', 0] }
        }},
        { $project: {
            _id: 1,
            name: 1,
            orderCount: 1,
            revenue: 1,
            image: 1
        }}
      ]);

      // Users time series (last 7 days)
      const usersTimeSeries = await User.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) } } },
        { $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]);

      // Payments time series (last 7 days, by method)
      const paymentsTimeSeries = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) } } },
        { $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            method: '$paymentMethod'
          },
          total: { $sum: '$pricing.total' }
        }},
        { $group: {
          _id: '$_id.date',
          payments: {
            $push: {
              method: '$_id.method',
              total: '$total'
            }
          }
        }},
        { $sort: { _id: 1 } }
      ]);

      stats = {
        totalOrders: calcChange(totalOrders, totalOrdersLastWeek),
        totalOrdersMonth: calcChange(totalOrders, totalOrdersLastMonth),
        totalOrdersYear: calcChange(totalOrders, totalOrdersLastYear),
        totalRevenue: calcChange(totalRevenue, totalRevenueLastWeek),
        totalRevenueMonth: calcChange(totalRevenue, totalRevenueLastMonth),
        totalRevenueYear: calcChange(totalRevenue, totalRevenueLastYear),
        totalUsers: calcChange(totalUsers, totalUsersLastWeek),
        totalUsersMonth: calcChange(totalUsers, totalUsersLastMonth),
        totalUsersYear: calcChange(totalUsers, totalUsersLastYear),
        newUsers: calcChange(newUsers, newUsersLastWeek),
        newUsersMonth: calcChange(newUsers, newUsersLastMonth),
        newUsersYear: calcChange(newUsers, newUsersLastYear),
        totalProducts,
        totalShops,
        averageDeliveryTime,
        longestDeliveryTime,
        shortestDeliveryTime,
        topProducts,
        usersTimeSeries,
        paymentsTimeSeries
      };
    }
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
});

export default router; 