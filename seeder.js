import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';
import Settings from './models/Settings.js';
import Order from './models/Order.js';
import Bill from './models/Bill.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Sample Categories
const categories = [
  { name: 'Biryani', description: 'Authentic Pakistani Biryanis', sortOrder: 1 },
  { name: 'Karahi', description: 'Traditional Karahi dishes', sortOrder: 2 },
  { name: 'BBQ', description: 'Grilled and BBQ items', sortOrder: 3 },
  { name: 'Rice', description: 'Rice dishes', sortOrder: 4 },
  { name: 'Drinks', description: 'Beverages and refreshments', sortOrder: 5 },
  { name: 'Desserts', description: 'Sweet treats', sortOrder: 6 }
];

// Sample Menu Items
const menuItems = [
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces, infused with traditional spices',
    price: 350,
    categoryName: 'Biryani',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 25
  },
  {
    name: 'Mutton Biryani',
    description: 'Premium mutton cooked with aged basmati rice and signature spices',
    price: 450,
    categoryName: 'Biryani',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 30
  },
  {
    name: 'Beef Biryani',
    description: 'Succulent beef pieces with fragrant rice and aromatic spices',
    price: 400,
    categoryName: 'Biryani',
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 30
  },
  {
    name: 'Chicken Karahi',
    description: 'Wok-tossed chicken with tomatoes, green chilies and fresh coriander',
    price: 800,
    categoryName: 'Karahi',
    isSpicy: true,
    spicyLevel: 4,
    featured: true,
    preparationTime: 20
  },
  {
    name: 'Mutton Karahi',
    description: 'Tender mutton cooked in traditional karahi style',
    price: 1200,
    categoryName: 'Karahi',
    isSpicy: true,
    spicyLevel: 4,
    preparationTime: 25
  },
  {
    name: 'Seekh Kebab',
    description: 'Minced meat skewers with herbs and spices, grilled to perfection',
    price: 400,
    categoryName: 'BBQ',
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 15
  },
  {
    name: 'Chicken Tikka',
    description: 'Marinated chicken pieces grilled in tandoor',
    price: 350,
    categoryName: 'BBQ',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 15
  },
  {
    name: 'Pulao',
    description: 'Fragrant rice cooked with mild spices',
    price: 250,
    categoryName: 'Rice',
    isSpicy: false,
    spicyLevel: 1,
    preparationTime: 20
  },
  {
    name: 'Raita',
    description: 'Yogurt with cucumber and spices',
    price: 80,
    categoryName: 'Rice',
    isSpicy: false,
    spicyLevel: 0,
    preparationTime: 5
  },
  {
    name: 'Lassi',
    description: 'Traditional sweet yogurt drink',
    price: 100,
    categoryName: 'Drinks',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 5
  },
  {
    name: 'Soft Drinks',
    description: 'Chilled beverages',
    price: 60,
    categoryName: 'Drinks',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 2
  },
  {
    name: 'Kheer',
    description: 'Traditional rice pudding with cardamom and nuts',
    price: 150,
    categoryName: 'Desserts',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 5
  },
  {
    name: 'Gulab Jamun',
    description: 'Deep-fried milk dumplings in sugar syrup',
    price: 120,
    categoryName: 'Desserts',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    featured: true,
    preparationTime: 5
  }
];

// Default Settings
const defaultSettings = {
  restaurantName: 'Shan Biryani',
  tagline: 'Where Every Grain Tells a Story',
  description: 'Premium Desi Restaurant serving authentic Pakistani cuisine with traditional flavors and modern presentation.',
  address: {
    street: '123 Food Street',
    city: 'Karachi',
    state: 'Sindh',
    zipCode: '75500',
    country: 'Pakistan',
    fullAddress: '123 Food Street, Karachi, Sindh, Pakistan'
  },
  contact: {
    phone: '+92 300 1234567',
    altPhone: '+92 21 1234567',
    email: 'info@shanbiryani.com',
    whatsapp: '+92 300 1234567'
  },
  socialMedia: {
    facebook: 'https://facebook.com/shanbiryani',
    instagram: 'https://instagram.com/shanbiryani',
    twitter: '',
    youtube: ''
  },
  openingHours: {
    monday: { open: '11:00', close: '23:00', isClosed: false },
    tuesday: { open: '11:00', close: '23:00', isClosed: false },
    wednesday: { open: '11:00', close: '23:00', isClosed: false },
    thursday: { open: '11:00', close: '23:00', isClosed: false },
    friday: { open: '11:00', close: '23:00', isClosed: false },
    saturday: { open: '11:00', close: '23:00', isClosed: false },
    sunday: { open: '12:00', close: '22:00', isClosed: false }
  },
  orderSettings: {
    minOrderAmount: 200,
    deliveryCharges: 100,
    freeDeliveryAbove: 1000,
    estimatedDeliveryTime: 45,
    acceptingOrders: true
  },
  taxSettings: {
    enableTax: true,
    taxRate: 16,
    taxName: 'GST'
  },
  invoiceSettings: {
    showLogo: true,
    footerText: 'Thank you for dining with us! Visit again.',
    termsAndConditions: ''
  },
  currency: {
    symbol: 'Rs.',
    code: 'PKR',
    position: 'before'
  }
};

// Seed Database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await MenuItem.deleteMany();
    await Settings.deleteMany();
    await Order.deleteMany();
    await Bill.deleteMany();
    console.log('✅ Cleared existing data');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists. Skipping admin creation.');
    } else {
      // Create admin user (ONLY WAY TO CREATE ADMIN)
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
      const admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@shanbiryani.com',
        password: adminPassword,
        role: 'admin',
        phone: '+92 300 1234567',
        isVerified: true,
        isActive: true
      });
      console.log(`✅ Admin user created: ${admin.email}`);
      console.log(`   Password: ${adminPassword}`);
    }

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created`);

    // Create category map
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create menu items
    const menuItemsWithCategory = menuItems.map(item => ({
      ...item,
      category: categoryMap[item.categoryName],
      stock: 100,
      lowStockThreshold: 10
    }));

    // Remove categoryName before inserting
    const cleanMenuItems = menuItemsWithCategory.map(({ categoryName, ...item }) => item);
    const createdMenuItems = await MenuItem.insertMany(cleanMenuItems);
    console.log(`✅ ${createdMenuItems.length} menu items created`);

    // Create settings
    await Settings.create(defaultSettings);
    console.log('✅ Default settings created');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════');
    console.log('🔐 ADMIN (Only one - created via seeder)');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@shanbiryani.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
    console.log('═══════════════════════════════════════════════');
    console.log('📝 NOTES:');
    console.log('   - Staff can register via /api/auth/register/staff');
    console.log('   - Staff needs admin approval before login');
    console.log('   - Customers can register via /api/auth/register/customer');
    console.log('   - Customers can also order as guest (no registration)');
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Clear Database
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    await User.deleteMany();
    await Category.deleteMany();
    await MenuItem.deleteMany();
    await Settings.deleteMany();
    await Order.deleteMany();
    await Bill.deleteMany();
    
    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
};

// Seed only admin (if needed)
const seedAdminOnly = async () => {
  try {
    console.log('👤 Creating admin user...\n');

    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Use forgot password or update directly in database.');
      process.exit(0);
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@shanbiryani.com',
      password: adminPassword,
      role: 'admin',
      phone: '+92 300 1234567',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

// Run based on argument
if (process.argv[2] === '-d') {
  clearDatabase();
} else if (process.argv[2] === '-a' || process.argv[2] === '--admin') {
  seedAdminOnly();
} else {
  seedDatabase();
}