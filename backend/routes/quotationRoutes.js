const express = require('express');
const router = express.Router();
const {
  createQuotation,
  updateQuotation,
  submitQuotation,
  getQuotationsByRFQ,
  compareQuotations,
  initiateApproval,
  approveQuotation,
  rejectQuotation,
  getQuotationById,
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('vendor'), createQuotation);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.patch('/:id/submit', authorize('vendor'), submitQuotation);

router.get('/rfq/:rfqId', authorize('procurement_officer', 'manager', 'admin'), getQuotationsByRFQ);
router.get('/rfq/:rfqId/compare', authorize('procurement_officer', 'manager'), compareQuotations);

router.post('/approval/initiate', authorize('procurement_officer'), initiateApproval);
router.patch('/:id/approve', authorize('manager'), approveQuotation);
router.patch('/:id/reject', authorize('manager'), rejectQuotation);

module.exports = router;
