export const generateInvoiceNumber = async (Model, prefix = 'INV') => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const count = await Model.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  });
  
  return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

export const generateOrderNumber = async (Model) => {
  return generateInvoiceNumber(Model, 'ORD');
};

export const generateBillNumber = async (Model) => {
  return generateInvoiceNumber(Model, 'INV');
};