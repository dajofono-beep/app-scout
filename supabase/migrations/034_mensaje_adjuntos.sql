-- Archivos PDF adjuntos a los mensajes. Los archivos viven en un bucket
-- privado (sin políticas, como "comprobantes"): solo se accede desde el
-- servidor con el cliente admin, que genera una URL firmada de corta
-- duración después de comprobar con esta tabla (y su RLS) que quien lo
-- pide puede ver el mensaje.

create table if not exists mensaje_adjuntos (
  id uuid primary key default gen_random_uuid(),
  mensaje_id uuid not null references mensajes(id) on delete cascade,
  nombre text not null,
  ruta text not null,
  tamano integer not null check (tamano > 0),
  created_at timestamptz not null default now()
);

create index if not exists mensaje_adjuntos_mensaje_idx on mensaje_adjuntos (mensaje_id);

alter table mensaje_adjuntos enable row level security;

create policy "mensaje_adjuntos_admin_todo" on mensaje_adjuntos
  for all using (es_administrador()) with check (es_administrador());

-- Se ve un adjunto si se puede ver su mensaje: el "exists" consulta
-- `mensajes` con su propio RLS, así que ya filtra por destinatario,
-- estado activo y vigencia.
create policy "mensaje_adjuntos_lectura_destinatario" on mensaje_adjuntos
  for select using (
    exists (select 1 from mensajes m where m.id = mensaje_id)
  );

grant select, insert, update, delete on mensaje_adjuntos to authenticated, service_role;

insert into storage.buckets (id, name, public)
values ('mensajes-adjuntos', 'mensajes-adjuntos', false)
on conflict (id) do nothing;
