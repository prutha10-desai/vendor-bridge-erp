const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/purchase-orders', authorize('procurement_officer'), generatePurchaseOrder);
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrderById);
router.patch('/purchase-orders/:id/status', authorize('procurement_officer'), updatePurchaseOrderStatus);

router.post('/invoices', authorize('procurement_officer'), generateInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.get('/invoices/:id/download', downloadInvoicePDF);
router.get('/invoices/:id/print', printInvoice);
router.post('/invoices/:id/email', authorize('procurement_officer'), emailInvoice);
router.patch('/invoices/:id/status', authorize('procurement_officer'), updateInvoiceStatus);

module.exports = router;
