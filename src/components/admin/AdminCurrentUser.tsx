import { useOutletContext } from 'react-router-dom';
import type { AdminRouteContext } from './AdminProtectedRoute';

export function AdminCurrentUser() {
  const { user } = useOutletContext<AdminRouteContext>();
  const email = user.email?.trim();

  if (!email) {
    return null;
  }

  return (
    <div className="admin-current-user">
      <span>Conectado como</span>
      <strong>{email}</strong>
    </div>
  );
}
