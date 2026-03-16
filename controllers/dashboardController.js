import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Bill from '../models/Bill.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  // Get today's stats
  const todayOrders = await Order.find({
    createdAt: { $gte: startOfToday, $lte: endOfToday }
  });

  const todayBills = await Bill.find({
    createdAt: { $gte: startOfToday, $lte: endOfToday }
  });

  // Total counts
  const totalOrders = await Order.countDocuments();
  const totalMenuItems = await MenuItem.countDocuments();
  const totalCategories = await Category.countDocuments();
  const totalUsers = await User.countDocuments();

  // Revenue calculations
  const todaySales = todayBills.reduce((acc, bill) => acc + bill.grandTotal, 0);
  const todayOrderRevenue = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  // All time revenue
  const allBills = await Bill.find({ paymentStatus: 'paid' });
  const totalRevenue = allBills.reduce((acc, bill) => acc + bill.grandTotal, 0);

  // Order status breakdown
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Pending orders
  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  // Low stock items
  const lowStockItems = await MenuItem.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  }).countDocuments();

  res.json({
    success: true,
    data: {
      today: {
        orders: todayOrders.length,
        sales: todaySales,
        orderRevenue: todayOrderRevenue,
        bills: todayBills.length
      },
      totals: {
        orders: totalOrders,
        menuItems: totalMenuItems,
        categories: totalCategories,
        users: totalUsers,
        revenue: totalRevenue
      },
      alerts: {
        pendingOrders,
        lowStockItems
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    }
  });
});

// @desc    Get sales analytics
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  // Daily sales for the period
  const dailySales = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalSales: { $sum: '$grandTotal' },
        totalBills: { $sum: 1 },
        avgOrderValue: { $avg: '$grandTotal' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top selling items
  const topSellingItems = await Bill.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]);

  // Sales by payment method
  const salesByPaymentMethod = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        totalSales: { $sum: '$grandTotal' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Sales by bill type
  const salesByBillType = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: '$billType',
        totalSales: { $sum: '$grandTotal' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Peak hours
  const peakHours = await Bill.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
        totalSales: { $sum: '$grandTotal' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      dailySales,
      topSellingItems,
      salesByPaymentMethod,
      salesByBillType,
      peakHours
    }
  });
});

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
export const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('orderNumber customer.name total status createdAt');

  res.json({
    success: true,
    data: orders
  });
});

// @desc    Get recent bills
// @route   GET /api/dashboard/recent-bills
// @access  Private/Admin
export const getRecentBills = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const bills = await Bill.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('createdBy', 'name')
    .select('billNumber grandTotal paymentMethod createdAt createdBy');

  res.json({
    success: true,
    data: bills
  });
});

// @desc    Get low stock items
// @route   GET /api/dashboard/low-stock
// @access  Private/Admin
export const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  })
    .populate('category', 'name')
    .select('name stock lowStockThreshold category image');

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get category wise sales
// @route   GET /api/dashboard/category-sales
// @access  Private/Admin
export const getCategorySales = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  // Get all items with their categories
  const items = await MenuItem.find().populate('category', 'name');
  const itemCategoryMap = {};
  items.forEach(item => {
    itemCategoryMap[item.name] = item.category?.name || 'Uncategorized';
  });

  // Aggregate sales by item
  const salesByItem = await Bill.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' }
      }
    }
  ]);

  // Group by category
  const categorySales = {};
  salesByItem.forEach(item => {
    const category = itemCategoryMap[item._id] || 'Uncategorized';
    if (!categorySales[category]) {
      categorySales[category] = { totalQuantity: 0, totalRevenue: 0 };
    }
    categorySales[category].totalQuantity += item.totalQuantity;
    categorySales[category].totalRevenue += item.totalRevenue;
  });

  const result = Object.entries(categorySales).map(([category, data]) => ({
    category,
    ...data
  }));

  res.json({
    success: true,
    data: result
  });
});