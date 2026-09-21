-- Encuestas: el admin arma preguntas dirigidas a Todos, una Rama, una
-- Familia o un Participante puntual (mismo esquema de destinatario que
-- Mensajes), con opción única o texto libre como respuesta, y un
-- "alcance" que define si se pide una respuesta por chico o una sola
-- compartida entre hermanos. Queda abierta a responder/editar hasta
-- fecha_cierre; después de esa fecha, deja de verse (igual que
-- Mensajes con fecha_fin).

create table if not exists encuestas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  tipo_respuesta text not null check (tipo_respuesta in ('opcion_unica', 'texto_libre')),
  opciones jsonb,
  alcance_respuesta text not null default 'miembro' check (alcance_respuesta in ('miembro', 'familia')),
  destinatario_tipo text not null check (destinatario_tipo in ('todos', 'rama', 'familia', 'miembro')),
  destinatario_id uuid,
  fecha_inicio date not null default current_date,
  fecha_cierre date,
  activo boolean not null default true,
  creado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table encuestas add constraint encuestas_destinatario_valido check (
  (destinatario_tipo = 'todos' and destinatario_id is null) or
  (destinatario_tipo <> 'todos' and destinatario_id is not null)
);
alter table encuestas add constraint encuestas_rango_valido check (
  fecha_cierre is null or fecha_cierre >= fecha_inicio
);
alter table encuestas add constraint encuestas_opciones_valido check (
  tipo_respuesta = 'texto_libre' or jsonb_typeof(opciones) = 'array'
);

alter table encuestas enable row level security;

create policy "encuestas_admin_todo" on encuestas
  for all using (es_administrador()) with check (es_administrador());

-- Mismo criterio que "mensajes_lectura_destinatario": vigente y dirigida
-- a esta rama/familia/miembro (o a todos).
create policy "encuestas_lectura_destinatario" on encuestas
  for select using (
    es_administrador() or (
      activo
      and fecha_inicio <= current_date
      and (fecha_cierre is null or fecha_cierre >= current_date)
      and (
        destinatario_tipo = 'todos'
        or (destinatario_tipo = 'rama' and destinatario_id = (select rama_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'familia' and destinatario_id = (select familia_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'miembro' and destinatario_id = id_miembro_actual())
      )
    )
  );

create table if not exists encuesta_respuestas (
  id uuid primary key default gen_random_uuid(),
  encuesta_id uuid not null references encuestas(id) on delete cascade,
  miembro_id uuid references miembros(id) on delete cascade,
  familia_id uuid references familias(id) on delete cascade,
  respuesta text not null,
  created_at timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- Una respuesta es de un miembro puntual (alcance "miembro") o de una
-- familia entera (alcance "familia"), nunca las dos cosas ni ninguna.
alter table encuesta_respuestas add constraint encuesta_respuestas_alcance_valido check (
  (miembro_id is not null and familia_id is null) or
  (miembro_id is null and familia_id is not null)
);

-- Restricciones simples (no índices parciales): como el estándar SQL
-- nunca considera dos NULL iguales, estas dos conviven sin pisarse — la
-- de miembro_id solo choca entre filas "por chico" (familia_id siempre
-- null ahí) y la de familia_id solo entre filas "por familia". Además,
-- a diferencia de un índice parcial, esta forma sí sirve como blanco de
-- "on conflict" para el upsert de Supabase.
alter table encuesta_respuestas add constraint encuesta_respuestas_miembro_unico
  unique (encuesta_id, miembro_id);
alter table encuesta_respuestas add constraint encuesta_respuestas_familia_unico
  unique (encuesta_id, familia_id);

alter table encuesta_respuestas enable row level security;

create policy "encuesta_respuestas_admin_todo" on encuesta_respuestas
  for all using (es_administrador()) with check (es_administrador());

create policy "encuesta_respuestas_ven_lo_propio" on encuesta_respuestas
  for select using (
    miembro_id = id_miembro_actual()
    or familia_id = (select familia_id from miembros where id = id_miembro_actual())
  );

-- Solo se puede responder por uno mismo (o por la propia familia), y
-- solo mientras la encuesta siga activa y no haya pasado fecha_cierre.
create policy "encuesta_respuestas_responden_lo_propio" on encuesta_respuestas
  for insert with check (
    (
      miembro_id = id_miembro_actual()
      or familia_id = (select familia_id from miembros where id = id_miembro_actual())
    )
    and exists (
      select 1 from encuestas e
      where e.id = encuesta_id
        and e.activo
        and (e.fecha_cierre is null or e.fecha_cierre >= current_date)
    )
  );

create policy "encuesta_respuestas_editan_lo_propio" on encuesta_respuestas
  for update using (
    miembro_id = id_miembro_actual()
    or familia_id = (select familia_id from miembros where id = id_miembro_actual())
  ) with check (
    (
      miembro_id = id_miembro_actual()
      or familia_id = (select familia_id from miembros where id = id_miembro_actual())
    )
    and exists (
      select 1 from encuestas e
      where e.id = encuesta_id
        and e.activo
        and (e.fecha_cierre is null or e.fecha_cierre >= current_date)
    )
  );
