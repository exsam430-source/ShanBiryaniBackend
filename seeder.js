// backend/seeder.js
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

// Sample Categories with images
const categories = [
  { 
    name: 'Biryani', 
    description: 'Authentic Pakistani Biryanis', 
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    sortOrder: 1, 
    isActive: true 
  },
  { 
    name: 'Pizza', 
    description: 'Delicious Pizza varieties', 
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    sortOrder: 2, 
    isActive: true 
  },
  { 
    name: 'Shawarma', 
    description: 'Fresh and tasty Shawarmas', 
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    sortOrder: 3, 
    isActive: true 
  },
  { 
    name: 'Paratha Roll', 
    description: 'Delicious Paratha Rolls', 
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
    sortOrder: 4, 
    isActive: true 
  },
  { 
    name: 'Burgers', 
    description: 'Juicy Burgers and Zingers', 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    sortOrder: 5, 
    isActive: true 
  },
  { 
    name: 'Fried Chicken', 
    description: 'Crispy Fried Chicken', 
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    sortOrder: 6, 
    isActive: true 
  },
  { 
    name: 'Fries', 
    description: 'Crispy Fries and Loaded Fries', 
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    sortOrder: 7, 
    isActive: true 
  },
  { 
    name: 'Chinese', 
    description: 'Chaumin and Pasta', 
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    sortOrder: 8, 
    isActive: true 
  },
  { 
    name: 'Drinks', 
    description: 'Beverages and refreshments', 
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400',
    sortOrder: 9, 
    isActive: true 
  },
  { 
    name: 'Desserts', 
    description: 'Sweet treats and fruits', 
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    sortOrder: 10, 
    isActive: true 
  }
];

// Sample Menu Items with online images
const menuItems = [
  // ============ BIRYANI ============
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces, infused with traditional spices',
    price: 250,
    categoryName: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 25,
    isAvailable: true,
    unit: 'plate'
  },
  {
    name: 'Aloo Biryani',
    description: 'Flavorful basmati rice with potatoes and aromatic spices',
    price: 180,
    categoryName: 'Biryani',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: false,
    preparationTime: 20,
    isAvailable: true,
    isVegetarian: true,
    unit: 'plate'
  },
  {
    name: 'Shan Special Chicken Biryani Double Piece',
    description: 'Our signature biryani with double chicken pieces and special masala',
    price: 350,
    categoryName: 'Biryani',
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 30,
    isAvailable: true,
    unit: 'plate'
  },

  // ============ PIZZA ============
  {
    name: 'Lazaniya Pizza',
    description: 'Delicious lasagna-style pizza with layers of cheese and sauce',
    price: 800,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Chicken Tikka Pizza',
    description: 'Pizza topped with spicy chicken tikka and fresh vegetables',
    price: 850,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Crown Crest Pizza',
    description: 'Premium pizza with stuffed crust and special toppings',
    price: 950,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: true,
    preparationTime: 30,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Cheese Crust Pizza',
    description: 'Extra cheesy pizza with cheese-stuffed crust',
    price: 900,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600',
    isSpicy: false,
    spicyLevel: 0,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Labnani Pizza',
    description: 'Lebanese style pizza with special herbs and toppings',
    price: 850,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Chicken Fajita Pizza',
    description: 'Loaded with fajita chicken, peppers and onions',
    price: 900,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Sausage Pizza',
    description: 'Classic pizza topped with savory sausages',
    price: 800,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Hot and Spicy Pizza',
    description: 'For spice lovers - loaded with jalapeños and hot sauce',
    price: 850,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
    isSpicy: true,
    spicyLevel: 4,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Kabab Crust Pizza',
    description: 'Unique pizza with kebab pieces on crusty base',
    price: 950,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: false,
    preparationTime: 30,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Kalazone Pizza',
    description: 'Folded pizza with delicious fillings inside',
    price: 900,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1536964549799-73fd36a0ec4f?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Smoke Barbecue Pizza',
    description: 'Smoky BBQ flavored pizza with grilled chicken',
    price: 900,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: true,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Vegetarian Pizza',
    description: 'Fresh vegetables on a cheesy base',
    price: 750,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=600',
    isSpicy: false,
    spicyLevel: 0,
    featured: false,
    preparationTime: 20,
    isAvailable: true,
    isVegetarian: true,
    unit: 'piece'
  },
  {
    name: 'Cheese Gold Pizza',
    description: 'Triple cheese pizza for cheese lovers',
    price: 950,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    featured: false,
    preparationTime: 25,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Shan Special Pizza',
    description: 'Our signature pizza with secret recipe toppings',
    price: 1100,
    categoryName: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 30,
    isAvailable: true,
    unit: 'piece'
  },

  // ============ SHAWARMA ============
  {
    name: 'Chicken Shawarma',
    description: 'Classic chicken shawarma wrapped in fresh bread',
    price: 200,
    categoryName: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 10,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Chicken Large Shawarma',
    description: 'Extra large chicken shawarma with double filling',
    price: 350,
    categoryName: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Zinger Shawarma',
    description: 'Crispy zinger pieces in shawarma style',
    price: 300,
    categoryName: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
    isSpicy: true,
    spicyLevel: 3,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },

  // ============ PARATHA ROLL ============
  {
    name: 'Chicken Roll',
    description: 'Crispy paratha filled with spiced chicken',
    price: 180,
    categoryName: 'Paratha Roll',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 10,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Chicken Cheese Roll',
    description: 'Chicken paratha roll with melted cheese',
    price: 220,
    categoryName: 'Paratha Roll',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },

  // ============ BURGERS ============
  {
    name: 'Zinger Burger',
    description: 'Crispy zinger patty with fresh lettuce and mayo',
    price: 350,
    categoryName: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 15,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Zinger Cheese Burger',
    description: 'Zinger burger with extra cheese slice',
    price: 400,
    categoryName: 'Burgers',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 15,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Chicken Burger',
    description: 'Classic chicken patty burger',
    price: 300,
    categoryName: 'Burgers',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Chicken Cheese Burger',
    description: 'Chicken burger with melted cheese',
    price: 350,
    categoryName: 'Burgers',
    image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Shami Burger',
    description: 'Traditional shami kebab burger',
    price: 250,
    categoryName: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: false,
    preparationTime: 10,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Shami Chicken Mix Burger',
    description: 'Shami kebab with chicken patty combo',
    price: 320,
    categoryName: 'Burgers',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },

  // ============ FRIED CHICKEN ============
  {
    name: 'Hot Wings',
    description: 'Spicy crispy chicken wings (6 pieces)',
    price: 350,
    categoryName: 'Fried Chicken',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600',
    isSpicy: true,
    spicyLevel: 3,
    featured: true,
    preparationTime: 15,
    isAvailable: true,
    unit: 'plate'
  },
  {
    name: 'Zinger Piece',
    description: 'Single crispy zinger chicken piece',
    price: 200,
    categoryName: 'Fried Chicken',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },
  {
    name: 'Leg Piece',
    description: 'Crispy fried chicken leg',
    price: 180,
    categoryName: 'Fried Chicken',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    unit: 'piece'
  },

  // ============ FRIES ============
  {
    name: 'French Fries',
    description: 'Crispy golden french fries',
    price: 150,
    categoryName: 'Fries',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
    isSpicy: false,
    spicyLevel: 0,
    featured: false,
    preparationTime: 10,
    isAvailable: true,
    isVegetarian: true,
    unit: 'plate'
  },
  {
    name: 'Loaded Fries',
    description: 'Fries topped with cheese, chicken and sauces',
    price: 350,
    categoryName: 'Fries',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 15,
    isAvailable: true,
    unit: 'plate'
  },

  // ============ CHINESE ============
  {
    name: 'Chicken Chowmein',
    description: 'Stir-fried noodles with chicken and vegetables',
    price: 300,
    categoryName: 'Chinese',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
    isSpicy: true,
    spicyLevel: 2,
    featured: true,
    preparationTime: 15,
    isAvailable: true,
    unit: 'plate'
  },
  {
    name: 'Vegetable Chowmein',
    description: 'Stir-fried noodles with fresh vegetables',
    price: 250,
    categoryName: 'Chinese',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
    isSpicy: true,
    spicyLevel: 1,
    featured: false,
    preparationTime: 12,
    isAvailable: true,
    isVegetarian: true,
    unit: 'plate'
  },
  {
    name: 'Chicken Pasta',
    description: 'Creamy pasta with chicken pieces',
    price: 350,
    categoryName: 'Chinese',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
    isSpicy: false,
    spicyLevel: 1,
    featured: true,
    preparationTime: 15,
    isAvailable: true,
    unit: 'plate'
  },
  {
    name: 'White Sauce Pasta',
    description: 'Creamy white sauce pasta',
    price: 300,
    categoryName: 'Chinese',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    featured: false,
    preparationTime: 15,
    isAvailable: true,
    isVegetarian: true,
    unit: 'plate'
  },
  {
    name: 'Red Sauce Pasta',
    description: 'Tangy tomato sauce pasta',
    price: 280,
    categoryName: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600',
    isSpicy: true,
    spicyLevel: 1,
    featured: false,
    preparationTime: 15,
    isAvailable: true,
    isVegetarian: true,
    unit: 'plate'
  },

  // ============ DRINKS ============
  {
    name: 'Cold Drink 1.5 Liter',
    description: 'Chilled soft drink (Coke, Pepsi, Sprite, 7Up) - 1.5L',
    price: 200,
    categoryName: 'Drinks',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 1,
    isAvailable: true,
    unit: 'bottle'
  },
  {
    name: 'Cold Drink 1 Liter',
    description: 'Chilled soft drink (Coke, Pepsi, Sprite, 7Up) - 1L',
    price: 150,
    categoryName: 'Drinks',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 1,
    isAvailable: true,
    unit: 'bottle'
  },
  {
    name: 'Cold Drink 500ml',
    description: 'Chilled soft drink (Coke, Pepsi, Sprite, 7Up) - 500ml',
    price: 100,
    categoryName: 'Drinks',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 1,
    isAvailable: true,
    unit: 'bottle'
  },
  {
    name: 'Cold Drink 350ml',
    description: 'Chilled soft drink (Coke, Pepsi, Sprite, 7Up) - 350ml',
    price: 80,
    categoryName: 'Drinks',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 1,
    isAvailable: true,
    unit: 'bottle'
  },
  {
    name: 'Cold Drink Regular',
    description: 'Chilled soft drink regular size',
    price: 60,
    categoryName: 'Drinks',
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 1,
    isAvailable: true,
    unit: 'bottle'
  },
  {
    name: 'Mineral Water',
    description: 'Chilled mineral water bottle',
    price: 50,
    categoryName: 'Drinks',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600',
    isSpicy: false,
    spicyLevel: 0,
    isVegetarian: true,
    preparationTime: 1,
    isAvailable: true,
    unit: 'bottle'
  },

  // ============ DESSERTS ============
  {
    name: 'Fruit Chaat',
    description: 'Fresh mixed fruits with special spices (per kg)',
    price: 1000,
    categoryName: 'Desserts',
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=600',
    isSpicy: true,
    spicyLevel: 1,
    isVegetarian: true,
    featured: true,
    preparationTime: 10,
    isAvailable: true,
    unit: 'kg'
  },
  {
    name: 'Fruit Chaat Half KG',
    description: 'Fresh mixed fruits with special spices (half kg)',
    price: 500,
    categoryName: 'Desserts',
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=600',
    isSpicy: true,
    spicyLevel: 1,
    isVegetarian: true,
    featured: false,
    preparationTime: 8,
    isAvailable: true,
    unit: 'half'
  },
  {
    name: 'Fruit Chaat Quarter KG',
    description: 'Fresh mixed fruits with special spices (quarter kg)',
    price: 250,
    categoryName: 'Desserts',
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=600',
    isSpicy: true,
    spicyLevel: 1,
    isVegetarian: true,
    featured: false,
    preparationTime: 5,
    isAvailable: true,
    unit: 'plate'
  }
];

// Default Settings - Updated with your restaurant info
const defaultSettings = {
  restaurantName: 'Shan Biryani',
  tagline: 'Where Every Grain Tells a Story',
  description: 'Premium Desi Restaurant serving authentic Pakistani cuisine with traditional flavors and modern presentation.',
  logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
  favicon: '',
  address: {
    street: 'Haji Baba Road',
    city: 'Swat',
    state: 'KPK',
    zipCode: '19200',
    country: 'Pakistan',
    fullAddress: 'Haji Baba Road, Mingora Swat, KPK Pakistan'
  },
  contact: {
    phone: '+92 310 2804919',
    altPhone: '+92 346 2804919',
    email: 'shanbiryani6@gmail.com',
    whatsapp: '+92 310 2804919'
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
    minOrderAmount: 0,
    deliveryCharges: 250,
    freeDeliveryAbove: 5000,
    estimatedDeliveryTime: 45,
    acceptingOrders: true
  },
  taxSettings: {
    enableTax: false,
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
  },
  theme: {
    primaryColor: '#DC2626',
    secondaryColor: '#F59E0B'
  },
  seoSettings: {
    metaTitle: 'Shan Biryani - Best Biryani in Swat',
    metaDescription: 'Authentic Pakistani cuisine with traditional flavors',
    keywords: 'biryani, pizza, shawarma, swat, mingora, restaurant'
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
      phone: '+92 310 2804919',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create staff user
    const staffPassword = process.env.STAFF_PASSWORD || 'staff123456';
    const staffEmail = process.env.STAFF_EMAIL || 'staff@shanbiryani.com';

    const staff = await User.create({
      name: 'Staff User',
      email: staffEmail,
      password: staffPassword,
      role: 'staff',
      phone: '+92 346 2804919',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Staff user created: ${staff.email}`);

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
    console.log('👤 STAFF ACCOUNT:');
    console.log(`   Email: ${staffEmail}`);
    console.log(`   Password: ${staffPassword}`);
    console.log('─'.repeat(50));
    console.log('\n📊 DATA CREATED:');
    console.log(`   • 1 Admin User`);
    console.log(`   • 1 Staff User`);
    console.log(`   • ${createdCategories.length} Categories`);
    console.log(`   • ${createdMenuItems.length} Menu Items`);
    console.log(`   • 1 Settings Configuration`);
    console.log('─'.repeat(50));
    console.log('\n📍 RESTAURANT INFO:');
    console.log(`   • Name: ${defaultSettings.restaurantName}`);
    console.log(`   • Location: ${defaultSettings.address.fullAddress}`);
    console.log(`   • Phone: ${defaultSettings.contact.phone}`);
    console.log(`   • Email: ${defaultSettings.contact.email}`);
    console.log('─'.repeat(50));
    console.log('\n📝 NOTES:');
    console.log('   • All menu items have online images');
    console.log('   • Tax is disabled by default');
    console.log('   • Min order amount is Rs. 0');
    console.log('   • Delivery charges: Rs. 250');
    console.log('   • Free delivery above: Rs. 5000');
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
      phone: '+92 310 2804919',
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

// Update images only (for existing data)
const updateImages = async () => {
  try {
    await connectDB();

    console.log('\n🖼️  Updating menu item images...\n');

    // Create a map of menu item names to images
    const imageMap = {};
    menuItems.forEach(item => {
      imageMap[item.name] = item.image;
    });

    // Update each menu item
    let updatedCount = 0;
    for (const [name, image] of Object.entries(imageMap)) {
      const result = await MenuItem.updateOne(
        { name: name },
        { $set: { image: image } }
      );
      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`   ✅ Updated: ${name}`);
      }
    }

    // Update category images
    const categoryImageMap = {};
    categories.forEach(cat => {
      categoryImageMap[cat.name] = cat.image;
    });

    let catUpdatedCount = 0;
    for (const [name, image] of Object.entries(categoryImageMap)) {
      const result = await Category.updateOne(
        { name: name },
        { $set: { image: image } }
      );
      if (result.modifiedCount > 0) {
        catUpdatedCount++;
        console.log(`   ✅ Category Updated: ${name}`);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} menu items`);
    console.log(`✅ Updated ${catUpdatedCount} categories\n`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

// Update settings only
const updateSettings = async () => {
  try {
    await connectDB();

    console.log('\n⚙️  Updating settings...\n');

    const result = await Settings.findOneAndUpdate(
      {},
      { $set: defaultSettings },
      { upsert: true, new: true }
    );

    console.log('✅ Settings updated successfully!');
    console.log(`   Restaurant: ${result.restaurantName}`);
    console.log(`   Address: ${result.address.fullAddress}`);
    console.log(`   Phone: ${result.contact.phone}`);
    console.log(`   Email: ${result.contact.email}\n`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating settings:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

// Show help
const showHelp = () => {
  console.log('\n📖 SEEDER USAGE:');
  console.log('═'.repeat(50));
  console.log('  npm run seed            - Seed full database (clears existing)');
  console.log('  npm run seed:destroy    - Clear all data');
  console.log('  npm run seed:admin      - Create admin user only');
  console.log('  npm run seed:import     - Import data without clearing');
  console.log('  npm run seed:images     - Update images for existing items');
  console.log('  npm run seed:settings   - Update settings only');
  console.log('  npm run seed:help       - Show this help message');
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
  case '-img':
  case '--images':
  case 'images':
    updateImages();
    break;
  case '-s':
  case '--settings':
  case 'settings':
    updateSettings();
    break;
  case '-h':
  case '--help':
  case 'help':
    showHelp();
    break;
  default:
    seedDatabase();
}