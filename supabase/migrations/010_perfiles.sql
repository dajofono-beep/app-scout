-- Perfil autogestionado por cada miembro: foto, teléfono y redes
-- sociales. Separado de "miembros" (que solo edita el admin) para que
-- cada familia pueda editar libremente estos campos sin necesitar
-- permisos sobre el resto de sus propios datos.
create table if not exists perfiles (
  miembro_id uuid primary key references miembros(id) on delete cascade,
  foto_url text,
  telefono text,
  red_social_1 text,
  red_social_2 text,
  red_social_3 text,
  updated_at timestamptz not null default now()
);

alter table perfiles enable row level security;

create policy "perfiles_ven_lo_propio" on perfiles
  for select using (miembro_id = id_miembro_actual() or es_administrador());
create policy "perfiles_insertan_lo_propio" on perfiles
  for insert with check (miembro_id = id_miembro_actual());
create policy "perfiles_actualizan_lo_propio" on perfiles
  for update using (miembro_id = id_miembro_actual());

-- Bucket público para la foto de perfil (no es información sensible).
insert into storage.buckets (id, name, public)
values ('perfiles', 'perfiles', true)
on conflict (id) do nothing;
