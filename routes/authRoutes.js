import express from 'express';
import {
  // Public
  loginUser,
  registerStaff,
  registerCustomer,
  // Protected (Any logged in user)
  getProfile,
  updateProfile,
  changePassword,
  // Admin Only
  getAllUsers,
  getPendingStaff,
  verifyStaff,
  rejectStaff,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getAllCustomers,
  getAllStaff,
  getUserStats
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { loginValidator, registerValidator } from '../utils/validators.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/login', loginValidator, loginUser);
router.post('/register/staff', registerValidator, registerStaff);
router.post('/register/customer', registerValidator, registerCustomer);

// ==================== PROTECTED ROUTES (Any Logged In User) ====================
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// ==================== ADMIN ONLY ROUTES ====================
// User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.patch('/users/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.patch('/users/:id/reset-password', protect, adminOnly, resetUserPassword);

// Staff Management
router.get('/staff', protect, adminOnly, getAllStaff);
router.get('/pending-staff', protect, adminOnly, getPendingStaff);
router.patch('/verify-staff/:id', protect, adminOnly, verifyStaff);
router.delete('/reject-staff/:id', protect, adminOnly, rejectStaff);

// Customer Management
router.get('/customers', protect, adminOnly, getAllCustomers);

// Stats
router.get('/stats', protect, adminOnly, getUserStats);

export default router;