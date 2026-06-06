const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Otp = require('../models/Otp');
const { createAuditLog } = require('../utils/auditHelper');
const { sendPasswordResetEmail, sendOtpEmail } = require('../utils/emailService');
const { generateOtp, getOtpExpiry } = require('../utils/otpService');
const { verifyGoogleToken } = require('../utils/googleAuth');
const { getAllowedUser } = require('../config/allowedUsers');

const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const formatAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
  vendorId: user.vendorId,
  token: generateJWT(user._id),
});

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      category,
      gstNumber,
      address,
      contacts,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const allowed = getAllowedUser(normalizedEmail);
    const role = allowed ? allowed.role : 'vendor';

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let vendorId = null;

    if (role === 'vendor') {
      if (!companyName || !category || !gstNumber || !address) {
        return res.status(400).json({
          message: 'Company name, category, GST number, and address are required for vendor registration',
        });
      }

      const vendor = await Vendor.create({
        companyName,
        category,
        gstNumber,
        address,
        contacts: contacts || [{ name, email: normalizedEmail, phone: '', designation: '' }],
        status: 'pending',
      });

      vendorId = vendor._id;

      await createAuditLog({
        action: 'vendor_created',
        entityType: 'Vendor',
        entityId: vendor._id,
        performedBy: null,
        description: `Vendor ${companyName} self-registered`,
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      vendorId,
      authProvider: 'local',
    });

    await createAuditLog({
      action: 'user_signup',
      entityType: 'User',
      entityId: user._id,
      performedBy: user._id,
      description: `User ${normalizedEmail} signed up with role ${role}`,
    });

    res.status(201).json(formatAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({ message: `Please login with ${user.authProvider}` });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    await createAuditLog({
      action: 'user_login',
      entityType: 'User',
      entityId: user._id,
      performedBy: user._id,
      description: `User ${email} logged in`,
    });

    res.json(formatAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    const payload = await verifyGoogleToken(idToken);
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account email not available' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        if (user.googleId && user.googleId !== googleId) {
          return res.status(400).json({ message: 'Email already registered with a different Google account' });
        }
        user.googleId = googleId;
        if (!user.password) {
          user.authProvider = 'google';
        }
        await user.save();
      } else {
        const allowed = getAllowedUser(normalizedEmail);
        const role = allowed ? allowed.role : 'vendor';

        user = await User.create({
          name: name || email.split('@')[0],
          email: normalizedEmail,
          googleId,
          role,
          authProvider: 'google',
        });

        await createAuditLog({
          action: 'user_signup',
          entityType: 'User',
          entityId: user._id,
          performedBy: user._id,
          description: `User ${normalizedEmail} signed up via Google with role ${role}`,
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    await createAuditLog({
      action: 'user_login',
      entityType: 'User',
      entityId: user._id,
      performedBy: user._id,
      description: `User ${email} logged in via Google`,
    });

    res.json(formatAuthResponse(user));
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email, purpose, name } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ message: 'Email and purpose are required' });
    }

    if (!['signup', 'login'].includes(purpose)) {
      return res.status(400).json({ message: 'Purpose must be signup or login' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (purpose === 'signup') {
      if (!name) {
        return res.status(400).json({ message: 'Name is required for OTP signup' });
      }

      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    if (purpose === 'login') {
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found. Please sign up first' });
      }
      if (!existingUser.isActive) {
        return res.status(401).json({ message: 'Account is inactive' });
      }
    }

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    const signupRole =
      purpose === 'signup'
        ? (getAllowedUser(normalizedEmail)?.role || 'vendor')
        : null;

    await Otp.findOneAndDelete({ email: normalizedEmail, purpose });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose,
      name: purpose === 'signup' ? name : null,
      role: signupRole,
      expiresAt,
    });

    await sendOtpEmail({ to: normalizedEmail, otp, purpose });

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail, otp }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP expired' });
    }

    let user;

    if (otpRecord.purpose === 'signup') {
      user = await User.create({
        name: otpRecord.name,
        email: normalizedEmail,
        role: otpRecord.role,
        authProvider: 'otp',
      });

      await createAuditLog({
        action: 'user_signup',
        entityType: 'User',
        entityId: user._id,
        performedBy: user._id,
        description: `User ${normalizedEmail} signed up via OTP with role ${otpRecord.role}`,
      });
    } else {
      user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is inactive' });
      }
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    await createAuditLog({
      action: 'user_login',
      entityType: 'User',
      entityId: user._id,
      performedBy: user._id,
      description: `User ${normalizedEmail} logged in via OTP`,
    });

    res.json(formatAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendPasswordResetEmail({ to: email, resetToken });

    res.json({ message: 'Password reset token sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const getDashboard = async (req, res) => {
  try {
    const RFQ = require('../models/RFQ');
    const Quotation = require('../models/Quotation');
    const PurchaseOrder = require('../models/PurchaseOrder');
    const Invoice = require('../models/Invoice');

    const [pendingApprovals, activeRFQs, recentPOs, recentInvoices] = await Promise.all([
      Quotation.find({ status: 'under_review' })
        .populate('rfqId', 'title')
        .populate('vendorId', 'companyName')
        .sort({ updatedAt: -1 })
        .limit(10),
      RFQ.find({ status: 'published' }).sort({ createdAt: -1 }).limit(10),
      PurchaseOrder.find().populate('vendorId', 'companyName').sort({ createdAt: -1 }).limit(10),
      Invoice.find().populate('vendorId', 'companyName').sort({ createdAt: -1 }).limit(10),
    ]);

    const [totalRFQs, totalPOs, totalInvoices, totalVendors] = await Promise.all([
      RFQ.countDocuments(),
      PurchaseOrder.countDocuments(),
      Invoice.countDocuments(),
      require('../models/Vendor').countDocuments(),
    ]);

    res.json({
      pendingApprovals,
      activeRFQs,
      recentPurchaseOrders: recentPOs,
      recentInvoices,
      analytics: {
        totalRFQs,
        totalPurchaseOrders: totalPOs,
        totalInvoices,
        totalVendors,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await createAuditLog({
      action: 'user_deleted',
      entityType: 'User',
      entityId: user._id,
      performedBy: req.user._id,
      description: `User ${user.email} deleted by admin`,
    });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
