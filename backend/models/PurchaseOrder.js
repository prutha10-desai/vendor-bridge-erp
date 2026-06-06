const mongoose = require('mongoose');

const PO_STATUSES = ['draft', 'issued', 'acknowledged', 'completed', 'cancelled'];

const poLineItemSchema = new mongoose.Schema(
  {
    productService: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lineItems: { type: [poLineItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 18, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryTimeline: { type: String, required: true },
    status: { type: String, enum: PO_STATUSES, default: 'issued' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
module.exports.PO_STATUSES = PO_STATUSES;
