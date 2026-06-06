const mongoose = require('mongoose');

const RFQ_STATUSES = ['draft', 'published', 'closed', 'cancelled'];

const lineItemSchema = new mongoose.Schema(
  {
    productService: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'unit' },
  },
  { _id: false }
);

const rfqSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    lineItems: { type: [lineItemSchema], required: true },
    attachments: [{ filename: String, path: String, uploadedAt: { type: Date, default: Date.now } }],
    deadline: { type: Date, required: true },
    assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    status: { type: String, enum: RFQ_STATUSES, default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RFQ', rfqSchema);
module.exports.RFQ_STATUSES = RFQ_STATUSES;
