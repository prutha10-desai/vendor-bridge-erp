const mongoose = require('mongoose');

const INVOICE_STATUSES = ['draft', 'generated', 'sent', 'paid', 'cancelled'];

const invoiceLineItemSchema = new mongoose.Schema(
  {
    productService: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lineItems: { type: [invoiceLineItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 18, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: INVOICE_STATUSES, default: 'generated' },
    pdfPath: { type: String, default: null },
    emailedAt: { type: Date, default: null },
    emailedTo: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
module.exports.INVOICE_STATUSES = INVOICE_STATUSES;
