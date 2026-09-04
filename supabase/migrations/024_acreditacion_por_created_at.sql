-- Migración 024: la acreditación automática a los 4 días debe contarse
-- desde el momento real en que se registró el pago (created_at), no
-- desde la fecha de pago que la familia elige (fecha_pago) — esa fecha
-- puede cargarse retroactiva (ej. "pagué hace 5 días"), y con la regla
-- vieja eso dejaba el pago acreditado al instante, sin darle tiempo al
-- admin a revisarlo.
-- Ejecutar en Supabase > SQL Editor

create or replace view estado_pagos as
select
  p.*,
  case
    when p.estado = 'cancelado' then 'cancelado'
    when p.confirmado_at is not null then 'acreditado'
    when p.created_at + interval '4 days' <= now() then 'acreditado'
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
        and (confirmado_at is not null or created_at + interval '4 days' <= now())
    ) as total_acreditado,
    sum(importe) filter (
      where estado = 'activo'
        and confirmado_at is null
        and created_at + interval '4 days' > now()
    ) as total_pendiente
  from pagos
  group by miembro_id
) p on p.miembro_id = m.id;
