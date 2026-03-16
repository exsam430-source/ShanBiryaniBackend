import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getTodayOrders,
  getOrdersByStatus,
  getCustomerOrders
} from '../controllers/orderController.js';
import { protect, adminOnly, staffAccess, optionalAuth } from '../middleware/authMiddleware.js';
import { orderValidator, mongoIdValidator } from '../utils/validators.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Guest checkout - optionalAuth to capture logged-in customer
router.post('/', optionalAuth, orderValidator, createOrder);

// Track order (public)
router.get('/track/:orderNumber', trackOrder);

// ==================== CUSTOMER ROUTES ====================
router.get('/my-orders', protect, getMyOrders);

// ==================== STAFF/ADMIN ROUTES ====================
router.get('/', protect, staffAccess, getOrders);
router.get('/today', protect, staffAccess, getTodayOrders);
router.get('/status/:status', protect, staffAccess, getOrdersByStatus);
router.get('/customer/:phone', protect, staffAccess, getCustomerOrders);
router.get('/:id', protect, staffAccess, mongoIdValidator, getOrderById);
router.patch('/:id/status', protect, staffAccess, mongoIdValidator, updateOrderStatus);
router.patch('/:id/payment', protect, staffAccess, mongoIdValidator, updatePaymentStatus);

// ==================== ADMIN ONLY ROUTES ====================
router.delete('/:id', protect, adminOnly, mongoIdValidator, deleteOrder);

export default router;