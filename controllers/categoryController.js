import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const { active, search } = req.query;

  const query = {};

  if (active === 'true') query.isActive = true;
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });

  // Get item count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const itemCount = await MenuItem.countDocuments({ 
        category: category._id,
        isAvailable: true 
      });
      return {
        ...category.toObject(),
        itemCount
      };
    })
  );

  res.json({
    success: true,
    count: categories.length,
    data: categoriesWithCount
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Get items in this category
  const items = await MenuItem.find({ 
    category: category._id,
    isAvailable: true 
  }).select('name price image');

  res.json({
    success: true,
    data: {
      ...category.toObject(),
      items
    }
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map(e => e.msg).join(', '));
  }

  const { name, description, sortOrder, isActive } = req.body;

  // Check if category exists
  const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    sortOrder: sortOrder || 0,
    isActive: isActive !== undefined ? isActive : true,
    image: req.file ? `/uploads/${req.file.filename}` : ''
  });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description, sortOrder, isActive } = req.body;

  // Check if name is taken by another category
  if (name && name !== category.name) {
    const nameExists = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (nameExists) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }

  category.name = name || category.name;
  category.description = description !== undefined ? description : category.description;
  category.sortOrder = sortOrder !== undefined ? sortOrder : category.sortOrder;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  
  if (req.file) {
    category.image = `/uploads/${req.file.filename}`;
  }

  const updatedCategory = await category.save();

  res.json({
    success: true,
    data: updatedCategory,
    message: 'Category updated successfully'
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has items
  const itemCount = await MenuItem.countDocuments({ category: req.params.id });
  if (itemCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category. It has ${itemCount} menu items. Please move or delete them first.`);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Toggle category status
// @route   PATCH /api/categories/:id/toggle-status
// @access  Private/Admin
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.isActive = !category.isActive;
  await category.save();

  res.json({
    success: true,
    data: { isActive: category.isActive },
    message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
export const reorderCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body; // Array of { id, sortOrder }

  if (!Array.isArray(categories)) {
    res.status(400);
    throw new Error('Categories array is required');
  }

  const updatePromises = categories.map(({ id, sortOrder }) =>
    Category.findByIdAndUpdate(id, { sortOrder })
  );

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Categories reordered successfully'
  });
});