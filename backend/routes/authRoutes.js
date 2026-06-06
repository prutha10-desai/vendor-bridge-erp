const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  googleAuth,
  sendOtp,
  verifyOtp,
  getMe,
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);

router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
