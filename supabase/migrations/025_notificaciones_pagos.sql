-- Migración 025: aviso por mail a los administradores cuando se
-- registra un pago (efectivo/transferencia o Mercado Pago).
--
-- Se envía por SMTP con una cuenta de Gmail del Grupo (no se usa un
-- servicio de mail transaccional tipo Resend porque hoy no hay un
-- dominio propio para verificar el envío). Si el día de mañana cambia
-- la cuenta de correo, se actualiza desde la pantalla "Notificaciones
-- Pagos" sin tocar código.
--
-- Tabla admin-only, mismo patrón que mercadopago_config.
-- Ejecutar en Supabase > SQL Editor

create table if not exists notificaciones_pagos_config (
  id integer primary key default 1,
  email text,
  app_password text,
  activo boolean not null default false,
  updated_at timestamptz not null default now(),
  check (id = 1)
);
insert into notificaciones_pagos_config (id, email)
values (1, 'gs1284libertador@gmail.com')
on conflict (id) do nothing;

alter table notificaciones_pagos_config enable row level security;

create policy "notificaciones_pagos_config_admin_todo" on notificaciones_pagos_config
  for all using (es_administrador()) with check (es_administrador());

-- Cada administrador puede optar por no recibir estos avisos. Por
-- defecto quedan activados para no perderse avisos nuevos sin querer.
alter table administradores
  add column if not exists recibe_notificaciones_pagos boolean not null default true;
