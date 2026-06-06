const ALLOWED_USERS = {
  'theom.chaudhari@gmail.com': {
    role: 'admin',
    password: 'Omsc@990',
    name: 'Admin',
  },
  'omchaudahri2627@gmail.com': {
    role: 'admin',
    password: 'Omsc@990',
    name: 'Admin',
  },
  'meetdudhat2805@gmail.com': {
    role: 'procurement_officer',
    password: 'Meet@28052004',
    name: 'Procurement Officer',
  },
  'vatsaldevani2005@gmail.com': {
    role: 'manager',
    password: 'iamvatsal2209',
    name: 'Manager',
  },
};

const getAllowedUser = (email) => {
  if (!email) return null;
  return ALLOWED_USERS[email.toLowerCase().trim()] || null;
};

module.exports = { ALLOWED_USERS, getAllowedUser };
