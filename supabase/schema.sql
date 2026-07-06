-- Esquema inicial: Plataforma de Cuentas Corrientes - Grupo Scout
-- Ejecutar completo en Supabase > SQL Editor

-- =========================================================
-- TABLAS
-- =========================================================

create table if not exists ramas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists administradores (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now()
);

create table if not exists miembros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  dni text not null,
  rama_id uuid not null references ramas(id),
  activo boolean not null default true,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  importe numeric(12, 2) not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cargos (
  id uuid primary key default gen_random_uuid(),
  miembro_id uuid not null references miembros(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  concepto text not null,
  importe numeric(12, 2) not null,
  fecha date not null default current_date,
  creado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  miembro_id uuid not null references miembros(id) on delete cascade,
  importe numeric(12, 2) not null check (importe > 0),
  fecha_pago date not null check (fecha_pago <= current_date),
  medio_pago text,
  comprobante_url text,
  estado text not null default 'activo' check (estado in ('activo', 'cancelado')),
  nota_admin text,
  creado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- =========================================================
-- VISTAS: saldo y pendientes (ventana de 4 días)
-- =========================================================

create or replace view estado_pagos as
select
  p.*,
  case
    when p.estado = 'cancelado' then 'cancelado'
    when p.fecha_pago + interval '4 days' <= now() then 'acreditado'
    else 'pendiente'
  end as estado_efectivo
from pagos p;

create or replace view saldos_miembros as
select
  m.id as miembro_id,
  coalesce(c.total_cargos, 0) as total_cargos,
  coalesce(p.total_acreditado, 0) as total_pagos_acreditados,
  coalesce(p.total_pendiente, 0) as total_pagos_pendientes,
  coalesce(c.total_cargos, 0) - coalesce(p.total_acreditado, 0) as saldo
from miembros m
left join (
  select miembro_id, sum(importe) as total_cargos
  from cargos
  group by miembro_id
) c on c.miembro_id = m.id
left join (
  select
    miembro_id,
    sum(importe) filter (
      where estado = 'activo' and fecha_pago + interval '4 days' <= now()
    ) as total_acreditado,
    sum(importe) filter (
      where estado = 'activo' and fecha_pago + interval '4 days' > now()
    ) as total_pendiente
  from pagos
  group by miembro_id
) p on p.miembro_id = m.id;

-- Vista pública (sin datos sensibles) para el selector rama -> nombre
-- en la pantalla de login, accesible sin autenticación.
create or replace view miembros_publico as
select id, nombre, apellido, rama_id
from miembros
where activo = true;

-- =========================================================
-- FUNCIONES DE APOYO PARA RLS
-- =========================================================

create or replace function es_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from administradores where auth_user_id = auth.uid());
$$;

create or replace function id_miembro_actual()
returns uuid
language sql
stable
as $$
  select id from miembros where auth_user_id = auth.uid();
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table ramas enable row level security;
alter table administradores enable row level security;
alter table miembros enable row level security;
alter table productos enable row level security;
alter table cargos enable row level security;
alter table pagos enable row level security;

-- ramas: lectura pública, escritura solo admin
create policy "ramas_lectura_publica" on ramas
  for select using (true);
create policy "ramas_admin_insertar" on ramas
  for insert with check (es_administrador());
create policy "ramas_admin_actualizar" on ramas
  for update using (es_administrador());
create policy "ramas_admin_eliminar" on ramas
  for delete using (es_administrador());

-- administradores: cada admin ve solo su propia fila
create policy "administradores_ven_su_fila" on administradores
  for select using (auth_user_id = auth.uid());

-- miembros: admin todo, familia solo su propia fila
create policy "miembros_admin_todo" on miembros
  for all using (es_administrador()) with check (es_administrador());
create policy "miembros_ven_su_fila" on miembros
  for select using (auth_user_id = auth.uid());

grant select on miembros_publico to anon, authenticated;
grant select on ramas to anon, authenticated;

-- productos: solo admin
create policy "productos_admin_todo" on productos
  for all using (es_administrador()) with check (es_administrador());

-- cargos: admin todo, familia solo lectura de lo propio
create policy "cargos_admin_todo" on cargos
  for all using (es_administrador()) with check (es_administrador());
create policy "cargos_ven_lo_propio" on cargos
  for select using (miembro_id = id_miembro_actual());

-- pagos: admin todo; familia lee lo propio e inserta pagos propios
-- (activos), pero no puede editar ni cancelar sus propios pagos.
create policy "pagos_admin_todo" on pagos
  for all using (es_administrador()) with check (es_administrador());
create policy "pagos_ven_lo_propio" on pagos
  for select using (miembro_id = id_miembro_actual());
create policy "pagos_insertan_lo_propio" on pagos
  for insert with check (
    miembro_id = id_miembro_actual() and estado = 'activo'
  );
