import express from 'express';
import {
  getDashboardOverview,
  getSalesAnalytics,
  getRecentOrders,
  getRecentBills,
  getLowStockItems,
  getCategorySales
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/', protect, adminOnly, getDashboardOverview);
router.get('/analytics', protect, adminOnly, getSalesAnalytics);
router.get('/recent-orders', protect, adminOnly, getRecentOrders);
router.get('/recent-bills', protect, adminOnly, getRecentBills);
router.get('/low-stock', protect, adminOnly, getLowStockItems);
router.get('/category-sales', protect, adminOnly, getCategorySales);

export default router;