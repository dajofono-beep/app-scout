-- Vista para la sección "Social": nombre, rama y fecha de nacimiento
-- de los miembros activos de TODO el grupo (no solo la propia
-- familia), para poder mostrar los cumpleaños del mes a todos.
-- Solo autenticados (no anon), a diferencia de miembros_publico, ya
-- que expone fecha_nacimiento.
create or replace view miembros_social as
select id, nombre, apellido, rama_id, fecha_nacimiento
from miembros
where activo = true;

revoke all on miembros_social from anon;
grant select on miembros_social to authenticated;
