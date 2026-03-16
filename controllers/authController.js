// backend/controllers/authController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ==================== PUBLIC ROUTES ====================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt for:', email);

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    console.log('❌ User not found:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    console.log('❌ Password mismatch for:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if user can login
  const loginCheck = user.canLogin();
  if (!loginCheck.allowed) {
    console.log('❌ Login not allowed:', loginCheck.message);
    res.status(403);
    throw new Error(loginCheck.message);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id, user.role);

  console.log('✅ Login successful for:', email);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      isVerified: user.isVerified,
      token: token
    },
    message: 'Login successful'
  });
});

// @desc    Register Customer
// @route   POST /api/auth/register/customer
// @access  Public
export const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  console.log('📝 Customer registration for:', email);

  // Validate input
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    console.log('❌ User already exists:', email);
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create customer
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    address,
    role: 'customer',
    isVerified: true,
    isActive: true
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  console.log('✅ Customer registered:', email);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      isVerified: user.isVerified,
      token: token
    },
    message: 'Registration successful'
  });
});

// @desc    Register Staff
// @route   POST /api/auth/register/staff
// @access  Public
export const registerStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  console.log('📝 Staff registration for:', email);

  // Validate input
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create staff (needs verification)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: 'staff',
    isVerified: false,
    isActive: true
  });

  console.log('✅ Staff registered (pending verification):', email);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    message: 'Staff registration successful. Please wait for admin approval.'
  });
});

// ==================== PROTECTED ROUTES ====================

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;

  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = req.body.email.toLowerCase();
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address
    },
    message: 'Profile updated successfully'
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// ==================== ADMIN ONLY ROUTES ====================

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search, isActive, isVerified } = req.query;

  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get all staff
// @route   GET /api/auth/staff
// @access  Private/Admin
export const getAllStaff = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isVerified } = req.query;

  const query = { role: 'staff' };

  if (isVerified !== undefined) {
    query.isVerified = isVerified === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const staff = await User.find(query)
    .select('-password')
    .populate('verifiedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({
    success: true,
    data: staff,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get pending staff
// @route   GET /api/auth/pending-staff
// @access  Private/Admin
export const getPendingStaff = asyncHandler(async (req, res) => {
  const pendingStaff = await User.find({
    role: 'staff',
    isVerified: false,
    isActive: true
  }).select('-password').sort({ createdAt: -1 });

  res.json({
    success: true,
    count: pendingStaff.length,
    data: pendingStaff
  });
});

// @desc    Verify staff
// @route   PATCH /api/auth/verify-staff/:id
// @access  Private/Admin
export const verifyStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'staff') {
    res.status(400);
    throw new Error('This user is not a staff member');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Staff is already verified');
  }

  user.isVerified = true;
  user.verifiedBy = req.user._id;
  user.verifiedAt = new Date();
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      verifiedAt: user.verifiedAt
    },
    message: `Staff "${user.name}" has been verified`
  });
});

// @desc    Reject staff
// @route   DELETE /api/auth/reject-staff/:id
// @access  Private/Admin
export const rejectStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'staff') {
    res.status(400);
    throw new Error('This user is not a staff member');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Cannot reject already verified staff');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: `Staff registration for "${user.name}" has been rejected`
  });
});

// @desc    Get all customers
// @route   GET /api/auth/customers
// @access  Private/Admin
export const getAllCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = { role: 'customer' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const customers = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  res.json({
    success: true,
    data: customers,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('verifiedBy', 'name email');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin' && req.body.role && req.body.role !== 'admin') {
    res.status(400);
    throw new Error('Cannot change admin role');
  }

  const { name, email, phone, address, role, isActive } = req.body;

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  user.name = name || user.name;
  user.email = email ? email.toLowerCase() : user.email;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  
  if (role && user.role !== 'admin') {
    user.role = role;
    if (role === 'customer') {
      user.isVerified = true;
    }
  }
  
  if (isActive !== undefined) user.isActive = isActive;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.isVerified
    },
    message: 'User updated successfully'
  });
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin account');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Toggle user status
// @route   PATCH /api/auth/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot deactivate admin account');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: { isActive: user.isActive },
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Reset user password
// @route   PATCH /api/auth/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: `Password reset successful for ${user.name}`
  });
});

// @desc    Get user stats
// @route   GET /api/auth/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalStaff = await User.countDocuments({ role: 'staff' });
  const pendingStaff = await User.countDocuments({ role: 'staff', isVerified: false });
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCustomers,
      totalStaff,
      pendingStaff,
      activeUsers,
      inactiveUsers
    }
  });
});