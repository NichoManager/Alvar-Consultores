import { supabase } from './supabase';

export type AdminRole = 'admin' | 'superadmin';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole | null;
  hasAccess: boolean;
  createdAt: string;
  adminCreatedAt: string | null;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  isCurrentUser: boolean;
};

type AdminUsersResponse = {
  users: AdminUser[];
};

type AdminUserActionResponse = {
  message?: string;
  error?: string;
  userId?: string;
  role?: AdminRole;
  user?: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  };
};

async function invokeAdminUsers<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      sessionError.message ||
        'No se ha podido comprobar la sesión.',
    );
  }

  if (!sessionData.session) {
    throw new Error(
      'Tu sesión ha caducado. Vuelve a iniciar sesión.',
    );
  }

  const { data, error } = await supabase.functions.invoke(
    'admin-users',
    {
      body,
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    },
  );

  if (error) {
    let message =
      error.message ||
      'Se ha producido un error al gestionar los usuarios.';

    const context = (
      error as {
        context?: Response;
      }
    ).context;

    if (context) {
      try {
        const responseBody = await context.clone().json();

        if (
          responseBody &&
          typeof responseBody.error === 'string'
        ) {
          message = responseBody.error;
        }
      } catch {
        // Si la respuesta no contiene JSON, conservamos
        // el mensaje original devuelto por Supabase.
      }
    }

    throw new Error(message);
  }

  if (
    data &&
    typeof data === 'object' &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    throw new Error(data.error);
  }

  return data as T;
}

export async function getAdminUsers() {
  const data = await invokeAdminUsers<AdminUsersResponse>({
    action: 'list',
  });

  return data.users;
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}) {
  return invokeAdminUsers<AdminUserActionResponse>({
    action: 'create',
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
  });
}

export async function setAdminUserRole(
  userId: string,
  role: AdminRole,
) {
  return invokeAdminUsers<AdminUserActionResponse>({
    action: 'set-role',
    userId,
    role,
  });
}

export async function setAdminUserPassword(
  userId: string,
  password: string,
) {
  return invokeAdminUsers<AdminUserActionResponse>({
    action: 'set-password',
    userId,
    password,
  });
}

export async function deleteAdminUser(
  userId: string,
) {
  return invokeAdminUsers<AdminUserActionResponse>({
    action: 'delete',
    userId,
  });
}