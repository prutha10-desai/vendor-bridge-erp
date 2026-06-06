const express = require('express');
const router = express.Router();
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  linkVendorUser,
  deleteVendor,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('admin', 'procurement_officer'), createVendor);
router.get('/', authorize('admin', 'procurement_officer', 'manager'), getVendors);
router.get('/:id', getVendorById);
router.put('/:id', authorize('admin', 'procurement_officer'), updateVendor);
router.patch('/:id/status', authorize('admin', 'procurement_officer'), updateVendorStatus);
router.post('/:id/link-user', authorize('admin'), linkVendorUser);
router.delete('/:id', authorize('admin'), deleteVendor);

module.exports = router;
