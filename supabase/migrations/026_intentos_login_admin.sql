-- Limita los intentos de ingreso del panel de administración: 3
-- intentos fallidos bloquean ese email por 3 minutos. Mismo patrón que
-- `intentos_login` (login familiar), pero clave por email en vez de
-- por miembro_id, ya que acá se escribe el email a mano en vez de
-- elegirlo de una lista. Solo se accede desde el server action de
-- login usando la clave de servicio, por eso no hace falta ninguna
-- política de RLS (RLS habilitado sin políticas = inaccesible para las
-- claves anon/authenticated).
create table if not exists intentos_login_admin (
  email text primary key,
  intentos_fallidos integer not null default 0,
  bloqueado_hasta timestamptz,
  actualizado_at timestamptz not null default now()
);

alter table intentos_login_admin enable row level security;
