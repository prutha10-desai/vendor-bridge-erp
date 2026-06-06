const mongoose = require('mongoose');

const QUOTATION_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'selected',
];

const quotationLineItemSchema = new mongoose.Schema(
  {
    productService: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const approvalSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ['approved', 'rejected'], required: true },
    remarks: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lineItems: { type: [quotationLineItemSchema], required: true },
    deliveryTimeline: { type: String, required: true },
    deliveryDays: { type: Number, min: 0, default: 0 },
    notes: { type: String, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: QUOTATION_STATUSES, default: 'draft' },
    approvalHistory: { type: [approvalSchema], default: [] },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);
module.exports.QUOTATION_STATUSES = QUOTATION_STATUSES;
