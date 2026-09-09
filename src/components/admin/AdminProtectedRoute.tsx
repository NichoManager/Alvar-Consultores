import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type AuthStatus = 'loading' | 'allowed' | 'denied';

export function AdminProtectedRoute() {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        if (isMounted) {
          setStatus('denied');
        }

        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        'is_admin',
      );

      if (adminError || !isAdmin) {
        await supabase.auth.signOut();

        if (isMounted) {
          setStatus('denied');
        }

        return;
      }

      if (isMounted) {
        setStatus('allowed');
      }
    };

    void checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <main className="admin-loading">
        <p>Accediendo al CRM...</p>
      </main>
    );
  }

  if (status === 'denied') {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Outlet />;
}