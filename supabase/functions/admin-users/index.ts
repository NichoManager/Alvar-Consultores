import { withSupabase } from '@supabase/server';

type AdminRole = 'admin' | 'superadmin';

type AdminUserAction =
  | 'list'
  | 'create'
  | 'set-role'
  | 'set-password'
  | 'delete';

type RequestPayload = {
  action?: AdminUserAction;
  userId?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
  name?: string;
};

type AdminUserRow = {
  user_id: string;
  role: AdminRole;
  created_at: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

function isAdminRole(value: unknown): value is AdminRole {
  return value === 'admin' || value === 'superadmin';
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/*
 * El cliente admin de @supabase/server no conoce todavía
 * los tipos generados de nuestra tabla public.admin_users.
 *
 * Centralizamos aquí el acceso para evitar que TypeScript
 * infiera insert/update/upsert como "never".
 */
function adminUsersTable(supabaseAdmin: any) {
  return supabaseAdmin.from('admin_users');
}

async function getAdminRole(
  supabaseAdmin: any,
  userId: string,
): Promise<AdminRole | null> {
  const { data, error } = await adminUsersTable(supabaseAdmin)
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return isAdminRole(data?.role) ? data.role : null;
}

async function countSuperadmins(supabaseAdmin: any) {
  const { count, error } = await adminUsersTable(supabaseAdmin)
    .select('user_id', {
      count: 'exact',
      head: true,
    })
    .eq('role', 'superadmin');

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export default {
  fetch: withSupabase(
    {
      auth: 'user',
    },
    async (req, ctx) => {
      if (req.method !== 'POST') {
        return json(
          {
            error: 'Método no permitido.',
          },
          405,
        );
      }

      const currentUserId = ctx.userClaims?.id;

      if (!currentUserId) {
        return json(
          {
            error: 'Sesión no válida.',
          },
          401,
        );
      }

      /*
       * IMPORTANTE:
       * Primero comprobamos el permiso usando el cliente del usuario.
       * Solo después utilizamos supabaseAdmin, que tiene permisos elevados.
       */
      const {
        data: isSuperadmin,
        error: superadminError,
      } = await ctx.supabase.rpc('is_superadmin');

      if (superadminError) {
        console.error(
          'Error comprobando is_superadmin:',
          superadminError,
        );

        return json(
          {
            error: 'No se han podido comprobar tus permisos.',
          },
          500,
        );
      }

      if (isSuperadmin !== true) {
        return json(
          {
            error: 'No tienes permisos para gestionar usuarios.',
          },
          403,
        );
      }

      let body: RequestPayload;

      try {
        body = await req.json();
      } catch {
        return json(
          {
            error: 'La petición no contiene un JSON válido.',
          },
          400,
        );
      }

      const action = body.action;

      if (!action) {
        return json(
          {
            error: 'Falta indicar la acción.',
          },
          400,
        );
      }

      /*
       * =====================================================
       * LISTAR USUARIOS
       * =====================================================
       */
      if (action === 'list') {
        const {
          data: authData,
          error: authError,
        } = await ctx.supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (authError) {
          console.error(
            'Error listando usuarios:',
            authError,
          );

          return json(
            {
              error: 'No se han podido cargar los usuarios.',
            },
            500,
          );
        }

        const {
          data: adminRows,
          error: adminRowsError,
        } = await adminUsersTable(ctx.supabaseAdmin)
          .select('user_id, role, created_at');

        if (adminRowsError) {
          console.error(
            'Error cargando admin_users:',
            adminRowsError,
          );

          return json(
            {
              error:
                'No se han podido cargar los permisos de usuarios.',
            },
            500,
          );
        }

        const roleMap = new Map<
          string,
          {
            role: AdminRole;
            adminCreatedAt: string;
          }
        >();

        for (const row of (adminRows ?? []) as AdminUserRow[]) {
          roleMap.set(row.user_id, {
            role: row.role,
            adminCreatedAt: row.created_at,
          });
        }

        const users = authData.users
          .map((user) => {
            const adminData = roleMap.get(user.id);

            return {
              id: user.id,
              email: user.email ?? '',
              name:
                typeof user.user_metadata?.name === 'string'
                  ? user.user_metadata.name
                  : '',
              role: adminData?.role ?? null,
              hasAccess: Boolean(adminData),
              createdAt: user.created_at,
              adminCreatedAt:
                adminData?.adminCreatedAt ?? null,
              lastSignInAt:
                user.last_sign_in_at ?? null,
              emailConfirmedAt:
                user.email_confirmed_at ?? null,
              isCurrentUser:
                user.id === currentUserId,
            };
          })
          .sort((a, b) => {
            if (a.isCurrentUser) return -1;
            if (b.isCurrentUser) return 1;

            if (a.hasAccess && !b.hasAccess) return -1;
            if (!a.hasAccess && b.hasAccess) return 1;

            return a.email.localeCompare(
              b.email,
              'es',
            );
          });

        return json({
          users,
        });
      }

      /*
       * =====================================================
       * CREAR USUARIO
       * =====================================================
       */
      if (action === 'create') {
        const email = normalizeEmail(body.email ?? '');
        const password = body.password ?? '';
        const role = body.role ?? 'admin';
        const name = body.name?.trim() ?? '';

        if (!email) {
          return json(
            {
              error: 'El email es obligatorio.',
            },
            400,
          );
        }

        if (password.length < 8) {
          return json(
            {
              error:
                'La contraseña debe tener al menos 8 caracteres.',
            },
            400,
          );
        }

        if (!isAdminRole(role)) {
          return json(
            {
              error: 'El rol indicado no es válido.',
            },
            400,
          );
        }

        const {
          data: createdUserData,
          error: createUserError,
        } = await ctx.supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: name
            ? {
                name,
              }
            : undefined,
        });

        if (createUserError) {
          console.error(
            'Error creando usuario Auth:',
            createUserError,
          );

          return json(
            {
              error:
                createUserError.message ||
                'No se ha podido crear el usuario.',
            },
            400,
          );
        }

        const createdUser = createdUserData.user;

        if (!createdUser) {
          return json(
            {
              error:
                'Supabase no ha devuelto el usuario creado.',
            },
            500,
          );
        }

        const {
          error: adminInsertError,
        } = await adminUsersTable(ctx.supabaseAdmin)
          .insert({
            user_id: createdUser.id,
            role,
          });

        if (adminInsertError) {
          console.error(
            'Error asignando acceso CRM:',
            adminInsertError,
          );

          /*
           * Rollback:
           * si Auth se creó pero no podemos darle acceso
           * al CRM, eliminamos el usuario recién creado.
           */
          const {
            error: rollbackError,
          } = await ctx.supabaseAdmin.auth.admin.deleteUser(
            createdUser.id,
          );

          if (rollbackError) {
            console.error(
              'Error haciendo rollback del usuario:',
              rollbackError,
            );
          }

          return json(
            {
              error:
                'El usuario se creó en Auth, pero no se pudo asignar acceso al CRM. La operación se ha revertido.',
            },
            500,
          );
        }

        return json(
          {
            message: 'Usuario creado correctamente.',
            user: {
              id: createdUser.id,
              email: createdUser.email ?? email,
              name,
              role,
            },
          },
          201,
        );
      }

      /*
       * =====================================================
       * CAMBIAR ROL
       * =====================================================
       */
      if (action === 'set-role') {
        const userId = body.userId?.trim() ?? '';
        const role = body.role;

        if (!userId) {
          return json(
            {
              error: 'Falta el usuario.',
            },
            400,
          );
        }

        if (!isAdminRole(role)) {
          return json(
            {
              error: 'El rol indicado no es válido.',
            },
            400,
          );
        }

        const {
          data: targetUserData,
          error: targetUserError,
        } = await ctx.supabaseAdmin.auth.admin.getUserById(
          userId,
        );

        if (
          targetUserError ||
          !targetUserData.user
        ) {
          return json(
            {
              error: 'El usuario no existe.',
            },
            404,
          );
        }

        const currentRole = await getAdminRole(
          ctx.supabaseAdmin,
          userId,
        );

        /*
         * No permitimos eliminar el último superadmin
         * mediante un cambio de rol.
         */
        if (
          currentRole === 'superadmin' &&
          role === 'admin'
        ) {
          const totalSuperadmins =
            await countSuperadmins(
              ctx.supabaseAdmin,
            );

          if (totalSuperadmins <= 1) {
            return json(
              {
                error:
                  'Debe existir al menos un superadministrador.',
              },
              400,
            );
          }
        }

        const {
          error: roleError,
        } = await adminUsersTable(ctx.supabaseAdmin)
          .upsert(
            {
              user_id: userId,
              role,
            },
            {
              onConflict: 'user_id',
            },
          );

        if (roleError) {
          console.error(
            'Error cambiando rol:',
            roleError,
          );

          return json(
            {
              error:
                'No se ha podido cambiar el rol del usuario.',
            },
            500,
          );
        }

        return json({
          message: 'Rol actualizado correctamente.',
          userId,
          role,
        });
      }

      /*
       * =====================================================
       * CAMBIAR CONTRASEÑA
       * =====================================================
       *
       * Solo un superadmin puede ejecutar esta acción.
       * La contraseña nunca se almacena en nuestra tabla.
       * Se envía directamente a Supabase Auth.
       */
      if (action === 'set-password') {
        const userId = body.userId?.trim() ?? '';
        const password = body.password ?? '';

        if (!userId) {
          return json(
            {
              error: 'Falta el usuario.',
            },
            400,
          );
        }

        if (password.length < 8) {
          return json(
            {
              error:
                'La nueva contraseña debe tener al menos 8 caracteres.',
            },
            400,
          );
        }

        const {
          data: updatedUserData,
          error: passwordError,
        } = await ctx.supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            password,
          },
        );

        if (
          passwordError ||
          !updatedUserData.user
        ) {
          console.error(
            'Error cambiando contraseña:',
            passwordError,
          );

          return json(
            {
              error:
                passwordError?.message ||
                'No se ha podido cambiar la contraseña.',
            },
            400,
          );
        }

        return json({
          message:
            'Contraseña actualizada correctamente.',
          userId,
        });
      }

      /*
       * =====================================================
       * ELIMINAR USUARIO
       * =====================================================
       */
      if (action === 'delete') {
        const userId = body.userId?.trim() ?? '';

        if (!userId) {
          return json(
            {
              error: 'Falta el usuario.',
            },
            400,
          );
        }

        /*
         * Un superadmin nunca puede eliminarse a sí mismo
         * desde este panel.
         */
        if (userId === currentUserId) {
          return json(
            {
              error:
                'No puedes eliminar tu propio usuario.',
            },
            400,
          );
        }

        const {
          data: targetUserData,
          error: targetUserError,
        } = await ctx.supabaseAdmin.auth.admin.getUserById(
          userId,
        );

        if (
          targetUserError ||
          !targetUserData.user
        ) {
          return json(
            {
              error: 'El usuario no existe.',
            },
            404,
          );
        }

        const existingRole = await getAdminRole(
          ctx.supabaseAdmin,
          userId,
        );

        if (existingRole === 'superadmin') {
          const totalSuperadmins =
            await countSuperadmins(
              ctx.supabaseAdmin,
            );

          if (totalSuperadmins <= 1) {
            return json(
              {
                error:
                  'No puedes eliminar el último superadministrador.',
              },
              400,
            );
          }
        }

        /*
         * Quitamos primero la relación del CRM.
         * Así no dependemos del comportamiento exacto
         * de la FK contra auth.users.
         */
        if (existingRole) {
          const {
            error: removeAdminError,
          } = await adminUsersTable(ctx.supabaseAdmin)
            .delete()
            .eq('user_id', userId);

          if (removeAdminError) {
            console.error(
              'Error quitando admin_users:',
              removeAdminError,
            );

            return json(
              {
                error:
                  'No se ha podido retirar el acceso del usuario.',
              },
              500,
            );
          }
        }

        const {
          error: deleteUserError,
        } = await ctx.supabaseAdmin.auth.admin.deleteUser(
          userId,
        );

        if (deleteUserError) {
          console.error(
            'Error eliminando usuario Auth:',
            deleteUserError,
          );

          /*
           * Si falla Auth después de retirar admin_users,
           * restauramos el acceso anterior.
           */
          if (existingRole) {
            const {
              error: restoreError,
            } = await adminUsersTable(ctx.supabaseAdmin)
              .upsert(
                {
                  user_id: userId,
                  role: existingRole,
                },
                {
                  onConflict: 'user_id',
                },
              );

            if (restoreError) {
              console.error(
                'Error restaurando admin_users:',
                restoreError,
              );
            }
          }

          return json(
            {
              error:
                deleteUserError.message ||
                'No se ha podido eliminar el usuario.',
            },
            500,
          );
        }

        return json({
          message: 'Usuario eliminado correctamente.',
          userId,
        });
      }

      return json(
        {
          error: 'Acción no reconocida.',
        },
        400,
      );
    },
  ),
};