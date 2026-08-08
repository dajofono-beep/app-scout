-- Rastrea el origen de cada pago y los datos de Mercado Pago asociados.
alter table pagos
  add column if not exists origen text not null default 'manual' check (origen in ('manual', 'mercadopago')),
  add column if not exists mp_payment_id text,
  add column if not exists mp_preference_id text;

-- Se recrea de cero (no "or replace"): las columnas nuevas, al venir de
-- p.*, correrían de lugar a estado_efectivo, y Postgres no permite
-- reordenar columnas de una vista con "or replace" (mismo caso que la
-- migración 005).
drop view if exists estado_pagos;
create view estado_pagos as
select
  p.*,
  case
    when p.estado = 'cancelado' then 'cancelado'
    when p.confirmado_at is not null then 'acreditado'
    -- Los pagos de Mercado Pago solo se acreditan cuando su webhook
    -- confirma el pago (confirmado_at) — nunca por el paso del tiempo,
    -- a diferencia de Efectivo/Transferencia, para no dar por acreditado
    -- un intento de pago que nunca se completó.
    when p.origen = 'manual' and p.fecha_pago + interval '4 days' <= now() then 'acreditado'
    else 'pendiente'
  end as estado_efectivo
from pagos p;
