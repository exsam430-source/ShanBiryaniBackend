import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { categoryValidator, mongoIdValidator } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', mongoIdValidator, getCategoryById);

// Admin only routes
router.post('/', protect, adminOnly, uploadSingle, categoryValidator, createCategory);
router.put('/reorder', protect, adminOnly, reorderCategories);
router.put('/:id', protect, adminOnly, mongoIdValidator, uploadSingle, updateCategory);
router.delete('/:id', protect, adminOnly, mongoIdValidator, deleteCategory);
router.patch('/:id/toggle-status', protect, adminOnly, mongoIdValidator, toggleCategoryStatus);

export default router;