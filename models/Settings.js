import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: 'Shan Biryani'
    },
    tagline: {
      type: String,
      default: 'Where Every Grain Tells a Story'
    },
    description: {
      type: String,
      default: 'Premium Desi Restaurant serving authentic Pakistani cuisine'
    },
    logo: {
      type: String,
      default: ''
    },
    favicon: {
      type: String,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'Pakistan' },
      fullAddress: { type: String, default: '' }
    },
    contact: {
      phone: { type: String, default: '' },
      altPhone: { type: String, default: '' },
      email: { type: String, default: '' },
      whatsapp: { type: String, default: '' }
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    openingHours: {
      monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
    },
    orderSettings: {
      minOrderAmount: { type: Number, default: 0 },
      deliveryCharges: { type: Number, default: 0 },
      freeDeliveryAbove: { type: Number, default: 0 },
      estimatedDeliveryTime: { type: Number, default: 30 }, // minutes
      acceptingOrders: { type: Boolean, default: true }
    },
    taxSettings: {
      enableTax: { type: Boolean, default: false },
      taxRate: { type: Number, default: 0 },
      taxName: { type: String, default: 'GST' }
    },
    invoiceSettings: {
      showLogo: { type: Boolean, default: true },
      footerText: { type: String, default: 'Thank you for dining with us!' },
      termsAndConditions: { type: String, default: '' }
    },
    currency: {
      symbol: { type: String, default: 'Rs.' },
      code: { type: String, default: 'PKR' },
      position: { type: String, enum: ['before', 'after'], default: 'before' }
    },
    theme: {
      primaryColor: { type: String, default: '#DC2626' },
      secondaryColor: { type: String, default: '#F59E0B' },
      darkMode: { type: Boolean, default: false }
    },
    seoSettings: {
      metaTitle: { type: String, default: 'Shan Biryani - Premium Pakistani Restaurant' },
      metaDescription: { type: String, default: '' },
      metaKeywords: [{ type: String }]
    }
  },
  {
    timestamps: true
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;