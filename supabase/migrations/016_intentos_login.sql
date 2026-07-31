-- Limita los intentos de ingreso familiar: 5 intentos fallidos bloquean a
-- ese miembro por 5 minutos. Solo se accede desde el server action de
-- login usando la clave de servicio, por eso no hace falta ninguna
-- política de RLS (RLS habilitado sin políticas = inaccesible para las
-- claves anon/authenticated).
create table if not exists intentos_login (
  miembro_id uuid primary key references miembros(id) on delete cascade,
  intentos_fallidos integer not null default 0,
  bloqueado_hasta timestamptz,
  actualizado_at timestamptz not null default now()
);

alter table intentos_login enable row level security;
