-- Links de los grupos de WhatsApp por rama, y si se muestran en Mi
-- Cuenta. Van en una tabla aparte (no como columna de `ramas`) porque
-- `ramas` es de lectura pública (se usa en el selector de la pantalla
-- de login, antes de autenticarse) y estos links no deben quedar
-- expuestos sin loguearse.
create table if not exists grupos_whatsapp (
  rama_id uuid primary key references ramas(id) on delete cascade,
  link text,
  updated_at timestamptz not null default now()
);

alter table grupos_whatsapp enable row level security;

create policy "grupos_whatsapp_admin_todo" on grupos_whatsapp
  for all using (es_administrador()) with check (es_administrador());

create policy "grupos_whatsapp_lectura_autenticados" on grupos_whatsapp
  for select using (auth.uid() is not null);

-- Configuración general de la app (una sola fila, id siempre 1).
create table if not exists configuracion (
  id integer primary key default 1,
  grupos_padres_visible boolean not null default false,
  check (id = 1)
);
insert into configuracion (id) values (1) on conflict (id) do nothing;

alter table configuracion enable row level security;

create policy "configuracion_admin_todo" on configuracion
  for all using (es_administrador()) with check (es_administrador());

create policy "configuracion_lectura_autenticados" on configuracion
  for select using (auth.uid() is not null);
