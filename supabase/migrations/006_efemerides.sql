-- Efemérides: fechas anuales recurrentes para la sección "Social"
-- (feriados, días patrios, fechas propias del grupo, etc). Los
-- cumpleaños NO viven acá: se calculan aparte desde
-- miembros.fecha_nacimiento.

create table if not exists efemerides (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  mes int not null check (mes between 1 and 12),
  dia int not null check (dia between 1 and 31),
  mensaje text,
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table efemerides enable row level security;

-- Lectura abierta a cualquier usuario logueado (familias y admin);
-- solo el admin puede crear/editar/borrar.
create policy "efemerides_lectura_autenticada" on efemerides
  for select using (true);
create policy "efemerides_admin_insertar" on efemerides
  for insert with check (es_administrador());
create policy "efemerides_admin_actualizar" on efemerides
  for update using (es_administrador());
create policy "efemerides_admin_eliminar" on efemerides
  for delete using (es_administrador());

-- Bucket público para la imagen/placa de cada efeméride (no es
-- información sensible, a diferencia de "comprobantes").
insert into storage.buckets (id, name, public)
values ('efemerides', 'efemerides', true)
on conflict (id) do nothing;
