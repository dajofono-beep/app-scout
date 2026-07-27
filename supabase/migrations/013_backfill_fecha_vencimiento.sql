-- Relleno único: los cargos creados antes de cargar la fecha de
-- vencimiento en su producto quedaron con fecha_vencimiento en blanco.
-- Esto copia la fecha de vencimiento actual del producto a esos cargos
-- (sin tocar los que ya tengan una fecha propia, por ej. editada a mano).
update cargos c
set fecha_vencimiento = p.fecha_vencimiento
from productos p
where c.producto_id = p.id
  and c.fecha_vencimiento is null
  and p.fecha_vencimiento is not null;
