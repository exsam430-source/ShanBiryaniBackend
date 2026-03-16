import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Public (some fields) / Private (all fields)
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    // Create default settings if not exists
    settings = await Settings.create({});
  }

  res.json({
    success: true,
    data: settings
  });
});

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  // Return only public fields
  const publicSettings = {
    restaurantName: settings.restaurantName,
    tagline: settings.tagline,
    description: settings.description,
    logo: settings.logo,
    address: settings.address,
    contact: {
      phone: settings.contact?.phone,
      email: settings.contact?.email,
      whatsapp: settings.contact?.whatsapp
    },
    socialMedia: settings.socialMedia,
    openingHours: settings.openingHours,
    currency: settings.currency,
    orderSettings: {
      minOrderAmount: settings.orderSettings?.minOrderAmount,
      deliveryCharges: settings.orderSettings?.deliveryCharges,
      freeDeliveryAbove: settings.orderSettings?.freeDeliveryAbove,
      estimatedDeliveryTime: settings.orderSettings?.estimatedDeliveryTime,
      acceptingOrders: settings.orderSettings?.acceptingOrders
    },
    theme: settings.theme,
    seoSettings: settings.seoSettings
  };

  res.json({
    success: true,
    data: publicSettings
  });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    // Update each field if provided
    const fields = [
      'restaurantName', 'tagline', 'description', 'logo', 'favicon',
      'address', 'contact', 'socialMedia', 'openingHours',
      'orderSettings', 'taxSettings', 'invoiceSettings',
      'currency', 'theme', 'seoSettings'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'object' && !Array.isArray(req.body[field])) {
          settings[field] = { ...settings[field]?.toObject?.() || {}, ...req.body[field] };
        } else {
          settings[field] = req.body[field];
        }
      }
    });

    await settings.save();
  }

  res.json({
    success: true,
    data: settings,
    message: 'Settings updated successfully'
  });
});

// @desc    Update logo
// @route   PUT /api/settings/logo
// @access  Private/Admin
export const updateLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      logo: `/uploads/${req.file.filename}`
    });
  } else {
    settings.logo = `/uploads/${req.file.filename}`;
    await settings.save();
  }

  res.json({
    success: true,
    data: { logo: settings.logo },
    message: 'Logo updated successfully'
  });
});

// @desc    Update opening hours
// @route   PUT /api/settings/opening-hours
// @access  Private/Admin
export const updateOpeningHours = asyncHandler(async (req, res) => {
  const { openingHours } = req.body;

  if (!openingHours) {
    res.status(400);
    throw new Error('Opening hours data is required');
  }

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({ openingHours });
  } else {
    settings.openingHours = openingHours;
    await settings.save();
  }

  res.json({
    success: true,
    data: { openingHours: settings.openingHours },
    message: 'Opening hours updated successfully'
  });
});

// @desc    Update tax settings
// @route   PUT /api/settings/tax
// @access  Private/Admin
export const updateTaxSettings = asyncHandler(async (req, res) => {
  const { enableTax, taxRate, taxName } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      taxSettings: { enableTax, taxRate, taxName }
    });
  } else {
    settings.taxSettings = {
      enableTax: enableTax !== undefined ? enableTax : settings.taxSettings?.enableTax,
      taxRate: taxRate !== undefined ? taxRate : settings.taxSettings?.taxRate,
      taxName: taxName || settings.taxSettings?.taxName
    };
    await settings.save();
  }

  res.json({
    success: true,
    data: { taxSettings: settings.taxSettings },
    message: 'Tax settings updated successfully'
  });
});

// @desc    Update order settings
// @route   PUT /api/settings/order
// @access  Private/Admin
export const updateOrderSettings = asyncHandler(async (req, res) => {
  const { minOrderAmount, deliveryCharges, freeDeliveryAbove, estimatedDeliveryTime, acceptingOrders } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      orderSettings: req.body
    });
  } else {
    settings.orderSettings = {
      minOrderAmount: minOrderAmount !== undefined ? minOrderAmount : settings.orderSettings?.minOrderAmount,
      deliveryCharges: deliveryCharges !== undefined ? deliveryCharges : settings.orderSettings?.deliveryCharges,
      freeDeliveryAbove: freeDeliveryAbove !== undefined ? freeDeliveryAbove : settings.orderSettings?.freeDeliveryAbove,
      estimatedDeliveryTime: estimatedDeliveryTime !== undefined ? estimatedDeliveryTime : settings.orderSettings?.estimatedDeliveryTime,
      acceptingOrders: acceptingOrders !== undefined ? acceptingOrders : settings.orderSettings?.acceptingOrders
    };
    await settings.save();
  }

  res.json({
    success: true,
    data: { orderSettings: settings.orderSettings },
    message: 'Order settings updated successfully'
  });
});

// @desc    Toggle accepting orders
// @route   PATCH /api/settings/toggle-orders
// @access  Private/Admin
export const toggleAcceptingOrders = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  settings.orderSettings = {
    ...settings.orderSettings?.toObject?.() || {},
    acceptingOrders: !settings.orderSettings?.acceptingOrders
  };
  
  await settings.save();

  res.json({
    success: true,
    data: { acceptingOrders: settings.orderSettings.acceptingOrders },
    message: `Orders ${settings.orderSettings.acceptingOrders ? 'enabled' : 'disabled'}`
  });
});