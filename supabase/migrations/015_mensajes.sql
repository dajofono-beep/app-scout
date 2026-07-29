-- Mensajería: el admin redacta mensajes dirigidos a Todos, una Rama, una
-- Familia o un Participante puntual, con vigencia opcional. Las familias
-- solo ven los mensajes que les corresponden y que están vigentes.

create table if not exists mensajes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cuerpo text not null,
  destinatario_tipo text not null check (destinatario_tipo in ('todos', 'rama', 'familia', 'miembro')),
  destinatario_id uuid,
  fecha_inicio date not null default current_date,
  fecha_fin date,
  activo boolean not null default true,
  creado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table mensajes add constraint mensajes_destinatario_valido check (
  (destinatario_tipo = 'todos' and destinatario_id is null) or
  (destinatario_tipo <> 'todos' and destinatario_id is not null)
);
alter table mensajes add constraint mensajes_rango_valido check (
  fecha_fin is null or fecha_fin >= fecha_inicio
);

alter table mensajes enable row level security;

create policy "mensajes_admin_todo" on mensajes
  for all using (es_administrador()) with check (es_administrador());

-- "familia" llega a cualquiera que se loguee como miembro de esa familia;
-- "miembro" llega solo cuando el logueado es exactamente ese participante.
create policy "mensajes_lectura_destinatario" on mensajes
  for select using (
    es_administrador() or (
      activo
      and fecha_inicio <= current_date
      and (fecha_fin is null or fecha_fin >= current_date)
      and (
        destinatario_tipo = 'todos'
        or (destinatario_tipo = 'rama' and destinatario_id = (select rama_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'familia' and destinatario_id = (select familia_id from miembros where id = id_miembro_actual()))
        or (destinatario_tipo = 'miembro' and destinatario_id = id_miembro_actual())
      )
    )
  );
