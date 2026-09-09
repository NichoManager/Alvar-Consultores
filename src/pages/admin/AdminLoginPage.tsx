import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setError('El email o la contraseña no son correctos.');
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        'is_admin',
      );

      if (adminError || !isAdmin) {
        await supabase.auth.signOut();

        setError(
          'Este usuario no tiene permisos para acceder al CRM.',
        );

        return;
      }

      navigate('/admin/inmuebles', {
        replace: true,
      });
    } catch {
      setError(
        'No se ha podido iniciar sesión. Inténtalo de nuevo.',
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
        </div>

        <div className="admin-login__footer">
          <span>Alvar Consultores Inmobiliarios</span>
          <small>Área privada</small>
        </div>
      </section>
    </main>
  );
}