import express from 'express';
import {
  createBill,
  getBills,
  getBillById,
  getBillByNumber,
  updateBill,
  deleteBill,
  getTodayBills,
  getSalesReport,
  exportBills,
  markAsPrinted
} from '../controllers/billController.js';
import { protect, adminOnly, staffAccess } from '../middleware/authMiddleware.js';
import { billValidator, mongoIdValidator } from '../utils/validators.js';

const router = express.Router();

// Staff/Admin routes
router.post('/', protect, staffAccess, billValidator, createBill);
router.get('/', protect, staffAccess, getBills);
router.get('/today', protect, staffAccess, getTodayBills);
router.get('/number/:billNumber', protect, staffAccess, getBillByNumber);
router.get('/:id', protect, staffAccess, mongoIdValidator, getBillById);
router.patch('/:id/printed', protect, staffAccess, mongoIdValidator, markAsPrinted);

// Admin only routes
router.get('/report/sales', protect, adminOnly, getSalesReport);
router.get('/export/csv', protect, adminOnly, exportBills);
router.put('/:id', protect, adminOnly, mongoIdValidator, updateBill);
router.delete('/:id', protect, adminOnly, mongoIdValidator, deleteBill);

export default router;