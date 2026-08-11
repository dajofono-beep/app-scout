-- Marca qué conceptos participan de la alerta de "próximo vencimiento" en
-- Mi Cuenta (ver conversación 2026-08-11). Por defecto en false: los
-- conceptos ya existentes no entran a la alerta hasta que el admin los
-- marque a mano, uno por uno, desde su ficha.
alter table productos
  add column if not exists alerta_vencimiento boolean not null default false;
