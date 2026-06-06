const crypto = require('crypto');

const generateToken = (userId) => {
  return crypto.randomBytes(32).toString('hex') + userId.toString().slice(-6);
};

const generatePONumber = async (PurchaseOrder) => {
  const count = await PurchaseOrder.countDocuments();
  const year = new Date().getFullYear();
  return `PO-${year}-${String(count + 1).padStart(5, '0')}`;
};

const generateInvoiceNumber = async (Invoice) => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
};

module.exports = { generateToken, generatePONumber, generateInvoiceNumber };
