const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ action, entityType, entityId, performedBy, description, metadata = {} }) => {
  await AuditLog.create({ action, entityType, entityId, performedBy, description, metadata });
};

module.exports = { createAuditLog };
