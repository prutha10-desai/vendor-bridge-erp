const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['procurement_officer', 'vendor', 'manager', 'admin'];
const AUTH_PROVIDERS = ['local', 'google', 'otp'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, default: null },
    role: { type: String, enum: ROLES, required: true },
    authProvider: { type: String, enum: AUTH_PROVIDERS, default: 'local' },
    googleId: { type: String, default: null, sparse: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
module.exports.AUTH_PROVIDERS = AUTH_PROVIDERS;
