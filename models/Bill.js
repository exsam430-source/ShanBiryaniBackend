// backend/models/Bill.js - Update billItemSchema to include unit
import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01
    },
    unit: {
      type: String,
      enum: ['piece', 'kg', 'gram', 'dozen', 'plate', 'box', 'pack', 'bottle', 'litre', 'half', 'full', 'small', 'medium', 'large', 'regular', 'family', 'crate', 'bundle'],
      default: 'piece'
    },
    subtotal: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    isCustom: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    items: [billItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    serviceCharges: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'split'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'refunded'],
      default: 'paid'
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    changeAmount: {
      type: Number,
      default: 0
    },
    customerName: {
      type: String,
      trim: true
    },
    customerPhone: {
      type: String,
      trim: true
    },
    tableNumber: {
      type: String,
      trim: true
    },
    billType: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery', 'counter'],
      default: 'counter'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    isPrinted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Generate bill number before saving
billSchema.pre('save', async function () {
  if (!this.billNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Bill').countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    this.billNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  
});

// Indexes
billSchema.index({ createdAt: -1 });
billSchema.index({ createdBy: 1 });
billSchema.index({ paymentStatus: 1 });


const Bill = mongoose.model('Bill', billSchema);

export default Bill;