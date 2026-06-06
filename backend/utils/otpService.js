const crypto = require('crypto');

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const getOtpExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = { generateOtp, getOtpExpiry };
