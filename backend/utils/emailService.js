const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendInvoiceEmail = async ({ to, invoiceNumber, pdfPath }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: `Invoice ${invoiceNumber} - VendorBridge`,
    text: `Please find attached invoice ${invoiceNumber} from VendorBridge.`,
    attachments: pdfPath
      ? [{ filename: `${invoiceNumber}.pdf`, path: pdfPath }]
      : [],
  };

  return transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async ({ to, resetToken }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Password Reset - VendorBridge',
    text: `Your password reset token: ${resetToken}. This token expires in 1 hour.`,
  };

  return transporter.sendMail(mailOptions);
};

const sendOtpEmail = async ({ to, otp, purpose }) => {
  const action = purpose === 'signup' ? 'sign up' : 'log in';
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: `Your OTP for VendorBridge ${action}`,
    text: `Your OTP to ${action} is: ${otp}. It expires in 10 minutes. Do not share this code.`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendInvoiceEmail, sendPasswordResetEmail, sendOtpEmail };
