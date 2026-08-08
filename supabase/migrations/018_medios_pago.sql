-- Medios de pago configurables desde Administración > Medios de Pago.
-- El id se usa como clave estable; el nombre es el texto que ya se
-- guarda en pagos.medio_pago (texto libre, sin FK), así que mantiene
-- compatibilidad con los pagos ya cargados.
create table if not exists medios_pago (
  id text primary key,
  nombre text not null,
  habilitado boolean not null default true,
  orden integer not null default 0
);

insert into medios_pago (id, nombre, habilitado, orden) values
  ('efectivo', 'Efectivo', true, 1),
  ('transferencia', 'Transferencia', true, 2),
  ('mercado_pago', 'Mercado Pago', false, 3)
on conflict (id) do nothing;

alter table medios_pago enable row level security;

create policy "medios_pago_admin_todo" on medios_pago
  for all using (es_administrador()) with check (es_administrador());

create policy "medios_pago_lectura_autenticados" on medios_pago
  for select using (auth.uid() is not null);
