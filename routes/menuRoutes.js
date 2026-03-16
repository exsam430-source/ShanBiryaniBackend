import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  toggleFeatured,
  getFeaturedItems,
  getLowStockItems,
  updateStock,
  getItemsByCategory,
  searchMenuItems,
  bulkUpdateMenuItems,
  bulkDeleteMenuItems
} from '../controllers/menuController.js';
import { protect, adminOnly, staffAccess } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { menuItemValidator, mongoIdValidator } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/featured', getFeaturedItems);
router.get('/search', searchMenuItems);
router.get('/category/:categoryId', getItemsByCategory);
router.get('/:id', mongoIdValidator, getMenuItemById);

// Staff/Admin routes
router.get('/admin/low-stock', protect, staffAccess, getLowStockItems);

// Admin only routes
router.post('/', protect, adminOnly, uploadSingle, menuItemValidator, createMenuItem);
router.put('/bulk-update', protect, adminOnly, bulkUpdateMenuItems);
router.delete('/bulk-delete', protect, adminOnly, bulkDeleteMenuItems);
router.put('/:id', protect, adminOnly, mongoIdValidator, uploadSingle, updateMenuItem);
router.delete('/:id', protect, adminOnly, mongoIdValidator, deleteMenuItem);
router.patch('/:id/toggle-availability', protect, adminOnly, mongoIdValidator, toggleAvailability);
router.patch('/:id/toggle-featured', protect, adminOnly, mongoIdValidator, toggleFeatured);
router.patch('/:id/stock', protect, adminOnly, mongoIdValidator, updateStock);

export default router;