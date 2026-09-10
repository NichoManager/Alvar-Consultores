import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCurrentUser } from '../../components/admin/AdminCurrentUser';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  setAdminUserPassword,
  setAdminUserRole,
  type AdminRole,
  type AdminUser,
} from '../../lib/adminUsers';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

type CreateUserForm = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

const initialCreateForm: CreateUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'admin',
};

const roleLabels: Record<AdminRole, string> = {
  admin: 'Administrador',
  superadmin: 'Superadministrador',
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return dateFormatter.format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return 'Nunca';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Nunca';
  }

  return dateTimeFormatter.format(date);
}

export function AdminUsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateUserForm>(initialCreateForm);
  const [isCreating, setIsCreating] = useState(false);

  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const [passwordUserId, setPasswordUserId] =
    useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const loadedUsers = await getAdminUsers();
      setUsers(loadedUsers);
    } catch (loadError) {
      console.error('Error loading admin users:', loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se han podido cargar los usuarios.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      setIsCheckingAccess(true);
      setError('');

      const {
        data,
        error: accessError,
      } = await supabase.rpc('is_superadmin');

      if (accessError) {
        console.error(
          'Error checking superadmin access:',
          accessError,
        );

        setError(
          'No se han podido comprobar tus permisos de administración.',
        );

        setIsSuperadmin(false);
        setIsCheckingAccess(false);
        return;
      }

      if (data !== true) {
        setIsSuperadmin(false);
        setIsCheckingAccess(false);
        return;
      }

      setIsSuperadmin(true);
      setIsCheckingAccess(false);

      await loadUsers();
    };

    void checkAccess();
  }, [loadUsers]);

  const summary = useMemo(() => {
    const withAccess = users.filter(
      (user) => user.hasAccess,
    ).length;

    const superadmins = users.filter(
      (user) => user.role === 'superadmin',
    ).length;

    return `${withAccess} ${
      withAccess === 1
        ? 'usuario con acceso'
        : 'usuarios con acceso'
    } · ${superadmins} ${
      superadmins === 1
        ? 'superadministrador'
        : 'superadministradores'
    }`;
  }, [users]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate('/admin/login', {
      replace: true,
    });
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleCreateUser = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessages();

    const email = createForm.email.trim();
    const name = createForm.name.trim();

    if (!email) {
      setError('Introduce el email del nuevo usuario.');
      return;
    }

    if (createForm.password.length < 8) {
      setError(
        'La contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    setIsCreating(true);

    try {
      await createAdminUser({
        name,
        email,
        password: createForm.password,
        role: createForm.role,
      });

      setCreateForm(initialCreateForm);
      setIsCreateOpen(false);

      setSuccessMessage(
        `Usuario ${email} creado correctamente.`,
      );

      await loadUsers();
    } catch (createError) {
      console.error(
        'Error creating admin user:',
        createError,
      );

      setError(
        createError instanceof Error
          ? createError.message
          : 'No se ha podido crear el usuario.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoleChange = async (
    user: AdminUser,
    role: AdminRole,
  ) => {
    if (user.role === role) {
      return;
    }

    clearMessages();
    setBusyUserId(user.id);

    try {
      await setAdminUserRole(user.id, role);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                role,
                hasAccess: true,
              }
            : currentUser,
        ),
      );

      setSuccessMessage(
        `Rol de ${user.email} actualizado a ${roleLabels[role]}.`,
      );
    } catch (roleError) {
      console.error(
        'Error updating admin role:',
        roleError,
      );

      setError(
        roleError instanceof Error
          ? roleError.message
          : 'No se ha podido actualizar el rol.',
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const openPasswordEditor = (userId: string) => {
    clearMessages();

    if (passwordUserId === userId) {
      setPasswordUserId(null);
      setNewPassword('');
      return;
    }

    setPasswordUserId(userId);
    setNewPassword('');
  };

  const handlePasswordChange = async (
    event: FormEvent<HTMLFormElement>,
    user: AdminUser,
  ) => {
    event.preventDefault();
    clearMessages();

    if (newPassword.length < 8) {
      setError(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    setIsChangingPassword(true);
    setBusyUserId(user.id);

    try {
      await setAdminUserPassword(
        user.id,
        newPassword,
      );

      setPasswordUserId(null);
      setNewPassword('');

      setSuccessMessage(
        `Contraseña de ${user.email} actualizada correctamente.`,
      );
    } catch (passwordError) {
      console.error(
        'Error updating user password:',
        passwordError,
      );

      setError(
        passwordError instanceof Error
          ? passwordError.message
          : 'No se ha podido cambiar la contraseña.',
      );
    } finally {
      setIsChangingPassword(false);
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (
    user: AdminUser,
  ) => {
    clearMessages();

    if (user.isCurrentUser) {
      setError(
        'No puedes eliminar el usuario con el que has iniciado sesión.',
      );
      return;
    }

    const confirmed = window.confirm(
      `Vas a eliminar permanentemente el usuario ${user.email}.\n\nEl usuario dejará de poder iniciar sesión en el CRM.\n\n¿Quieres continuar?`,
    );

    if (!confirmed) {
      return;
    }

    setBusyUserId(user.id);

    try {
      await deleteAdminUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) =>
            currentUser.id !== user.id,
        ),
      );

      if (passwordUserId === user.id) {
        setPasswordUserId(null);
        setNewPassword('');
      }

      setSuccessMessage(
        `Usuario ${user.email} eliminado correctamente.`,
      );
    } catch (deleteError) {
      console.error(
        'Error deleting admin user:',
        deleteError,
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'No se ha podido eliminar el usuario.',
      );
    } finally {
      setBusyUserId(null);
    }
  };

  if (isCheckingAccess) {
    return (
      <main className="admin-properties">
        <header className="admin-properties__header">
          <div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-site-link"
            >
              ALVAR CONSULTORES{' '}
              <span aria-hidden="true">
                ↗
              </span>
            </a>

            <h1>Usuarios</h1>
          </div>

          <div className="admin-properties__actions">
            <AdminCurrentUser />

            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="admin-properties__content">
          <p className="admin-properties__loading">
            Comprobando permisos...
          </p>
        </section>
      </main>
    );
  }

  if (!isSuperadmin) {
    return (
      <main className="admin-properties">
        <header className="admin-properties__header">
          <div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-site-link"
            >
              ALVAR CONSULTORES{' '}
              <span aria-hidden="true">
                ↗
              </span>
            </a>

            <h1>Usuarios</h1>
          </div>

          <div className="admin-properties__actions">
            <button
              type="button"
              onClick={() =>
                navigate('/admin/inmuebles')
              }
            >
              Inmuebles
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/admin/contactos')
              }
            >
              Contactos
            </button>

            <AdminCurrentUser />

            <button
              type="button"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="admin-properties__content">
          <div className="admin-users__restricted">
            <span>
              ACCESO RESTRINGIDO
            </span>

            <h2>
              Gestión reservada al superadministrador.
            </h2>

            <p>
              Esta cuenta puede utilizar el CRM,
              pero no tiene permisos para crear,
              modificar o eliminar usuarios.
            </p>

            {error ? (
              <p
                className="admin-properties__error"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() =>
                navigate('/admin/inmuebles')
              }
            >
              Volver a inmuebles
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-properties admin-users">
      <header className="admin-properties__header">
        <div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES{' '}
            <span aria-hidden="true">
              ↗
            </span>
          </a>

          <h1>Usuarios</h1>
        </div>

        <div className="admin-properties__actions">
          <button
            type="button"
            onClick={() =>
              navigate('/admin/inmuebles')
            }
          >
            Inmuebles
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/admin/contactos')
            }
          >
            Contactos
          </button>

          <button
            type="button"
            className="admin-users__create-toggle"
            onClick={() => {
              clearMessages();

              setIsCreateOpen(
                (currentValue) =>
                  !currentValue,
              );
            }}
          >
            {isCreateOpen
              ? 'Cancelar'
              : '+ Nuevo usuario'}
          </button>

          <AdminCurrentUser />

          <button
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="admin-properties__content">
        <div className="admin-properties__intro">
          <div>
            <p>
              ADMINISTRACIÓN DEL CRM
            </p>

            <h2>Accesos</h2>

            {!isLoading && !error ? (
              <span className="admin-properties__summary">
                {summary}
              </span>
            ) : null}
          </div>
        </div>

        <div className="admin-users__notice">
          <div>
            <span>SEGURIDAD</span>

            <p>
              Desde aquí puedes gestionar quién
              tiene acceso al área privada. Las
              contraseñas nunca se muestran ni se
              almacenan en el CRM.
            </p>
          </div>

          <strong>
            Solo superadministradores
          </strong>
        </div>

        {successMessage ? (
          <p
            className="admin-users__success"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p
            className="admin-properties__error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {isCreateOpen ? (
          <section className="admin-users__create">
            <div className="admin-users__section-heading">
              <div>
                <span>
                  NUEVO ACCESO
                </span>

                <h3>
                  Crear usuario
                </h3>
              </div>

              <p>
                El usuario podrá iniciar sesión en
                el CRM inmediatamente con las
                credenciales que le asignes.
              </p>
            </div>

            <form
              className="admin-users__create-form"
              onSubmit={handleCreateUser}
            >
              <div className="admin-users__field">
                <label htmlFor="admin-user-name">
                  Nombre
                </label>

                <input
                  id="admin-user-name"
                  type="text"
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm(
                      (currentForm) => ({
                        ...currentForm,
                        name:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Nombre del usuario"
                  autoComplete="name"
                  disabled={isCreating}
                />
              </div>

              <div className="admin-users__field">
                <label htmlFor="admin-user-email">
                  Email
                </label>

                <input
                  id="admin-user-email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm(
                      (currentForm) => ({
                        ...currentForm,
                        email:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="admin-users__field">
                <label htmlFor="admin-user-password">
                  Contraseña inicial
                </label>

                <input
                  id="admin-user-password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm(
                      (currentForm) => ({
                        ...currentForm,
                        password:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="admin-users__field">
                <label htmlFor="admin-user-role">
                  Permisos
                </label>

                <select
                  id="admin-user-role"
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm(
                      (currentForm) => ({
                        ...currentForm,
                        role:
                          event.target
                            .value as AdminRole,
                      }),
                    )
                  }
                  disabled={isCreating}
                >
                  <option value="admin">
                    Administrador
                  </option>

                  <option value="superadmin">
                    Superadministrador
                  </option>
                </select>
              </div>

              <div className="admin-users__create-actions">
                <button
                  type="button"
                  className="admin-users__secondary-button"
                  onClick={() => {
                    setCreateForm(
                      initialCreateForm,
                    );

                    setIsCreateOpen(false);
                    clearMessages();
                  }}
                  disabled={isCreating}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-users__primary-button"
                  disabled={isCreating}
                >
                  {isCreating
                    ? 'Creando usuario...'
                    : 'Crear usuario'}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {isLoading ? (
          <p className="admin-properties__loading">
            Cargando usuarios...
          </p>
        ) : null}

        {!isLoading &&
        users.length === 0 ? (
          <div className="admin-properties__empty">
            <span>
              Sin usuarios
            </span>

            <h3>
              No hay usuarios registrados.
            </h3>

            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(true)
              }
            >
              Crear usuario
            </button>
          </div>
        ) : null}

        {!isLoading &&
        users.length > 0 ? (
          <div className="admin-users__list">
            {users.map((user) => {
              const isBusy =
                busyUserId === user.id;

              const passwordOpen =
                passwordUserId === user.id;

              return (
                <article
                  key={user.id}
                  className="admin-user-card"
                >
                  <div className="admin-user-card__identity">
                    <div className="admin-user-card__avatar">
                      {(user.name ||
                        user.email ||
                        '?')
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="admin-user-card__title">
                        <h3>
                          {user.name ||
                            user.email}
                        </h3>
                      </div>

                      {user.name ? (
                        <a
                          href={`mailto:${user.email}`}
                        >
                          {user.email}
                        </a>
                      ) : null}

                      <p>
                        Alta:{' '}
                        {formatDate(
                          user.adminCreatedAt ??
                            user.createdAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="admin-user-card__activity">
                    <span>
                      ÚLTIMO ACCESO
                    </span>

                    <strong>
                      {formatDateTime(
                        user.lastSignInAt,
                      )}
                    </strong>

                    <small>
                      {user.emailConfirmedAt
                        ? 'Email confirmado'
                        : 'Email pendiente'}
                    </small>
                  </div>

                  <div className="admin-user-card__role">
                    <label
                      htmlFor={`admin-role-${user.id}`}
                    >
                      Permisos
                    </label>

                    <select
                      id={`admin-role-${user.id}`}
                      value={
                        user.role ?? ''
                      }
                      disabled={
                        isBusy ||
                        user.isCurrentUser
                      }
                      onChange={(event) => {
                        const role =
                          event.target
                            .value as AdminRole;

                        void handleRoleChange(
                          user,
                          role,
                        );
                      }}
                    >
                      {!user.role ? (
                        <option
                          value=""
                          disabled
                        >
                          Sin acceso
                        </option>
                      ) : null}

                      <option value="admin">
                        Administrador
                      </option>

                      <option value="superadmin">
                        Superadministrador
                      </option>
                    </select>
                  </div>

                  <div className="admin-user-card__actions">
                    <button
                      type="button"
                      className="admin-user-card__password-button"
                      onClick={() =>
                        openPasswordEditor(
                          user.id,
                        )
                      }
                      disabled={isBusy}
                    >
                      {passwordOpen
                        ? 'Cancelar contraseña'
                        : 'Cambiar contraseña'}
                    </button>

                    <button
                      type="button"
                      className="admin-user-card__delete-button"
                      onClick={() =>
                        void handleDeleteUser(
                          user,
                        )
                      }
                      disabled={
                        isBusy ||
                        user.isCurrentUser
                      }
                    >
                      {isBusy
                        ? 'Procesando...'
                        : 'Eliminar'}
                    </button>
                  </div>

                  {passwordOpen ? (
                    <form
                      className="admin-user-card__password-form"
                      onSubmit={(event) =>
                        void handlePasswordChange(
                          event,
                          user,
                        )
                      }
                    >
                      <div>
                        <label
                          htmlFor={`admin-password-${user.id}`}
                        >
                          Nueva contraseña para{' '}
                          {user.email}
                        </label>

                        <p>
                          Debe tener al menos
                          8 caracteres.
                        </p>
                      </div>

                      <input
                        id={`admin-password-${user.id}`}
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(
                            event.target.value,
                          )
                        }
                        placeholder="Nueva contraseña"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        autoFocus
                        disabled={
                          isChangingPassword
                        }
                      />

                      <button
                        type="submit"
                        disabled={
                          isChangingPassword
                        }
                      >
                        {isChangingPassword
                          ? 'Guardando...'
                          : 'Guardar contraseña'}
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
