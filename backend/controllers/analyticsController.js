const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');

const getProcurementStats = async (req, res) => {
  try {
    const [totalVendors, activeVendors, totalRFQs, activeRFQs, totalPOs, totalInvoices, pendingApprovals] =
      await Promise.all([
        Vendor.countDocuments(),
        Vendor.countDocuments({ status: 'active' }),
        RFQ.countDocuments(),
        RFQ.countDocuments({ status: 'published' }),
        PurchaseOrder.countDocuments(),
        Invoice.countDocuments(),
        Quotation.countDocuments({ status: 'under_review' }),
      ]);

    const totalSpending = await PurchaseOrder.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      totalVendors,
      activeVendors,
      totalRFQs,
      activeRFQs,
      totalPurchaseOrders: totalPOs,
      totalInvoices,
      pendingApprovals,
      totalSpending: totalSpending[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorPerformance = async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: 'active' });

    const performance = await Promise.all(
      vendors.map(async (vendor) => {
        const [quotationCount, selectedCount, totalPOValue] = await Promise.all([
          Quotation.countDocuments({ vendorId: vendor._id, status: { $in: ['submitted', 'approved', 'selected'] } }),
          Quotation.countDocuments({ vendorId: vendor._id, status: 'selected' }),
          PurchaseOrder.aggregate([
            { $match: { vendorId: vendor._id } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ]),
        ]);

        return {
          vendorId: vendor._id,
          companyName: vendor.companyName,
          category: vendor.category,
          rating: vendor.rating,
          quotationsSubmitted: quotationCount,
          quotationsSelected: selectedCount,
          totalPOValue: totalPOValue[0]?.total || 0,
        };
      })
    );

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const trends = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          totalSpending: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSpendingSummary = async (req, res) => {
  try {
    const summary = await PurchaseOrder.aggregate([
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      {
        $group: {
          _id: '$vendor.category',
          totalSpending: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpending: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { entityType, entityId, action } = req.query;
    const filter = {};

    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notificationActions = [
      'rfq_published',
      'quotation_submitted',
      'quotation_approved',
      'quotation_rejected',
      'po_generated',
      'invoice_generated',
      'invoice_emailed',
    ];

    const notifications = await AuditLog.find({ action: { $in: notificationActions } })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProcurementStats,
  getVendorPerformance,
  getMonthlyTrends,
  getSpendingSummary,
  getActivityLogs,
  getNotifications,
};
