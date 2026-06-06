const express = require('express');
const router = express.Router();
const {
  getProcurementStats,
  getVendorPerformance,
  getMonthlyTrends,
  getSpendingSummary,
  getActivityLogs,
  getNotifications,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', authorize('admin', 'manager', 'procurement_officer'), getProcurementStats);
router.get('/vendor-performance', authorize('admin', 'manager'), getVendorPerformance);
router.get('/monthly-trends', authorize('admin', 'manager'), getMonthlyTrends);
router.get('/spending-summary', authorize('admin', 'manager'), getSpendingSummary);
router.get('/activity-logs', getActivityLogs);
router.get('/notifications', getNotifications);

module.exports = router;
