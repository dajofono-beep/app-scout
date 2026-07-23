-- Migración 005: permitir que el admin confirme (acredite) un pago
-- manualmente, sin esperar los 4 días, sin cambiar la regla automática
-- para el resto de los pagos.
-- Ejecutar en Supabase > SQL Editor

alter table pagos
  add column if not exists confirmado_at timestamptz;

-- Un pago se considera acreditado si el admin lo confirmó manualmente,
-- o si ya pasaron los 4 días (la regla de siempre).
-- Se recrea de cero (no "or replace") porque la columna nueva confirmado_at,
-- al venir de p.*, correría de lugar a la columna calculada estado_efectivo,
-- y Postgres no permite reordenar columnas de una vista con "or replace".
drop view if exists estado_pagos;
create view estado_pagos as
select
  p.*,
  case
    when p.estado = 'cancelado' then 'cancelado'
    when p.confirmado_at is not null then 'acreditado'
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
  where estado = 'activo'
  group by miembro_id
) c on c.miembro_id = m.id
left join (
  select
    miembro_id,
    sum(importe) filter (
      where estado = 'activo'
        and (confirmado_at is not null or fecha_pago + interval '4 days' <= now())
    ) as total_acreditado,
    sum(importe) filter (
      where estado = 'activo'
        and confirmado_at is null
        and fecha_pago + interval '4 days' > now()
    ) as total_pendiente
  from pagos
  group by miembro_id
) p on p.miembro_id = m.id;
