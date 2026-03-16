import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    image: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isSpicy: {
      type: Boolean,
      default: false
    },
    spicyLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15
    },
    stock: {
      type: Number,
      default: 100
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    featured: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    nutritionInfo: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Virtual for discounted price
menuItemSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price;
});

// Check low stock
menuItemSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Enable virtuals in JSON
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ featured: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;