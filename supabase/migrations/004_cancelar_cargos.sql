-- Migración 004: permitir cancelar un cargo puntual (ej. alguien no va
-- a un campamento) y que quede excluido del saldo, igual que ya
-- funciona con los pagos.
-- Ejecutar en Supabase > SQL Editor

alter table cargos
  add column if not exists estado text not null default 'activo'
    check (estado in ('activo', 'cancelado'));

-- La vista de saldos ahora ignora los cargos cancelados.
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
      where estado = 'activo' and fecha_pago + interval '4 days' <= now()
    ) as total_acreditado,
    sum(importe) filter (
      where estado = 'activo' and fecha_pago + interval '4 days' > now()
    ) as total_pendiente
  from pagos
  group by miembro_id
) p on p.miembro_id = m.id;
