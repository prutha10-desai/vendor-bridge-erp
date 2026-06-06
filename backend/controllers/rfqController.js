const RFQ = require('../models/RFQ');
const { createAuditLog } = require('../utils/auditHelper');

const createRFQ = async (req, res) => {
  try {
    const { title, description, lineItems, deadline, assignedVendors } = req.body;

    if (!title || !lineItems || !deadline) {
      return res.status(400).json({ message: 'Title, line items, and deadline are required' });
    }

    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.originalname,
          path: file.path,
        }))
      : [];

    const rfq = await RFQ.create({
      title,
      description,
      lineItems,
      deadline,
      assignedVendors: assignedVendors || [],
      attachments,
      createdBy: req.user._id,
    });

    await createAuditLog({
      action: 'rfq_created',
      entityType: 'RFQ',
      entityId: rfq._id,
      performedBy: req.user._id,
      description: `RFQ "${title}" created`,
    });

    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRFQs = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    if (req.user.role === 'vendor' && req.user.vendorId) {
      filter.assignedVendors = req.user.vendorId;
    }

    const rfqs = await RFQ.find(filter)
      .populate('assignedVendors', 'companyName category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('assignedVendors', 'companyName category gstNumber contacts')
      .populate('createdBy', 'name email');

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    if (rfq.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft RFQs can be updated' });
    }

    Object.assign(rfq, req.body);

    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        filename: file.originalname,
        path: file.path,
      }));
      rfq.attachments = [...rfq.attachments, ...newAttachments];
    }

    await rfq.save();
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publishRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    rfq.status = 'published';
    rfq.publishedAt = new Date();
    await rfq.save();

    await createAuditLog({
      action: 'rfq_published',
      entityType: 'RFQ',
      entityId: rfq._id,
      performedBy: req.user._id,
      description: `RFQ "${rfq.title}" published to vendors`,
    });

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closeRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    await createAuditLog({
      action: 'rfq_closed',
      entityType: 'RFQ',
      entityId: rfq._id,
      performedBy: req.user._id,
      description: `RFQ "${rfq.title}" closed`,
    });

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  publishRFQ,
  closeRFQ,
};
