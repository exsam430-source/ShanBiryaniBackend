import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Import models
import User from './models/User.js';
import Category from './models/Category.js';
import MenuItem from './models/MenuItem.js';
import Settings from './models/Settings.js';
import Order from './models/Order.js';
import Bill from './models/Bill.js';

// Sample Categories
const categories = [
  { name: 'Biryani', description: 'Authentic Pakistani Biryanis', sortOrder: 1, isActive: true },
  { name: 'Karahi', description: 'Traditional Karahi dishes', sortOrder: 2, isActive: true },
  { name: 'BBQ', description: 'Grilled and BBQ items', sortOrder: 3, isActive: true },
  { name: 'Rice', description: 'Rice dishes', sortOrder: 4, isActive: true },
  { name: 'Drinks', description: 'Beverages and refreshments', sortOrder: 5, isActive: true },
  { name: 'Desserts', description: 'Sweet treats', sortOrder: 6, isActive: true }
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
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: 'Mutton Biryani',
    description: 'Premium mutton cooked with aged basmati rice and signature spices',
    price: 450,
    categoryName: 'Biryani',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: 'Beef Biryani',
    description: 'Succulent beef pieces with fragrant rice and aromatic spices',
    price: 400,
    categoryName: 'Biryani',
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 30,
    isAvailable: true
  },
  {
    name: 'Chicken Karahi',
    description: 'Wok-tossed chicken with tomatoes, green chilies and fresh coriander',
    price: 800,
    categoryName: 'Karahi',
    isSpicy: true,
    spicyLevel: 4,
    featured: true,
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: 'Mutton Karahi',
    description: 'Tender mutton cooked in traditional karahi style',
    price: 1200,
    categoryName: 'Karahi',
    isSpicy: true,
    spicyLevel: 4,
    preparationTime: 25,
    isAvailable: true
  },
  {
    name: 'Seekh Kebab',
    description: 'Minced meat skewers with herbs and spices, grilled to perfection',
    price: 400,
    categoryName: 'BBQ',
    isSpicy: true,
    spicyLevel: 2,
    preparationTime: 15,
    isAvailable: true
  },
  {
    name: 'Chicken Tikka',
    description: 'Marinated chicken pieces grilled in tandoor',
    price: 350,
    categoryName: 'BBQ',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 15,
    isAvailable: true
  },
  {
    name: 'Pulao',
    description: 'Fragrant rice cooked with mild spices',
    price: 250,
    categoryName: 'Rice',
    isSpicy: false,
    spicyLevel: 1,
    preparationTime: 20,
    isAvailable: true
  },
  {
    name: 'Raita',
    description: 'Yogurt with cucumber and spices',
    price: 80,
    categoryName: 'Rice',
    isSpicy: false,
    spicyLevel: 0,
    preparationTime: 5,
    isAvailable: true,
    isVegetarian: true
  },
  {
    name: 'Lassi',
    description: 'Traditional sweet yogurt drink',
    price: 100,
    categoryName: 'Drinks',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 5,
    isAvailable: true
  },
  {
    name: 'Soft Drinks',
    description: 'Chilled beverages',
    price: 60,
    categoryName: 'Drinks',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 2,
    isAvailable: true
  },
  {
    name: 'Kheer',
    description: 'Traditional rice pudding with cardamom and nuts',
    price: 150,
    categoryName: 'Desserts',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 5,
    isAvailable: true
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
    preparationTime: 5,
    isAvailable: true
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+, but kept for compatibility
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error(`❌ Error disconnecting: ${error.message}`);
  }
};

// Seed Database
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Settings.deleteMany({});
    await Order.deleteMany({});
    await Bill.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shanbiryani.com';
    
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+92 300 1234567',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created`);

    // Create category map for reference
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create menu items with category references
    const menuItemsWithCategory = menuItems.map(item => {
      const { categoryName, ...rest } = item;
      return {
        ...rest,
        category: categoryMap[categoryName],
        stock: 100,
        lowStockThreshold: 10
      };
    });

    const createdMenuItems = await MenuItem.insertMany(menuItemsWithCategory);
    console.log(`✅ ${createdMenuItems.length} menu items created`);

    // Create settings
    await Settings.create(defaultSettings);
    console.log('✅ Default settings created');

    // Print summary
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('─'.repeat(50));
    console.log('🔐 ADMIN ACCOUNT:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('─'.repeat(50));
    console.log('\n📊 DATA CREATED:');
    console.log(`   • 1 Admin User`);
    console.log(`   • ${createdCategories.length} Categories`);
    console.log(`   • ${createdMenuItems.length} Menu Items`);
    console.log(`   • 1 Settings Configuration`);
    console.log('─'.repeat(50));
    console.log('\n📝 NOTES:');
    console.log('   • Staff can register via /api/auth/register/staff');
    console.log('   • Staff needs admin approval before login');
    console.log('   • Customers can register via /api/auth/register/customer');
    console.log('   • Customers can also order as guest (no registration)');
    console.log('═'.repeat(50) + '\n');

    // Disconnect and exit
    await disconnectDB();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
};

// Clear Database
const clearDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🗑️  Clearing database...\n');
    
    const deletedUsers = await User.deleteMany({});
    const deletedCategories = await Category.deleteMany({});
    const deletedMenuItems = await MenuItem.deleteMany({});
    const deletedSettings = await Settings.deleteMany({});
    const deletedOrders = await Order.deleteMany({});
    const deletedBills = await Bill.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
    console.log('\n📊 DELETED:');
    console.log(`   • ${deletedUsers.deletedCount} Users`);
    console.log(`   • ${deletedCategories.deletedCount} Categories`);
    console.log(`   • ${deletedMenuItems.deletedCount} Menu Items`);
    console.log(`   • ${deletedSettings.deletedCount} Settings`);
    console.log(`   • ${deletedOrders.deletedCount} Orders`);
    console.log(`   • ${deletedBills.deletedCount} Bills\n`);
    
    await disconnectDB();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

// Seed only admin
const seedAdminOnly = async () => {
  try {
    await connectDB();
    
    console.log('\n👤 Creating admin user...\n');

    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Use forgot password or update directly in database.\n');
      await disconnectDB();
      process.exit(0);
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shanbiryani.com';
    
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+92 300 1234567',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}\n`);
    
    await disconnectDB();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

// Import sample data only (without clearing)
const importData = async () => {
  try {
    await connectDB();
    
    console.log('\n📥 Importing sample data...\n');

    // Check if data already exists
    const existingCategories = await Category.countDocuments();
    const existingMenuItems = await MenuItem.countDocuments();
    
    if (existingCategories > 0 || existingMenuItems > 0) {
      console.log('⚠️  Data already exists!');
      console.log(`   Categories: ${existingCategories}`);
      console.log(`   Menu Items: ${existingMenuItems}`);
      console.log('\n   Use "npm run seed:destroy" first to clear data.\n');
      await disconnectDB();
      process.exit(0);
    }

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories imported`);

    // Create category map
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create menu items
    const menuItemsWithCategory = menuItems.map(item => {
      const { categoryName, ...rest } = item;
      return {
        ...rest,
        category: categoryMap[categoryName],
        stock: 100,
        lowStockThreshold: 10
      };
    });

    const createdMenuItems = await MenuItem.insertMany(menuItemsWithCategory);
    console.log(`✅ ${createdMenuItems.length} menu items imported`);

    // Create settings if not exists
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create(defaultSettings);
      console.log('✅ Default settings imported');
    }

    console.log('\n🎉 Data import completed!\n');
    
    await disconnectDB();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

// Show help
const showHelp = () => {
  console.log('\n📖 SEEDER USAGE:');
  console.log('═'.repeat(50));
  console.log('  npm run seed          - Seed full database (clears existing)');
  console.log('  npm run seed:destroy  - Clear all data');
  console.log('  npm run seed:admin    - Create admin user only');
  console.log('  npm run seed:import   - Import data without clearing');
  console.log('  npm run seed:help     - Show this help message');
  console.log('═'.repeat(50) + '\n');
  process.exit(0);
};

// Parse command line arguments and run appropriate function
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '-d':
  case '--destroy':
  case 'destroy':
    clearDatabase();
    break;
  case '-a':
  case '--admin':
  case 'admin':
    seedAdminOnly();
    break;
  case '-i':
  case '--import':
  case 'import':
    importData();
    break;
  case '-h':
  case '--help':
  case 'help':
    showHelp();
    break;
  default:
    seedDatabase();
}