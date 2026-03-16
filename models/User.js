// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer'
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: function() {
        return this.role !== 'staff';
      }
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    lastLogin: {
      type: Date
    },
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }]
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving - Modern Mongoose (No next())
userSchema.pre('save', async function () {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) {
    return; // Just return, don't hash
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user can login
userSchema.methods.canLogin = function () {
  if (!this.isActive) {
    return { allowed: false, message: 'Your account has been deactivated. Please contact admin.' };
  }
  if (this.role === 'staff' && !this.isVerified) {
    return { allowed: false, message: 'Your account is pending approval. Please wait for admin verification.' };
  }
  return { allowed: true };
};

const User = mongoose.model('User', userSchema);

export default User;