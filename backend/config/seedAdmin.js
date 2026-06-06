const User = require('../models/User');

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.log('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Admin seed: updated existing user ${email} to admin role`);
    } else {
      console.log(`Admin seed: admin already exists (${email})`);
    }
    return;
  }

  await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'admin',
    authProvider: 'local',
  });

  console.log(`Admin seed: created admin account (${email})`);
};

module.exports = seedAdmin;
