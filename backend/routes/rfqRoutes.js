const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  publishRFQ,
  closeRFQ,
} = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '../uploads/rfq');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.use(protect);

router.post('/', authorize('procurement_officer'), upload.array('attachments', 5), createRFQ);
router.get('/', getRFQs);
router.get('/:id', getRFQById);
router.put('/:id', authorize('procurement_officer'), upload.array('attachments', 5), updateRFQ);
router.patch('/:id/publish', authorize('procurement_officer'), publishRFQ);
router.patch('/:id/close', authorize('procurement_officer'), closeRFQ);

module.exports = router;
