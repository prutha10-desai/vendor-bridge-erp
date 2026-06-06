const User = require('../models/User');
const { ALLOWED_USERS } = require('./allowedUsers');

const seedAdmin = async () => {
  for (const [email, config] of Object.entries(ALLOWED_USERS)) {
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      user.role = config.role;
      user.name = config.name;
      user.password = config.password;
      await user.save();
      console.log(`Seed: updated user ${normalizedEmail} (${config.role})`);
    } else {
      await User.create({
        name: config.name,
        email: normalizedEmail,
        password: config.password,
        role: config.role,
        authProvider: 'local',
      });
      console.log(`Seed: created user ${normalizedEmail} (${config.role})`);
    }
  }
};

module.exports = seedAdmin;
