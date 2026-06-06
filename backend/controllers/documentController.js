const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const Vendor = require('../models/Vendor');
const { createAuditLog } = require('../utils/auditHelper');
const { generatePONumber, generateInvoiceNumber } = require('../utils/generators');
const { generateInvoicePDF } = require('../utils/pdfService');
const { sendInvoiceEmail } = require('../utils/emailService');
const fs = require('fs');

const generatePurchaseOrder = async (req, res) => {
  try {
    const { quotationId, taxRate } = req.body;

    if (!quotationId) {
      return res.status(400).json({ message: 'Quotation ID is required' });
    }

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved quotations can generate PO' });
    }

    const existingPO = await PurchaseOrder.findOne({ quotationId });
    if (existingPO) {
      return res.status(400).json({ message: 'Purchase order already exists for this quotation' });
    }

    const rate = taxRate || 18;
    const subtotal = quotation.totalAmount;
    const taxAmount = (subtotal * rate) / 100;
    const totalAmount = subtotal + taxAmount;

    const poNumber = await generatePONumber(PurchaseOrder);

    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      quotationId: quotation._id,
      rfqId: quotation.rfqId,
      vendorId: quotation.vendorId,
      lineItems: quotation.lineItems,
      subtotal,
      taxRate: rate,
      taxAmount,
      totalAmount,
      deliveryTimeline: quotation.deliveryTimeline,
      createdBy: req.user._id,
    });

    quotation.status = 'selected';
    await quotation.save();

    await createAuditLog({
      action: 'po_generated',
      entityType: 'PurchaseOrder',
      entityId: purchaseOrder._id,
      performedBy: req.user._id,
      description: `Purchase order ${poNumber} generated`,
    });

    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'vendor' && req.user.vendorId) {
      filter.vendorId = req.user.vendorId;
    }

    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate('vendorId', 'companyName')
      .populate('rfqId', 'title')
      .sort({ createdAt: -1 });

    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId', 'companyName gstNumber address contacts')
      .populate('rfqId', 'title')
      .populate('quotationId');

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const { purchaseOrderId } = req.body;

    if (!purchaseOrderId) {
      return res.status(400).json({ message: 'Purchase order ID is required' });
    }

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const existingInvoice = await Invoice.findOne({ purchaseOrderId });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this purchase order' });
    }

    const invoiceNumber = await generateInvoiceNumber(Invoice);
    const vendor = await Vendor.findById(purchaseOrder.vendorId);

    const invoice = await Invoice.create({
      invoiceNumber,
      purchaseOrderId: purchaseOrder._id,
      vendorId: purchaseOrder.vendorId,
      lineItems: purchaseOrder.lineItems,
      subtotal: purchaseOrder.subtotal,
      taxRate: purchaseOrder.taxRate,
      taxAmount: purchaseOrder.taxAmount,
      totalAmount: purchaseOrder.totalAmount,
      createdBy: req.user._id,
    });

    const pdfPath = await generateInvoicePDF(invoice, vendor, purchaseOrder);
    invoice.pdfPath = pdfPath;
    await invoice.save();

    await createAuditLog({
      action: 'invoice_generated',
      entityType: 'Invoice',
      entityId: invoice._id,
      performedBy: req.user._id,
      description: `Invoice ${invoiceNumber} generated from PO ${purchaseOrder.poNumber}`,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'vendor' && req.user.vendorId) {
      filter.vendorId = req.user.vendorId;
    }

    const invoices = await Invoice.find(filter)
      .populate('vendorId', 'companyName')
      .populate('purchaseOrderId', 'poNumber')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendorId', 'companyName gstNumber address contacts')
      .populate('purchaseOrderId', 'poNumber deliveryTimeline');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      return res.status(404).json({ message: 'Invoice PDF not found' });
    }

    res.download(invoice.pdfPath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const printInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await createAuditLog({
      action: 'invoice_printed',
      entityType: 'Invoice',
      entityId: invoice._id,
      performedBy: req.user._id,
      description: `Invoice ${invoice.invoiceNumber} printed`,
    });

    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      return res.status(404).json({ message: 'Invoice PDF not found' });
    }

    res.download(invoice.pdfPath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const emailInvoice = async (req, res) => {
  try {
    const { email } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate('vendorId', 'companyName');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const recipientEmail = email || invoice.vendorId.contacts?.[0]?.email;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    await sendInvoiceEmail({
      to: recipientEmail,
      invoiceNumber: invoice.invoiceNumber,
      pdfPath: invoice.pdfPath,
    });

    invoice.status = 'sent';
    invoice.emailedAt = new Date();
    invoice.emailedTo = recipientEmail;
    await invoice.save();

    await createAuditLog({
      action: 'invoice_emailed',
      entityType: 'Invoice',
      entityId: invoice._id,
      performedBy: req.user._id,
      description: `Invoice ${invoice.invoiceNumber} emailed to ${recipientEmail}`,
    });

    res.json({ message: 'Invoice sent successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generatePurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  generateInvoice,
  getInvoices,
  getInvoiceById,
  downloadInvoicePDF,
  printInvoice,
  emailInvoice,
  updateInvoiceStatus,
};
