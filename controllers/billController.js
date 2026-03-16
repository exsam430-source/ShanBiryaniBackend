import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Bill from '../models/Bill.js';
import MenuItem from '../models/MenuItem.js';
import Settings from '../models/Settings.js';
import { Parser } from 'json2csv';

// @desc    Create new bill (POS)
// @route   POST /api/bills
// @access  Private/Staff
export const createBill = asyncHandler(async (req, res) => {
  const {
    items,
    discount = 0,
    discountType = 'fixed',
    paymentMethod = 'cash',
    paymentStatus = 'paid',
    customerName,
    customerPhone,
    tableNumber,
    billType = 'counter',
    amountPaid = 0,
    notes
  } = req.body;

  console.log('📝 Creating bill with items:', items?.length);

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No bill items provided');
  }

  // Get settings for tax
  let taxRate = 0;
  try {
    const settings = await Settings.findOne();
    taxRate = settings?.taxSettings?.enableTax ? settings.taxSettings.taxRate : 0;
  } catch (error) {
    console.log('Settings not found, using default tax rate');
  }

  // Calculate bill items
  let billItems = [];
  let subtotal = 0;

  for (const item of items) {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    billItems.push({
      menuItem: item.menuItem || null, // null for custom items
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: itemSubtotal
    });

    // Update stock only if menuItem exists (not custom item)
    if (item.menuItem && !item.isCustom) {
      try {
        await MenuItem.findByIdAndUpdate(item.menuItem, {
          $inc: { stock: -item.quantity }
        });
      } catch (error) {
        console.log('Could not update stock for item:', item.name);
      }
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount) {
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
  }

  // Calculate tax and grand total
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Calculate change
  const changeAmount = amountPaid ? Math.max(0, amountPaid - grandTotal) : 0;

  const bill = await Bill.create({
    items: billItems,
    subtotal,
    discount: discount || 0,
    discountType: discountType || 'fixed',
    discountAmount,
    taxRate,
    taxAmount,
    grandTotal,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: paymentStatus || (amountPaid >= grandTotal ? 'paid' : 'pending'),
    amountPaid: amountPaid || 0,
    changeAmount,
    customerName,
    customerPhone,
    tableNumber,
    billType: billType || 'counter',
    createdBy: req.user._id,
    notes
  });

  const populatedBill = await Bill.findById(bill._id)
    .populate('createdBy', 'name');

  console.log('✅ Bill created:', populatedBill.billNumber);

  res.status(201).json({
    success: true,
    data: populatedBill,
    message: 'Bill created successfully'
  });
});

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private/Staff
export const getBills = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    paymentStatus,
    paymentMethod,
    billType,
    createdBy,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (billType) query.billType = billType;
  if (createdBy) query.createdBy = createdBy;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  if (search) {
    query.$or = [
      { billNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Bill.countDocuments(query);
  const bills = await Bill.find(query)
    .populate('createdBy', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({
    success: true,
    count: bills.length,
    data: bills,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private/Staff
export const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('order');

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  // Get restaurant settings for invoice
  const settings = await Settings.findOne();

  res.json({
    success: true,
    data: bill,
    restaurant: {
      name: settings?.restaurantName || 'Shan Biryani',
      address: settings?.address?.fullAddress || '',
      phone: settings?.contact?.phone || '',
      email: settings?.contact?.email || '',
      logo: settings?.logo || '',
      footerText: settings?.invoiceSettings?.footerText || 'Thank you for dining with us!'
    }
  });
});

// @desc    Get bill by bill number
// @route   GET /api/bills/number/:billNumber
// @access  Private/Staff
export const getBillByNumber = asyncHandler(async (req, res) => {
  const bill = await Bill.findOne({ billNumber: req.params.billNumber })
    .populate('createdBy', 'name');

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  res.json({
    success: true,
    data: bill
  });
});

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private/Admin
export const updateBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  const { paymentStatus, paymentMethod, amountPaid, notes } = req.body;

  if (paymentStatus) bill.paymentStatus = paymentStatus;
  if (paymentMethod) bill.paymentMethod = paymentMethod;
  if (amountPaid !== undefined) {
    bill.amountPaid = amountPaid;
    bill.changeAmount = Math.max(0, amountPaid - bill.grandTotal);
    if (amountPaid >= bill.grandTotal) {
      bill.paymentStatus = 'paid';
    }
  }
  if (notes !== undefined) bill.notes = notes;

  await bill.save();

  res.json({
    success: true,
    data: bill,
    message: 'Bill updated successfully'
  });
});

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private/Admin
export const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  // Restore stock
  for (const item of bill.items) {
    if (item.menuItem) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stock: item.quantity }
      });
    }
  }

  await Bill.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Bill deleted successfully'
  });
});

// @desc    Get today's bills
// @route   GET /api/bills/today
// @access  Private/Staff
export const getTodayBills = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const bills = await Bill.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  const stats = {
    totalBills: bills.length,
    totalRevenue: bills.reduce((acc, b) => acc + b.grandTotal, 0),
    cashPayments: bills.filter(b => b.paymentMethod === 'cash').reduce((acc, b) => acc + b.grandTotal, 0),
    cardPayments: bills.filter(b => b.paymentMethod === 'card').reduce((acc, b) => acc + b.grandTotal, 0),
    onlinePayments: bills.filter(b => b.paymentMethod === 'online').reduce((acc, b) => acc + b.grandTotal, 0),
    totalDiscount: bills.reduce((acc, b) => acc + b.discountAmount, 0),
    totalTax: bills.reduce((acc, b) => acc + b.taxAmount, 0)
  };

  res.json({
    success: true,
    stats,
    data: bills
  });
});

// @desc    Get sales report
// @route   GET /api/bills/report
// @access  Private/Admin
export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : new Date();

  const bills = await Bill.find({
    createdAt: { $gte: start, $lte: end },
    paymentStatus: 'paid'
  });

  // Group by date
  const groupedData = {};
  
  bills.forEach(bill => {
    let key;
    const date = new Date(bill.createdAt);
    
    if (groupBy === 'day') {
      key = date.toISOString().slice(0, 10);
    } else if (groupBy === 'month') {
      key = date.toISOString().slice(0, 7);
    } else if (groupBy === 'year') {
      key = date.getFullYear().toString();
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        date: key,
        totalBills: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        totalTax: 0
      };
    }

    groupedData[key].totalBills++;
    groupedData[key].totalRevenue += bill.grandTotal;
    groupedData[key].totalDiscount += bill.discountAmount;
    groupedData[key].totalTax += bill.taxAmount;
  });

  const report = Object.values(groupedData).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const summary = {
    totalBills: bills.length,
    totalRevenue: bills.reduce((acc, b) => acc + b.grandTotal, 0),
    totalDiscount: bills.reduce((acc, b) => acc + b.discountAmount, 0),
    totalTax: bills.reduce((acc, b) => acc + b.taxAmount, 0),
    averageOrderValue: bills.length > 0 
      ? bills.reduce((acc, b) => acc + b.grandTotal, 0) / bills.length 
      : 0
  };

  res.json({
    success: true,
    dateRange: { start, end },
    summary,
    data: report
  });
});

// @desc    Export bills to CSV
// @route   GET /api/bills/export
// @access  Private/Admin
export const exportBills = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  const bills = await Bill.find(query)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  const csvData = bills.map(bill => ({
    'Bill Number': bill.billNumber,
    'Date': new Date(bill.createdAt).toLocaleString(),
    'Customer Name': bill.customerName || 'N/A',
    'Customer Phone': bill.customerPhone || 'N/A',
    'Table': bill.tableNumber || 'N/A',
    'Bill Type': bill.billType,
    'Subtotal': bill.subtotal,
    'Discount': bill.discountAmount,
    'Tax': bill.taxAmount,
    'Grand Total': bill.grandTotal,
    'Payment Method': bill.paymentMethod,
    'Payment Status': bill.paymentStatus,
    'Created By': bill.createdBy?.name || 'N/A'
  }));

  const parser = new Parser();
  const csv = parser.parse(csvData);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=bills_${Date.now()}.csv`);
  res.send(csv);
});

// @desc    Mark bill as printed
// @route   PATCH /api/bills/:id/printed
// @access  Private/Staff
export const markAsPrinted = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  bill.isPrinted = true;
  await bill.save();

  res.json({
    success: true,
    message: 'Bill marked as printed'
  });
});