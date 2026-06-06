import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
