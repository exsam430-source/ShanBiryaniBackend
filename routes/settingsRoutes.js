import express from 'express';
import {
  getSettings,
  getPublicSettings,
  updateSettings,
  updateLogo,
  updateOpeningHours,
  updateTaxSettings,
  updateOrderSettings,
  toggleAcceptingOrders
} from '../controllers/settingsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);

// Admin only routes
router.get('/', protect, adminOnly, getSettings);
router.put('/', protect, adminOnly, updateSettings);
router.put('/logo', protect, adminOnly, uploadSingle, updateLogo);
router.put('/opening-hours', protect, adminOnly, updateOpeningHours);
router.put('/tax', protect, adminOnly, updateTaxSettings);
router.put('/order', protect, adminOnly, updateOrderSettings);
router.patch('/toggle-orders', protect, adminOnly, toggleAcceptingOrders);

export default router;