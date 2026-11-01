-- Primera parte de hacer valer en la base el opt-out "no mostrar mi
-- contacto" (migración 030). Hasta ahora la app traía los perfiles de todo
-- el grupo y ocultaba teléfono y redes en pantalla, pero cualquier miembro
-- logueado que consultara la API directamente podía leer el teléfono de
-- quien lo había ocultado.
--
-- Esta migración solo AGREGA la vista `perfiles_directorio`, que devuelve
-- a todo el grupo la foto pero entrega teléfono y redes únicamente de
-- quienes lo permiten (y siempre los propios). Es aditiva: no cambia nada
-- de lo que funciona hoy. La vista se ejecuta con los permisos de su dueño
-- (security_invoker = false, a propósito) para poder leer las filas que el
-- RLS de `perfiles` dejará de mostrar en la migración 039.
--
-- Orden de despliegue: 038 -> publicar el código que lee la vista -> 039.

create or replace view perfiles_directorio with (security_invoker = false) as
select
  p.miembro_id,
  p.foto_url,
  case when p.mostrar_contacto or p.miembro_id = id_miembro_actual() then p.telefono end as telefono,
  case when p.mostrar_contacto or p.miembro_id = id_miembro_actual() then p.red_social_1 end as red_social_1,
  case when p.mostrar_contacto or p.miembro_id = id_miembro_actual() then p.red_social_2 end as red_social_2,
  case when p.mostrar_contacto or p.miembro_id = id_miembro_actual() then p.red_social_3 end as red_social_3
from perfiles p;

revoke all on perfiles_directorio from public, anon, authenticated;
grant select on perfiles_directorio to authenticated, service_role;
