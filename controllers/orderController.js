import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';

// @desc    Create new order (Guest or Logged-in Customer)
// @route   POST /api/orders
// @access  Public (Guest checkout) or Private (Logged-in customer)
export const createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(e => e.msg).join(', '));
  }

  const { customer, items, notes, orderType, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Get settings for tax and delivery charges
  const settings = await Settings.findOne();
  
  // Check if restaurant is accepting orders
  if (settings && !settings.orderSettings?.acceptingOrders) {
    res.status(400);
    throw new Error('Sorry, we are not accepting orders at the moment. Please try again later.');
  }

  const taxRate = settings?.taxSettings?.enableTax ? settings.taxSettings.taxRate : 0;
  const deliveryCharges = orderType === 'delivery' ? (settings?.orderSettings?.deliveryCharges || 0) : 0;

  // Calculate order items with prices
  let orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    
    if (!menuItem) {
      res.status(404);
      throw new Error(`Menu item not found: ${item.menuItem}`);
    }

    if (!menuItem.isAvailable) {
      res.status(400);
      throw new Error(`${menuItem.name} is currently unavailable`);
    }

    if (menuItem.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${menuItem.name}. Available: ${menuItem.stock}`);
    }

    const price = menuItem.discount > 0 
      ? menuItem.price - (menuItem.price * menuItem.discount / 100)
      : menuItem.price;
    
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: price,
      quantity: item.quantity,
      subtotal: itemSubtotal
    });

    // Update stock
    menuItem.stock -= item.quantity;
    await menuItem.save();
  }

  // Check minimum order amount
  if (settings?.orderSettings?.minOrderAmount && subtotal < settings.orderSettings.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is Rs. ${settings.orderSettings.minOrderAmount}`);
  }

  // Free delivery check
  let finalDeliveryCharges = deliveryCharges;
  if (settings?.orderSettings?.freeDeliveryAbove && subtotal >= settings.orderSettings.freeDeliveryAbove) {
    finalDeliveryCharges = 0;
  }

  // Calculate tax and total
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax + finalDeliveryCharges;

  // Create order data
  const orderData = {
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address
    },
    items: orderItems,
    subtotal,
    tax,
    taxRate,
    deliveryCharges: finalDeliveryCharges,
    total,
    orderType: orderType || 'delivery',
    paymentMethod: paymentMethod || 'cash',
    notes,
    statusHistory: [{ status: 'pending', timestamp: new Date() }]
  };

  // If logged-in customer, link the order
  if (req.user && req.user.role === 'customer') {
    orderData.customerId = req.user._id;
  }

  const order = await Order.create(orderData);

  // If logged-in customer, add order to their history
  if (req.user && req.user.role === 'customer') {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orderHistory: order._id }
    });
  }

  const populatedOrder = await Order.findById(order._id);

  res.status(201).json({
    success: true,
    data: populatedOrder,
    message: 'Order placed successfully! You can track your order with the order number.'
  });
});

// @desc    Get my orders (Logged-in Customer)
// @route   GET /api/orders/my-orders
// @access  Private/Customer
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customerId: req.user._id };

  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({
    success: true,
    count: orders.length,
    data: orders,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    orderType,
    paymentStatus,
    startDate,
    endDate,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (orderType) query.orderType = orderType;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('processedBy', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({
    success: true,
    count: orders.length,
    data: orders,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('processedBy', 'name')
    .populate('items.menuItem', 'name image');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Get order by order number (Public tracking)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .select('orderNumber status statusHistory items total customer.name createdAt estimatedDeliveryTime');

  if (!order) {
    res.status(404);
    throw new Error('Order not found. Please check your order number.');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Staff
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // If cancelling, restore stock
  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stock: item.quantity }
      });
    }
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user._id
  });
  order.processedBy = req.user._id;

  if (status === 'delivered') {
    order.actualDeliveryTime = new Date();
    order.paymentStatus = 'paid';
  }

  // Set estimated delivery time when confirmed
  if (status === 'confirmed' && !order.estimatedDeliveryTime) {
    const settings = await Settings.findOne();
    const deliveryMinutes = settings?.orderSettings?.estimatedDeliveryTime || 45;
    order.estimatedDeliveryTime = new Date(Date.now() + deliveryMinutes * 60 * 1000);
  }

  await order.save();

  res.json({
    success: true,
    data: order,
    message: `Order status updated to ${status}`
  });
});

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment
// @access  Private/Staff
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, paymentMethod } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;

  await order.save();

  res.json({
    success: true,
    data: order,
    message: 'Payment status updated'
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Restore stock if order was not delivered or cancelled
  if (!['delivered', 'cancelled'].includes(order.status)) {
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stock: item.quantity }
      });
    }
  }

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// @desc    Get today's orders
// @route   GET /api/orders/today
// @access  Private/Staff
export const getTodayOrders = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const orders = await Order.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ createdAt: -1 });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    outForDelivery: orders.filter(o => o.status === 'out-for-delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0)
  };

  res.json({
    success: true,
    stats,
    data: orders
  });
});

// @desc    Get orders by status
// @route   GET /api/orders/status/:status
// @access  Private/Staff
export const getOrdersByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;

  const orders = await Order.find({ status }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get customer orders by phone
// @route   GET /api/orders/customer/:phone
// @access  Private/Staff
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { phone } = req.params;

  const orders = await Order.find({ 'customer.phone': phone })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});