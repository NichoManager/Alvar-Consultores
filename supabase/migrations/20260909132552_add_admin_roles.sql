-- =========================================================
-- ALVAR CONSULTORES — ROLES DE ADMINISTRACIÓN
-- =========================================================
-- Añade roles al CRM sin modificar la lógica actual de is_admin().
--
-- admin:
--   Puede usar el CRM normal.
--
-- superadmin:
--   Puede usar el CRM normal y gestionar otros usuarios.
-- =========================================================


-- 1. Añadir rol a los administradores existentes.
alter table public.admin_users
add column role text not null default 'admin';


-- 2. Limitar los valores permitidos.
alter table public.admin_users
add constraint admin_users_role_check
check (role in ('admin', 'superadmin'));


-- 3. Crear función segura para saber si el usuario actual
--    tiene permisos de superadministrador.
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.role = 'superadmin'
  );
$$;


-- 4. El usuario autenticado puede ejecutar la comprobación,
--    pero no obtiene acceso directo especial a la tabla.
revoke all on function public.is_superadmin()
from public, anon, authenticated;

grant execute on function public.is_superadmin()
to authenticated;


-- 5. Bootstrap inicial.
--    Si todavía no existe ningún superadmin, promovemos
--    únicamente al administrador más antiguo.
update public.admin_users
set role = 'superadmin'
where user_id = (
  select user_id
  from public.admin_users
  order by created_at asc
  limit 1
)
and not exists (
  select 1
  from public.admin_users
  where role = 'superadmin'
);


comment on column public.admin_users.role is
  'CRM role: admin for normal administrators, superadmin for user management.';

comment on function public.is_superadmin() is
  'Returns true when the authenticated user has the superadmin CRM role.';