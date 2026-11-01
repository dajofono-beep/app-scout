-- Marca de "leído" de los mensajes, por familia: si un hermano marca un
-- mensaje como leído, queda leído para todos los hermanos. Un miembro sin
-- familia asignada se trata como una familia de uno solo (la marca queda
-- a su nombre), igual que en las respuestas de Encuestas.

create table if not exists mensaje_lecturas (
  id uuid primary key default gen_random_uuid(),
  mensaje_id uuid not null references mensajes(id) on delete cascade,
  miembro_id uuid references miembros(id) on delete cascade,
  familia_id uuid references familias(id) on delete cascade,
  leido_at timestamptz not null default now()
);

-- Una marca es de un miembro puntual o de una familia entera, nunca las
-- dos cosas ni ninguna.
alter table mensaje_lecturas add constraint mensaje_lecturas_alcance_valido check (
  (miembro_id is not null and familia_id is null) or
  (miembro_id is null and familia_id is not null)
);

-- Restricciones simples (no índices parciales) por el mismo motivo que en
-- encuesta_respuestas: conviven porque NULL nunca es igual a NULL, y el
-- upsert de Supabase puede usarlas como blanco de "on conflict".
alter table mensaje_lecturas add constraint mensaje_lecturas_miembro_unico
  unique (mensaje_id, miembro_id);
alter table mensaje_lecturas add constraint mensaje_lecturas_familia_unico
  unique (mensaje_id, familia_id);

alter table mensaje_lecturas enable row level security;

create policy "mensaje_lecturas_admin_todo" on mensaje_lecturas
  for all using (es_administrador()) with check (es_administrador());

create policy "mensaje_lecturas_ven_lo_propio" on mensaje_lecturas
  for select using (
    miembro_id = id_miembro_actual()
    or familia_id = (select familia_id from miembros where id = id_miembro_actual())
  );

-- Solo se puede marcar por uno mismo (o por la propia familia) y solo un
-- mensaje que esa persona puede ver: el "exists" consulta `mensajes` con
-- su RLS, así que ya filtra por destinatario y vigencia.
create policy "mensaje_lecturas_marcan_lo_propio" on mensaje_lecturas
  for insert with check (
    (
      miembro_id = id_miembro_actual()
      or familia_id = (select familia_id from miembros where id = id_miembro_actual())
    )
    and exists (select 1 from mensajes m where m.id = mensaje_id)
  );

create policy "mensaje_lecturas_desmarcan_lo_propio" on mensaje_lecturas
  for delete using (
    miembro_id = id_miembro_actual()
    or familia_id = (select familia_id from miembros where id = id_miembro_actual())
  );

grant select, insert, update, delete on mensaje_lecturas to authenticated, service_role;
