-- Migración 002: familias (cuenta corriente conjunta), descuento por
-- hermanos y productos cuotables.
-- Ejecutar en Supabase > SQL Editor (después de supabase/schema.sql)

-- =========================================================
-- FAMILIAS
-- =========================================================

create table if not exists familias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default now()
);

alter table miembros
  add column if not exists familia_id uuid references familias(id) on delete set null,
  add column if not exists orden_familia smallint;

-- =========================================================
-- ESCALA DE DESCUENTOS POR HERMANOS (editable por el admin)
-- =========================================================

create table if not exists escala_descuentos_familia (
  posicion smallint primary key,
  porcentaje numeric(5, 2) not null check (porcentaje >= 0 and porcentaje <= 100)
);

insert into escala_descuentos_familia (posicion, porcentaje) values
  (1, 100),
  (2, 75),
  (3, 50)
on conflict (posicion) do nothing;

-- =========================================================
-- PRODUCTOS: cuotable + descuento por hermanos
-- =========================================================

alter table productos
  add column if not exists es_cuotable boolean not null default false,
  add column if not exists cantidad_cuotas smallint,
  add column if not exists aplica_descuento_hermanos boolean not null default false;

alter table productos
  drop constraint if exists productos_cuotas_check;
alter table productos
  add constraint productos_cuotas_check check (
    (es_cuotable = false) or (cantidad_cuotas is not null and cantidad_cuotas > 0)
  );

-- =========================================================
-- CARGOS: trazabilidad del descuento aplicado (si hubo)
-- =========================================================

alter table cargos
  add column if not exists porcentaje_aplicado numeric(5, 2);

-- =========================================================
-- FUNCIÓN: ids de todos los miembros de mi misma familia
-- (incluye siempre a uno mismo, aunque no tenga familia asignada)
-- =========================================================

create or replace function miembros_de_mi_familia()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m2.id
  from miembros m1
  join miembros m2
    on m2.id = m1.id
    or (m1.familia_id is not null and m2.familia_id = m1.familia_id)
  where m1.auth_user_id = auth.uid();
$$;

-- =========================================================
-- RLS: familias y escala de descuentos (solo admin)
-- =========================================================

alter table familias enable row level security;
create policy "familias_admin_todo" on familias
  for all using (es_administrador()) with check (es_administrador());

alter table escala_descuentos_familia enable row level security;
create policy "escala_descuentos_admin_todo" on escala_descuentos_familia
  for all using (es_administrador()) with check (es_administrador());

-- =========================================================
-- RLS: extender miembros/cargos/pagos a nivel de familia
-- =========================================================

drop policy if exists "miembros_ven_su_fila" on miembros;
create policy "miembros_ven_su_familia" on miembros
  for select using (id in (select miembros_de_mi_familia()));

drop policy if exists "cargos_ven_lo_propio" on cargos;
create policy "cargos_ven_su_familia" on cargos
  for select using (miembro_id in (select miembros_de_mi_familia()));

drop policy if exists "pagos_ven_lo_propio" on pagos;
create policy "pagos_ven_su_familia" on pagos
  for select using (miembro_id in (select miembros_de_mi_familia()));

drop policy if exists "pagos_insertan_lo_propio" on pagos;
create policy "pagos_insertan_su_familia" on pagos
  for insert with check (
    miembro_id in (select miembros_de_mi_familia()) and estado = 'activo'
  );
