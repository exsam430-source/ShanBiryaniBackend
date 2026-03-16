import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    available,
    featured,
    vegetarian,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (available === 'true') query.isAvailable = true;
  if (available === 'false') query.isAvailable = false;
  if (featured === 'true') query.featured = true;
  if (vegetarian === 'true') query.isVegetarian = true;
  if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
  if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
  if (search) {
    query.$text = { $search: search };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await MenuItem.countDocuments(query);
  const items = await MenuItem.find(query)
    .populate('category', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({
    success: true,
    count: items.length,
    data: items,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('category', 'name');

  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  res.json({
    success: true,
    data: item
  });
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(e => e.msg).join(', '));
  }

  const {
    name,
    description,
    price,
    category,
    isAvailable,
    isVegetarian,
    isSpicy,
    spicyLevel,
    preparationTime,
    stock,
    lowStockThreshold,
    featured,
    discount,
    tags,
    nutritionInfo
  } = req.body;

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Invalid category');
  }

  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    category,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isVegetarian: isVegetarian || false,
    isSpicy: isSpicy || false,
    spicyLevel: spicyLevel || 0,
    preparationTime: preparationTime || 15,
    stock: stock || 100,
    lowStockThreshold: lowStockThreshold || 10,
    featured: featured || false,
    discount: discount || 0,
    tags: tags || [],
    nutritionInfo: nutritionInfo || {},
    image: req.file ? `/uploads/${req.file.filename}` : ''
  });

  const populatedItem = await MenuItem.findById(menuItem._id).populate('category', 'name');

  res.status(201).json({
    success: true,
    data: populatedItem,
    message: 'Menu item created successfully'
  });
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = asyncHandler(async (req, res) => {
  let menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  const {
    name,
    description,
    price,
    category,
    isAvailable,
    isVegetarian,
    isSpicy,
    spicyLevel,
    preparationTime,
    stock,
    lowStockThreshold,
    featured,
    discount,
    tags,
    nutritionInfo
  } = req.body;

  // Check if category exists
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error('Invalid category');
    }
  }

  menuItem.name = name || menuItem.name;
  menuItem.description = description !== undefined ? description : menuItem.description;
  menuItem.price = price !== undefined ? price : menuItem.price;
  menuItem.category = category || menuItem.category;
  menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
  menuItem.isVegetarian = isVegetarian !== undefined ? isVegetarian : menuItem.isVegetarian;
  menuItem.isSpicy = isSpicy !== undefined ? isSpicy : menuItem.isSpicy;
  menuItem.spicyLevel = spicyLevel !== undefined ? spicyLevel : menuItem.spicyLevel;
  menuItem.preparationTime = preparationTime !== undefined ? preparationTime : menuItem.preparationTime;
  menuItem.stock = stock !== undefined ? stock : menuItem.stock;
  menuItem.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : menuItem.lowStockThreshold;
  menuItem.featured = featured !== undefined ? featured : menuItem.featured;
  menuItem.discount = discount !== undefined ? discount : menuItem.discount;
  menuItem.tags = tags || menuItem.tags;
  menuItem.nutritionInfo = nutritionInfo || menuItem.nutritionInfo;

  if (req.file) {
    menuItem.image = `/uploads/${req.file.filename}`;
  }

  const updatedItem = await menuItem.save();
  const populatedItem = await MenuItem.findById(updatedItem._id).populate('category', 'name');

  res.json({
    success: true,
    data: populatedItem,
    message: 'Menu item updated successfully'
  });
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  await MenuItem.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/toggle-availability
// @access  Private/Admin
export const toggleAvailability = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  res.json({
    success: true,
    data: { isAvailable: menuItem.isAvailable },
    message: `Item ${menuItem.isAvailable ? 'available' : 'unavailable'} now`
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/menu/:id/toggle-featured
// @access  Private/Admin
export const toggleFeatured = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  menuItem.featured = !menuItem.featured;
  await menuItem.save();

  res.json({
    success: true,
    data: { featured: menuItem.featured },
    message: `Item ${menuItem.featured ? 'added to' : 'removed from'} featured`
  });
});

// @desc    Get featured items
// @route   GET /api/menu/featured
// @access  Public
export const getFeaturedItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ featured: true, isAvailable: true })
    .populate('category', 'name')
    .limit(8);

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get low stock items
// @route   GET /api/menu/low-stock
// @access  Private/Admin
export const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  }).populate('category', 'name');

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Update stock
// @route   PATCH /api/menu/:id/stock
// @access  Private/Admin
export const updateStock = asyncHandler(async (req, res) => {
  const { stock, action } = req.body; // action: 'set', 'add', 'subtract'

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  if (action === 'set') {
    menuItem.stock = stock;
  } else if (action === 'add') {
    menuItem.stock += stock;
  } else if (action === 'subtract') {
    menuItem.stock = Math.max(0, menuItem.stock - stock);
  } else {
    menuItem.stock = stock;
  }

  await menuItem.save();

  res.json({
    success: true,
    data: { stock: menuItem.stock },
    message: 'Stock updated successfully'
  });
});

// @desc    Get items by category
// @route   GET /api/menu/category/:categoryId
// @access  Public
export const getItemsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const items = await MenuItem.find({ 
    category: categoryId, 
    isAvailable: true 
  }).populate('category', 'name');

  res.json({
    success: true,
    category: category.name,
    count: items.length,
    data: items
  });
});

// @desc    Search menu items
// @route   GET /api/menu/search
// @access  Public
export const searchMenuItems = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const items = await MenuItem.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ],
    isAvailable: true
  }).populate('category', 'name').limit(20);

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Bulk update menu items
// @route   PUT /api/menu/bulk-update
// @access  Private/Admin
export const bulkUpdateMenuItems = asyncHandler(async (req, res) => {
  const { ids, update } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Item IDs array is required');
  }

  const result = await MenuItem.updateMany(
    { _id: { $in: ids } },
    { $set: update }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} items updated successfully`
  });
});

// @desc    Bulk delete menu items
// @route   DELETE /api/menu/bulk-delete
// @access  Private/Admin
export const bulkDeleteMenuItems = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Item IDs array is required');
  }

  const result = await MenuItem.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `${result.deletedCount} items deleted successfully`
  });
});