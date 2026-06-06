const mongoose = require('mongoose');

const VENDOR_STATUSES = ['pending', 'active', 'inactive', 'blacklisted'];

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    designation: { type: String, default: '' },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    gstNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    status: { type: String, enum: VENDOR_STATUSES, default: 'pending' },
    contacts: { type: [contactSchema], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
module.exports.VENDOR_STATUSES = VENDOR_STATUSES;
