export const ROLE_LABELS = {
  admin: 'Admin',
  procurement_officer: 'Procurement Officer',
  manager: 'Manager',
  vendor: 'Vendor',
};

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'procurement_officer', 'manager', 'vendor'],
  },
  {
    id: 'vendors',
    label: 'Vendors',
    path: '/vendors',
    icon: 'Building2',
    roles: ['admin', 'procurement_officer', 'manager'],
  },
  {
    id: 'users',
    label: 'Users',
    path: '/admin/users',
    icon: 'Users',
    roles: ['admin'],
  },
];

export const canAccess = (role, navItem) => navItem.roles.includes(role);

export const VENDOR_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blacklisted', label: 'Blacklisted' },
];

export const AUTH_PROVIDER_LABELS = {
  local: 'Email',
  google: 'Google',
  otp: 'OTP',
};
