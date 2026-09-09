import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Supabase session check error:', sessionError);
        }

        if (!session || sessionError) {
          if (isMounted) {
            setCheckingSession(false);
          }

          return;
        }

        const { data: isAdmin, error: adminError } = await supabase.rpc(
          'is_admin',
        );

        if (adminError) {
          console.error('Supabase existing admin check error:', adminError);
        }

        if (isAdmin && !adminError) {
          navigate('/admin/inmuebles', { replace: true });
          return;
        }

        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          console.error('Supabase existing session sign-out error:', signOutError);
        }

        if (isMounted) {
          setCheckingSession(false);
        }
      } catch (unexpectedError) {
        console.error('Unexpected existing session check error:', unexpectedError);

        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    void checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('Supabase sign-in error:', signInError);

        setError(`Supabase: ${signInError.message}`);

        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        'is_admin',
      );

      if (adminError) {
        console.error('Supabase admin check error:', adminError);

        await supabase.auth.signOut();

        setError(`Supabase admin: ${adminError.message}`);

        return;
      }

      if (!isAdmin) {
        await supabase.auth.signOut();

        setError(
          'Este usuario ha iniciado sesión correctamente, pero no tiene permisos para acceder al CRM.',
        );

        return;
      }

      navigate('/admin/inmuebles', {
        replace: true,
      });
    } catch (unexpectedError) {
      console.error('Unexpected login error:', unexpectedError);

      setError(
        'No se ha podido iniciar sesión. Revisa la consola para ver el error.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <section
        className="admin-login__panel"
        aria-labelledby="admin-login-title"
      >
        <div className="admin-login__brand">
          <span>ALVAR CONSULTORES</span>

          <p>Gestión inmobiliaria</p>
        </div>

        <div className="admin-login__content">
          {checkingSession ? (
            <>
              <p className="eyebrow">ACCESO PRIVADO</p>

              <h1 id="admin-login-title">
                Comprobando
                <br />
                <em>acceso.</em>
              </h1>

              <p className="admin-login__intro" role="status">
                Comprobando acceso...
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">ACCESO PRIVADO</p>

              <h1 id="admin-login-title">
                Acceso al
                <br />
                <em>CRM inmobiliario.</em>
              </h1>

              <p className="admin-login__intro">
                Inicia sesión para gestionar los inmuebles publicados en la web.
              </p>

              <form
                className="admin-login__form"
                onSubmit={handleSubmit}
              >
                <label>
                  <span>Email</span>

                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>Contraseña</span>

                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>

                {error ? (
                  <p
                    className="admin-login__error"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="admin-login__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Accediendo...'
                    : 'Entrar al CRM'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="admin-login__footer">
          <span>Alvar Consultores Inmobiliarios</span>
          <small>Área privada</small>
        </div>
      </section>
    </main>
  );
}
