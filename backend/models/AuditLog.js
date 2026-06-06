const mongoose = require('mongoose');

const AUDIT_ACTIONS = [
  'user_login',
  'user_signup',
  'vendor_created',
  'vendor_updated',
  'vendor_status_changed',
  'rfq_created',
  'rfq_published',
  'rfq_closed',
  'quotation_submitted',
  'quotation_updated',
  'quotation_approved',
  'quotation_rejected',
  'po_generated',
  'invoice_generated',
  'invoice_emailed',
  'invoice_printed',
  'user_deleted',
  'vendor_deleted',
];

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    entityType: {
      type: String,
      enum: ['User', 'Vendor', 'RFQ', 'Quotation', 'PurchaseOrder', 'Invoice'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
module.exports.AUDIT_ACTIONS = AUDIT_ACTIONS;
