const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const Vendor = require('../models/Vendor');
const { createAuditLog } = require('../utils/auditHelper');

const createQuotation = async (req, res) => {
  try {
    const { rfqId, lineItems, deliveryTimeline, deliveryDays, notes } = req.body;

    if (!rfqId || !lineItems || !deliveryTimeline) {
      return res.status(400).json({ message: 'RFQ ID, line items, and delivery timeline are required' });
    }

    if (!req.user.vendorId) {
      return res.status(403).json({ message: 'Vendor account not linked' });
    }

    const rfq = await RFQ.findById(rfqId);
    if (!rfq || rfq.status !== 'published') {
      return res.status(400).json({ message: 'RFQ not found or not open for quotations' });
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const quotation = await Quotation.create({
      rfqId,
      vendorId: req.user.vendorId,
      submittedBy: req.user._id,
      lineItems,
      deliveryTimeline,
      deliveryDays: deliveryDays || 0,
      notes: notes || '',
      totalAmount,
      status: 'draft',
    });

    res.status(201).json(quotation);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Quotation already exists for this RFQ' });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (!['draft', 'submitted'].includes(quotation.status)) {
      return res.status(400).json({ message: 'Quotation cannot be edited in current status' });
    }

    if (req.user.role === 'vendor' && quotation.vendorId.toString() !== req.user.vendorId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(quotation, req.body);

    if (req.body.lineItems) {
      quotation.totalAmount = req.body.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    await quotation.save();

    await createAuditLog({
      action: 'quotation_updated',
      entityType: 'Quotation',
      entityId: quotation._id,
      performedBy: req.user._id,
      description: `Quotation updated for RFQ ${quotation.rfqId}`,
    });

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.vendorId.toString() !== req.user.vendorId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    quotation.status = 'submitted';
    quotation.submittedAt = new Date();
    await quotation.save();

    await createAuditLog({
      action: 'quotation_submitted',
      entityType: 'Quotation',
      entityId: quotation._id,
      performedBy: req.user._id,
      description: `Quotation submitted for RFQ ${quotation.rfqId}`,
    });

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuotationsByRFQ = async (req, res) => {
  try {
    const quotations = await Quotation.find({ rfqId: req.params.rfqId })
      .populate('vendorId', 'companyName category rating gstNumber')
      .populate('submittedBy', 'name email')
      .sort({ totalAmount: 1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const compareQuotations = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const { sortBy } = req.query;

    let sort = { totalAmount: 1 };
    if (sortBy === 'delivery') sort = { deliveryDays: 1 };
    if (sortBy === 'rating') sort = { 'vendorId.rating': -1 };

    const quotations = await Quotation.find({ rfqId, status: { $in: ['submitted', 'under_review', 'approved', 'selected'] } })
      .populate('vendorId', 'companyName category rating gstNumber')
      .sort(sort);

    const lowestPrice = quotations.length > 0 ? Math.min(...quotations.map((q) => q.totalAmount)) : null;

    const comparison = quotations.map((q) => ({
      ...q.toObject(),
      isLowestPrice: q.totalAmount === lowestPrice,
    }));

    res.json({ rfqId, quotations: comparison, lowestPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const initiateApproval = async (req, res) => {
  try {
    const { quotationId } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    quotation.status = 'under_review';
    await quotation.save();

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveQuotation = async (req, res) => {
  try {
    const { remarks } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    quotation.status = 'approved';
    quotation.approvalHistory.push({
      action: 'approved',
      remarks: remarks || '',
      approvedBy: req.user._id,
    });
    await quotation.save();

    await createAuditLog({
      action: 'quotation_approved',
      entityType: 'Quotation',
      entityId: quotation._id,
      performedBy: req.user._id,
      description: `Quotation approved for RFQ ${quotation.rfqId}`,
      metadata: { remarks },
    });

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectQuotation = async (req, res) => {
  try {
    const { remarks } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    quotation.status = 'rejected';
    quotation.approvalHistory.push({
      action: 'rejected',
      remarks: remarks || '',
      approvedBy: req.user._id,
    });
    await quotation.save();

    await createAuditLog({
      action: 'quotation_rejected',
      entityType: 'Quotation',
      entityId: quotation._id,
      performedBy: req.user._id,
      description: `Quotation rejected for RFQ ${quotation.rfqId}`,
      metadata: { remarks },
    });

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('vendorId', 'companyName category rating')
      .populate('rfqId', 'title deadline')
      .populate('approvalHistory.approvedBy', 'name email role');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuotation,
  updateQuotation,
  submitQuotation,
  getQuotationsByRFQ,
  compareQuotations,
  initiateApproval,
  approveQuotation,
  rejectQuotation,
  getQuotationById,
};
